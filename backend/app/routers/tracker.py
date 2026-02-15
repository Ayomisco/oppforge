from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List
from .. import database, models, schemas
from .auth import get_current_user

router = APIRouter(
    prefix="/tracker",
    tags=["tracker"]
)

@router.get("/", response_model=List[schemas.TrackedAppResponse])
def get_tracked_apps(db: Session = Depends(database.get_db), current_user = Depends(get_current_user)):
    """
    Get all tracked applications for current user.
    """
    return db.query(models.TrackedApplication).filter(
        models.TrackedApplication.user_id == current_user.id
    ).all()

@router.post("/", response_model=schemas.TrackedAppResponse)
def track_opportunity(
    track_data: schemas.TrackedAppCreate, 
    db: Session = Depends(database.get_db), 
    current_user = Depends(get_current_user)
):
    """
    Add an opportunity to tracker.
    """
    # Check if already tracked
    existing = db.query(models.TrackedApplication).filter(
        models.TrackedApplication.user_id == current_user.id,
        models.TrackedApplication.opportunity_id == track_data.opportunity_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Opportunity already tracked")
        
    tracking = models.TrackedApplication(
        user_id=current_user.id,
        opportunity_id=track_data.opportunity_id,
        status=track_data.status,
        notes=track_data.notes
    )
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking

@router.put("/{id}", response_model=schemas.TrackedAppResponse)
def update_tracking(
    id: uuid.UUID, 
    update_data: schemas.TrackedAppUpdate, 
    db: Session = Depends(database.get_db), 
    current_user = Depends(get_current_user)
):
    """
    Update status or notes.
    """
    tracking = db.query(models.TrackedApplication).filter(
        models.TrackedApplication.id == id,
        models.TrackedApplication.user_id == current_user.id
    ).first()
    
    if not tracking:
        raise HTTPException(status_code=404, detail="Tracking entry not found")
        
    if update_data.status:
        tracking.status = update_data.status
    if update_data.notes is not None:
        tracking.notes = update_data.notes
    if update_data.submission_link is not None:
        tracking.submission_link = update_data.submission_link
        
    db.commit()
    db.refresh(tracking)
    return tracking

@router.delete("/{id}")
def delete_tracking(id: uuid.UUID, db: Session = Depends(database.get_db), current_user = Depends(get_current_user)):
    """
    Remove from tracker.
    """
    tracking = db.query(models.TrackedApplication).filter(
        models.TrackedApplication.id == id,
        models.TrackedApplication.user_id == current_user.id
    ).first()
    
    if not tracking:
        raise HTTPException(status_code=404, detail="Tracking entry not found")
        
    db.delete(tracking)
    db.commit()
    return {"status": "deleted"}
