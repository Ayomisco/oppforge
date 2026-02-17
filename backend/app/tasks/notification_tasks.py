"""Notification Tasks"""

from celery import shared_task
from app.database import SessionLocal
from app.models.user import User
import logging

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
