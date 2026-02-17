"""AI Processing Tasks"""

from celery import shared_task
from app.database import SessionLocal
from app.models.opportunity import Opportunity
import logging
import httpx

logger = logging.getLogger(__name__)

@shared_task
def batch_score_opportunities():
    """Score unscored opportunities using AI Engine"""
    db = SessionLocal()
    try:
        # Get opportunities without AI scores
        opps = db.query(Opportunity).filter(Opportunity.ai_score == None).limit(50).all()
        
        logger.info(f"📊 Scoring {len(opps)} opportunities...")
        count = 0
        
        for opp in opps:
            try:
                # Call AI Engine
                response = httpx.post(
                    "http://localhost:8001/ai/score",
                    json={"opportunity": opp.to_dict(), "user_profile": None},
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()["data"]
                    opp.ai_score = data["overall_score"]
                    count += 1
                    
            except Exception as e:
                logger.error(f"Error scoring {opp.id}: {e}")
        
        db.commit()
        logger.info(f"✅ Scored {count} opportunities")
        return {"scored": count}
        
    finally:
        db.close()


@shared_task
def batch_risk_assessment():
    """Assess risk for opportunities without risk scores"""
    db = SessionLocal()
    try:
        opps = db.query(Opportunity).filter(Opportunity.risk_score == None).limit(50).all()
        
        logger.info(f"🛡️ Assessing risk for {len(opps)} opportunities...")
        count = 0
        
        for opp in opps:
            try:
                response = httpx.post(
                    "http://localhost:8001/ai/risk-assess",
                    json={"opportunity": opp.to_dict()},
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()["data"]
                    opp.risk_score = data["risk_score"]
                    opp.risk_level = data["risk_level"]
                    count += 1
                    
            except Exception as e:
                logger.error(f"Error assessing {opp.id}: {e}")
        
        db.commit()
        logger.info(f"✅ Assessed {count} opportunities")
        return {"assessed": count}
        
    finally:
        db.close()
