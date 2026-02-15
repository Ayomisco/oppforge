from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List
from .. import database, schemas
from ..models.notification import Notification
from .auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(database.get_db), current_user = Depends(get_current_user)):
    """List all notifications for current user, newest first."""
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()

@router.get("/unread-count")
def unread_count(db: Session = Depends(database.get_db), current_user = Depends(get_current_user)):
    """Get count of unread notifications (for the red dot on Bell icon)."""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"count": count}

@router.put("/{id}/read")
def mark_read(id: uuid.UUID, db: Session = Depends(database.get_db), current_user = Depends(get_current_user)):
    """Mark a single notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "read"}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(database.get_db), current_user = Depends(get_current_user)):
    """Mark all notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "all_read"}
