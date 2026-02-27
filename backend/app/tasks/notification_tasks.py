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
    """Send daily opportunity digest to users"""
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.email_notifications == True).all()
        
        logger.info(f"📧 Sending digests to {len(users)} users...")
        
        # TODO: Implement email sending
        
        logger.info(f"✅ Digests sent")
        return {"sent": len(users)}
        
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

@shared_task
def check_trial_expirations():
    """Daily check for users on 14-day trials. Sends 3-day and 1-day reminders, and expires if > 14 days."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    try:
        # Find all users currently trialing
        trialing_users = db.query(User).filter(User.subscription_status == "trialing").all()
        
        emails_sent = 0
        expired_count = 0
        
        for user in trialing_users:
            if not user.trial_started_at:
                continue
                
            trial_start = user.trial_started_at
            if trial_start.tzinfo is None:
                trial_start = trial_start.replace(tzinfo=timezone.utc)
                
            days_elapsed = (now - trial_start).days
            days_left = 14 - days_elapsed
            
            # Logic: Send reminders or expire
            subject = None
            body = None
            
            if days_left == 3:
                subject = "3 Days Left in your OppForge Trial ⏳"
                body = "Your 14-day full access Scout trial is ending in exactly 3 days. Upgrade to Hunter to keep your priority alpha feeds, AI proposal drafts, and unlimited Forge Assistant access."
            elif days_left == 1:
                subject = "Urgent: OppForge Premium Access Ending Tomorrow ⚠️"
                body = "Your trial ends tomorrow. Your intelligence dashboard will lock and you will lose access to premium matched bounties and grants. Secure your Hunter pass now to stay ahead of the ecosystem."
            elif days_left <= 0:
                # Expire the user
                user.subscription_status = "expired"
                expired_count += 1
                subject = "OppForge Trial Expired 🔒"
                body = "Your 14-day trial has concluded. Your premium features have been blurred and locked. Upgrade now to unlock your matched opportunities and continue forging..."
            
            # Send Email if applicable
            if subject and body and user.email and "@web3.internal" not in user.email:
                if user.notification_settings and user.notification_settings.get("marketing_emails", True):
                    html = get_email_template(subject, body, "https://app.oppforge.xyz/dashboard/subscription", "Upgrade Protocol")
                    try:
                        asyncio.run(send_email(user.email, subject, html))
                        emails_sent += 1
                    except Exception as e:
                        logger.error(f"[TrialCheck] EMail Failed for {user.email}: {e}")
                        
        db.commit()
        logger.info(f"[TrialCheck] Sent {emails_sent} reminders. Expired {expired_count} users.")
        return {"reminders_sent": emails_sent, "expired": expired_count}
    finally:
        db.close()
