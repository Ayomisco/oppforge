from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import os
import httpx
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

@router.post("/{id}/draft")
async def generate_draft(
    id: uuid.UUID, 
    db: Session = Depends(database.get_db), 
    current_user = Depends(get_current_user)
):
    """
    Generates an AI-powered application draft for a tracked opportunity.
    Accepts either a Tracking Entry ID or an Opportunity ID.
    """
    # Try looking up as Tracking ID first
    tracking = db.query(models.TrackedApplication).filter(
        models.TrackedApplication.id == id,
        models.TrackedApplication.user_id == current_user.id
    ).first()
    
    # If not found, try looking up as Opportunity ID
    if not tracking:
        tracking = db.query(models.TrackedApplication).filter(
            models.TrackedApplication.opportunity_id == id,
            models.TrackedApplication.user_id == current_user.id
        ).first()
    
    if not tracking:
        raise HTTPException(status_code=404, detail="Tracking entry not found for this user/id")
        
    opp = tracking.opportunity
    
    # Prompt Construction
    prompt = f"""
    Act as a Web3 Application Advisor. Generate a high-fidelity application draft for a mission.
    
    USER PROFILE:
    - Name: {current_user.full_name}
    - Bio: {current_user.bio}
    - Skills: {", ".join(current_user.skills or [])}
    
    MISSION DETAILS:
    - Title: {opp.title}
    - Category: {opp.category}
    - Requirements: {", ".join(opp.required_skills or [])}
    - Briefing: {opp.ai_summary}
    
    GOAL: Write a 3-paragraph compelling proposal/application draft. 
    1. Professional greeting and 'Why Me' based on user bio.
    2. Tactical approach based on mission briefing.
    3. Call to action.
    
    Output in Markdown format.
    """
    
    # Call AI Engine for specialized drafting
    AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")
    
    ai_request = {
        "message": f"MISSION_DRAFT_REQUEST: {opp.title}. Structure it as a 3-paragraph compelling proposal. Tone: Professional, Data-driven.",
        "user_profile": {
            "full_name": current_user.full_name,
            "bio": current_user.bio,
            "skills": current_user.skills or []
        },
        "opportunity": {
            "title": opp.title,
            "description": opp.description,
            "category": opp.category,
            "ai_summary": opp.ai_summary
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{AI_ENGINE_URL}/ai/chat",
                json=ai_request,
                timeout=45.0
            )
            if resp.status_code == 200:
                draft_content = resp.json().get("response", "AI Engine failed to return a draft.")
                # Save snapshot
                tracking.ai_strategy_notes = draft_content
                db.commit()
                return {"draft": draft_content}
            else:
                return {"draft": f"AI Engine error: {resp.status_code}"}
    except Exception as e:
        return {"draft": f"Communication error: {str(e)}"}
