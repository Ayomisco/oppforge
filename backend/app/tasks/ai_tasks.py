"""AI Processing Tasks"""

import os
from celery import shared_task
from app.database import SessionLocal
from app.models.opportunity import Opportunity
import logging
import httpx

logger = logging.getLogger(__name__)

# Read once at module import — picked up from Railway environment variables
AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")


@shared_task
def batch_score_opportunities():
    """
    Score unscored opportunities using the AI Engine.
    Reads AI_ENGINE_URL from environment so it works in both local dev
    and production (Railway), where the AI Engine runs on a separate container.
    """
    db = SessionLocal()
    try:
        # Get open opportunities without AI scores (limit 50 per run to be fast)
        opps = db.query(Opportunity).filter(
            Opportunity.ai_score == None,
            Opportunity.is_open == True
        ).limit(50).all()

        logger.info(f"📊 Scoring {len(opps)} opportunities via {AI_ENGINE_URL}...")
        count = 0

        for opp in opps:
            try:
                response = httpx.post(
                    f"{AI_ENGINE_URL}/ai/score",
                    json={"opportunity": opp.to_dict(), "user_profile": None},
                    timeout=30
                )

                if response.status_code == 200:
                    data = response.json().get("data", {})
                    opp.ai_score = data.get("overall_score", 0)
                    count += 1
                else:
                    logger.warning(f"AI Engine returned {response.status_code} for opp {opp.id}")

            except Exception as e:
                logger.error(f"Error scoring {opp.id}: {e}")

        db.commit()
        logger.info(f"✅ Scored {count} opportunities")
        return {"scored": count}

    finally:
        db.close()


@shared_task
def batch_risk_assessment():
    """
    Assess risk for opportunities that haven't been risk-scored yet.
    Reads AI_ENGINE_URL from environment — critical for production where
    the AI Engine is NOT on localhost.
    Also persists risk_flags for display on the frontend.
    """
    db = SessionLocal()
    try:
        opps = db.query(Opportunity).filter(
            Opportunity.risk_score == None,
            Opportunity.is_open == True
        ).limit(50).all()

        logger.info(f"🛡️ Assessing risk for {len(opps)} opportunities via {AI_ENGINE_URL}...")
        count = 0

        for opp in opps:
            try:
                response = httpx.post(
                    f"{AI_ENGINE_URL}/ai/risk-assess",
                    json={"opportunity": opp.to_dict()},
                    timeout=30
                )

                if response.status_code == 200:
                    data = response.json().get("data", {})
                    opp.risk_score = data.get("risk_score")
                    opp.risk_level = data.get("risk_level")
                    opp.risk_flags = data.get("flags", [])  # Persist flags for UI display
                    count += 1
                else:
                    logger.warning(f"Risk Engine returned {response.status_code} for opp {opp.id}")

            except Exception as e:
                logger.error(f"Error assessing risk for {opp.id}: {e}")

        db.commit()
        logger.info(f"✅ Risk-assessed {count} opportunities")
        return {"assessed": count}

    finally:
        db.close()
