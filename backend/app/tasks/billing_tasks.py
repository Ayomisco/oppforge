from celery import shared_task
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from app.database import SessionLocal
from app.models.user import User
from app.services.email_service import send_email, get_email_template

logger = logging.getLogger(__name__)

@shared_task
def check_subscription_expirations():
    """
    Daily task to check for trial and subscription expirations.
    Handles warnings and actual expiration logic.
    """
    db = SessionLocal()
    try:
        now = datetime.now()
        
        # 1. ⚠️ Trial Ending Warning (2 days left)
        # 7 day trial - 5 days used = 2 days left
        warning_target = now - timedelta(days=5)
        users_to_warn = db.query(User).filter(
            User.subscription_status == "trialing",
            User.trial_started_at <= warning_target,
            User.role != "admin" # Admins are immune
        ).all()
        
        for user in users_to_warn:
            logger.info(f"Sending trial warning to {user.email}")
            body = """
            <h3>Your Alpha Trial is ending soon!</h3>
            <p>You have <b>2 days left</b> of full AI-powered mission intelligence.</p>
            <p>Upgrade to <b>Hunter</b> now to keep your edge and ensure you never miss a high-yield opportunity.</p>
            """
            template = get_email_template(
                title="Forge Alert: Trial Ending",
                body=body,
                cta_link="https://app.oppforge.xyz/dashboard/subscription",
                cta_text="Secure My Access"
            )
            send_email(user.email, "Action Required: Your OppForge Trial Ends in 2 Days", template)

        # 2. 🛑 Trial Expired
        seven_days_ago = now - timedelta(days=7)
        expired_trials = db.query(User).filter(
            User.subscription_status == "trialing",
            User.trial_started_at <= seven_days_ago,
            User.role != "admin"
        ).all()
        
        for user in expired_trials:
            logger.info(f"Expiring trial for {user.email}")
            user.subscription_status = "expired"
            user.is_pro = False
            
            body = """
            <h3>Mission Intelligence: OFFLINE</h3>
            <p>Your 7-day Alpha Trial has expired. Your advanced AI features have been soft-locked.</p>
            <p>But the forge is still hot. You can restore full access instantly by upgrading to a permanent plan.</p>
            """
            template = get_email_template(
                title="Protocol Alert: Access Locked",
                body=body,
                cta_link="https://app.oppforge.xyz/dashboard/subscription",
                cta_text="Restore Full Access"
            )
            send_email(user.email, "OppForge Status: Protocol Access Expired", template)

        # 3. 💳 Paid Subscription Expiration
        expired_paid_subs = db.query(User).filter(
            User.subscription_status == "active",
            User.subscription_expires_at <= now,
            User.role != "admin"
        ).all()
        
        for user in expired_paid_subs:
            logger.info(f"Expiring paid sub for {user.email}")
            user.subscription_status = "expired"
            user.is_pro = False
            # Option: downgrade to trial if they never used it, or just scout
            user.tier = "scout" 
            
            body = """
            <h3>Protocol Update: Subscription Expired</h3>
            <p>Your paid period has concluded. High-priority signals and AI features have been restricted.</p>
            <p>Renew your subscription to continue forging your Web3 destiny.</p>
            """
            template = get_email_template(
                title="Forge Notice: Subscription Concluded",
                body=body,
                cta_link="https://app.oppforge.xyz/dashboard/subscription",
                cta_text="Renew Subscription"
            )
            send_email(user.email, "OppForge Update: Subscription Expired", template)

        db.commit()
    except Exception as e:
        logger.error(f"Error in check_subscription_expirations: {e}")
        db.rollback()
    finally:
        db.close()
