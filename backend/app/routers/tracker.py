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
    """
    tracking = db.query(models.TrackedApplication).filter(
        models.TrackedApplication.id == id,
        models.TrackedApplication.user_id == current_user.id
    ).first()
    
    if not tracking:
        raise HTTPException(status_code=404, detail="Tracking entry not found")
        
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
    
    try:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            return {"draft": "Forging error: AI service not configured. Set GROQ_API_KEY."}
            
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.1-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are Forge AI, an elite Web3 mission strategist."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7
                },
                timeout=20.0
            )
            data = resp.json()
            draft_content = data["choices"][0]["message"]["content"]
            
            # Save a snapshot to the tracking record
            tracking.ai_strategy_notes = draft_content
            db.commit()
            
            return {"draft": draft_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Agent failed to forge draft: {str(e)}")
