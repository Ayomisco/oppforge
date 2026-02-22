from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import uuid
import os
from sqlalchemy import or_, desc
from typing import List, Optional
from .. import database, schemas
from ..models.opportunity import Opportunity
from .auth import get_current_user, get_optional_user

from ..models.enums import UserRole

router = APIRouter(prefix="/opportunities", tags=["opportunities"])

@router.post("/", response_model=schemas.OpportunityResponse)
def create_opportunity(
    payload: schemas.OpportunityCreate,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """
    Admin Only: Manually upload an opportunity.
    Bypasses automated scraping.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can manually deploy missions."
        )
    
    # Check for duplicate URL
    existing = db.query(Opportunity).filter(Opportunity.url == payload.url).first()
    if existing:
        raise HTTPException(status_code=400, detail="Opportunity with this URL already exists.")

    new_opp = Opportunity(**payload.model_dump())
    new_opp.source = "manual"
    new_opp.is_verified = True # Admin uploads are pre-verified
    
    db.add(new_opp)
    
    # Audit Log
    from ..models.audit import AuditLog
    audit = AuditLog(
        action="manual_deployment",
        user_id=current_user.id,
        target_id=str(new_opp.id),
        details=f"Admin {current_user.email} deployed mission: {new_opp.title}",
        type="data",
        payload=payload.model_dump()
    )
    db.add(audit)
    
    db.commit()
    db.refresh(new_opp)
    return new_opp

@router.get("/", response_model=List[schemas.OpportunityResponse])
def read_opportunities(
    skip: int = 0, 
    limit: int = 20, 
    category: Optional[str] = None,
    chain: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(Opportunity).filter(Opportunity.is_open == True)
    
    if category and category != "All":
        query = query.filter(Opportunity.category == category)
    
    if chain and chain != "All":
        query = query.filter(Opportunity.chain == chain)
        
    return query.order_by(desc(Opportunity.created_at)).offset(skip).limit(limit).all()

@router.get("/search", response_model=List[schemas.OpportunityResponse])
def search_opportunities(
    q: str = Query(..., min_length=3),
    db: Session = Depends(database.get_db)
):
    """
    Full-text search on title, description, and tags.
    """
    search_term = f"%{q}%"
    return db.query(Opportunity).filter(
        or_(
            Opportunity.title.ilike(search_term),
            Opportunity.description.ilike(search_term),
            # Opportunity.tags.cast(String).ilike(search_term) # JSON casting varies by DB
        )
    ).limit(50).all()

@router.get("/trending", response_model=List[schemas.OpportunityResponse])
def get_trending(db: Session = Depends(database.get_db)):
    """
    Top 10 opportunities by AI Score.
    """
    return db.query(Opportunity).order_by(desc(Opportunity.ai_score)).limit(10).all()

@router.get("/priority", response_model=List[schemas.OpportunityResponse])
def get_priority_stream(
    db: Session = Depends(database.get_db), 
    current_user = Depends(get_optional_user)
):
    """
    Personalized stream based on user skills and preferred chains.
    Calculates a dynamic score: AI Base Score + Match Bonus.
    Only shows current/future opportunities (not expired).
    """
    from datetime import datetime
    
    # Filter: is_open AND (no deadline OR deadline >= today)
    # Order by: deadline ASC (soonest first), then created_at DESC (newest first)
    all_opps = db.query(Opportunity).filter(
        Opportunity.is_open == True,
        or_(
            Opportunity.deadline == None,
            Opportunity.deadline >= datetime.now()
        )
    ).order_by(
        Opportunity.deadline.asc().nullslast(),  # Soonest deadlines first, no deadline at end
        desc(Opportunity.created_at)  # Then newest first
    ).all()
    
    # Build User Profile for AI Engine
    user_profile = None
    if current_user:
        user_profile = {
            "skills": current_user.skills,
            "experience_level": current_user.experience_level,
            "preferred_chains": current_user.preferred_chains,
            "bio": current_user.bio
        }
    
    AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")
    
    scored_opps = []
    
    # Batch process for performance or individual calls (individual for now)
    for opp in all_opps:
        # 1. Start with AI Engine Semantic Score
        semantic_score = None
        try:
            import requests # Fast synchronous for this loop
            resp = requests.post(
                f"{AI_ENGINE_URL}/ai/match-score",
                json={
                    "opportunity": {
                        "title": opp.title,
                        "description": opp.description,
                        "tags": opp.tags
                    },
                    "user_profile": user_profile
                },
                timeout=0.5 # Fail fast
            )
            if resp.status_code == 200:
                semantic_score = resp.json().get("match_score")
        except:
            pass

        if semantic_score is not None:
            opp.ai_score = semantic_score
        else:
            # Fallback to manual match scoring (Heuristic)
            if current_user:
                user_skills = set(current_user.skills or [])
                user_chains = set(current_user.preferred_chains or [])
                match_bonus = 0
                opp_tags = set(opp.tags or [])
                opp_reqs = set(opp.required_skills or [])
                
                skill_matches = user_skills.intersection(opp_tags.union(opp_reqs))
                match_bonus += len(skill_matches) * 5
                if opp.chain in user_chains:
                    match_bonus += 10
                    
                opp.ai_score = min(opp.ai_score + match_bonus, 100)
            else:
                pass # Baseline scores for guests
                
        scored_opps.append(opp)
        
    scored_opps.sort(key=lambda x: x.ai_score, reverse=True)
    return scored_opps[:20]

@router.get("/testnets", response_model=List[schemas.OpportunityResponse])
def get_testnets(db: Session = Depends(database.get_db)):
    """
    Returns only testnet opportunities for the side widget.
    """
    return db.query(Opportunity).filter(Opportunity.category == "Testnet").limit(5).all()

@router.get("/{id}", response_model=schemas.OpportunityResponse)
def read_opportunity(id: uuid.UUID, db: Session = Depends(database.get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if opp is None:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@router.delete("/{id}")
def delete_opportunity(
    id: uuid.UUID, 
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    
    db.delete(opp)
    
    # Audit
    from ..models.audit import AuditLog
    db.add(AuditLog(
        action="opportunity_deleted",
        user_id=current_user.id,
        target_id=str(id),
        details=f"Admin deleted mission: {opp.title}",
        type="security"
    ))
    
    db.commit()
    return {"status": "success"}

@router.patch("/{id}/verify")
def verify_opportunity(
    id: uuid.UUID, 
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    
    opp.is_verified = True
    opp.trust_score = 100
    
    # Audit
    from ..models.audit import AuditLog
    db.add(AuditLog(
        action="opportunity_verified",
        user_id=current_user.id,
        target_id=str(id),
        details=f"Admin verified mission: {opp.title}",
        type="data"
    ))
    
    db.commit()
    return {"status": "success"}
