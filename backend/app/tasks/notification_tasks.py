"""Notification Tasks"""

from celery import shared_task
from app.database import SessionLocal
from app.models.user import User
from app.models.tracking import TrackedApplication
from app.models.opportunity import Opportunity
from app.services.email_service import get_email_template, send_email
import logging
from datetime import datetime, timedelta, timezone
import asyncio

logger = logging.getLogger(__name__)

@shared_task
def send_daily_digests():
    """Send daily opportunity digest to users with email notifications enabled."""
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.email_notifications == True).all()
        logger.info(f"📧 Sending digests to {len(users)} users...")

        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(days=1)

        # Get new opportunities from the last 24h
        new_opps = db.query(Opportunity).filter(
            Opportunity.created_at >= yesterday,
            Opportunity.is_open == True,
        ).order_by(Opportunity.ai_score.desc().nullslast()).limit(10).all()

        if not new_opps:
            logger.info("📭 No new opportunities to digest.")
            return {"sent": 0, "reason": "no_new_opps"}

        # Build opportunity list HTML
        def build_opp_rows(opps):
            rows = ""
            for opp in opps:
                score = opp.ai_score or 0
                reward = opp.reward_pool or "Unspecified"
                rows += f"""
            <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 12px 8px; color: #F8FAFC; font-weight: 600;">{opp.title}</td>
                <td style="padding: 12px 8px; color: #94A3B8;">{opp.category or 'Unknown'}</td>
                <td style="padding: 12px 8px; color: #10B981;">{reward}</td>
                <td style="padding: 12px 8px; color: #FFAA00; text-align: center;">{score}</td>
            </tr>"""
            return rows

        sent_count = 0
        for user in users:
            if not user.email:
                continue
            
            # Respect user notification preferences
            prefs = user.notification_settings or {}
            
            # Skip if frequency is instant (they already get realtime alerts, no digest)
            freq = prefs.get("frequency", "instant")
            # daily digest goes to users who want daily or instant
            if freq == "weekly":
                continue
            
            # Filter opportunities by user's category preferences
            user_cats = prefs.get("categories", [])
            cat_map = {"grants": "grant", "hackathons": "hackathon", "bounties": "bounty",
                       "airdrops": "airdrop", "testnets": "testnet", "ambassador": "ambassador", "jobs": "job"}
            allowed_cats = [cat_map.get(c, c) for c in user_cats] if user_cats else []
            
            # Filter by AI score threshold
            score_threshold = prefs.get("ai_score_threshold", 0)
            
            user_opps = []
            for opp in new_opps:
                if allowed_cats and (opp.category or "").lower() not in allowed_cats:
                    continue
                if (opp.ai_score or 0) < score_threshold:
                    continue
                user_opps.append(opp)
            
            if not user_opps:
                continue
            opp_rows = build_opp_rows(user_opps)
            title = f"🔥 {len(user_opps)} New Opportunities Today"
            body = f"""
            Hey {user.full_name or user.username or 'Explorer'},<br><br>
            Here are the freshest web3 opportunities curated for you today:<br><br>
            <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="border-bottom: 2px solid #FF5500;">
                    <th style="text-align:left; padding:8px; color:#FF5500; font-size:12px;">MISSION</th>
                    <th style="text-align:left; padding:8px; color:#FF5500; font-size:12px;">TYPE</th>
                    <th style="text-align:left; padding:8px; color:#FF5500; font-size:12px;">REWARD</th>
                    <th style="text-align:center; padding:8px; color:#FF5500; font-size:12px;">SCORE</th>
                </tr>
                {opp_rows}
            </table>
            <br>Don't miss out — the best opportunities go fast.
            """
            html = get_email_template(title, body, "https://app.oppforge.xyz/dashboard", "View All Opportunities")
            try:
                asyncio.run(send_email(user.email, title, html))
                sent_count += 1
            except Exception as e:
                logger.error(f"[DailyDigest] Failed for {user.email}: {e}")

        logger.info(f"✅ Digests sent to {sent_count} users")
        return {"sent": sent_count}

    finally:
        db.close()

@shared_task
def send_deadline_reminders():
    """Send email reminders 48h/24h before tracked opportunity deadline."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    try:
        # Find all tracked applications with an opportunity deadline in 48h or 24h
        soon = now + timedelta(hours=48)
        very_soon = now + timedelta(hours=24)
        # Only for open opportunities and not already submitted
        tracked = db.query(TrackedApplication).join(Opportunity).filter(
            TrackedApplication.status.in_(["Interested", "Drafted", "Applied", "In Review"]),
            Opportunity.deadline != None,
            Opportunity.is_open == True,
            TrackedApplication.submission_date == None
        ).all()
        reminders_sent = 0
        for t in tracked:
            opp = t.opportunity
            user = t.user
            if not user or not opp or not user.email:
                continue
            # Only if user has email alerts enabled
            if not user.notification_settings or not user.notification_settings.get("email_alerts", True):
                continue
            # Calculate time to deadline
            if not opp.deadline:
                continue
            hours_left = (opp.deadline - now).total_seconds() / 3600
            if 23 < hours_left <= 25:
                timing = "24"
            elif 47 < hours_left <= 49:
                timing = "48"
            else:
                continue
            # Compose and send email
            title = f"⏰ {timing}h Reminder: {opp.title} deadline approaching"
            body = f"This is a reminder that the opportunity <b>{opp.title}</b> is closing in {timing} hours.<br><br>Deadline: <b>{opp.deadline.strftime('%Y-%m-%d %H:%M UTC')}</b><br>Category: {opp.category}<br>Reward: {opp.reward_pool or 'Unspecified'}<br><br>Don't miss your chance!"
            cta_link = opp.url
            html = get_email_template(title, body, cta_link, "View Opportunity")
            # Use asyncio to run async send_email in sync context
            try:
                asyncio.run(send_email(user.email, title, html))
                reminders_sent += 1
            except Exception as e:
                logger.error(f"[DeadlineReminder] Failed for {user.email}: {e}")
        logger.info(f"[DeadlineReminder] Sent {reminders_sent} reminders.")
        return {"reminders_sent": reminders_sent}
    finally:
        db.close()
