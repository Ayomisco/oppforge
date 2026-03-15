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

@router.post("", response_model=schemas.OpportunityResponse)
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

@router.get("", response_model=List[schemas.OpportunityResponse])
def read_opportunities(
    page: int = 1,
    skip: int = 0, 
    limit: int = 50, 
    category: Optional[str] = None,
    chain: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    from datetime import datetime
    # Open and not expired
    query = db.query(Opportunity).filter(
        Opportunity.is_open != False,
        or_(
            Opportunity.deadline == None,
            Opportunity.deadline >= datetime.now()
        )
    )
    
    if category and category.lower() not in ("all", ""):
        query = query.filter(Opportunity.category.ilike(category))
    
    if chain and chain.lower() not in ("all", ""):
        query = query.filter(Opportunity.chain.ilike(chain))

    # Support both page-based and skip-based pagination
    offset = max(0, (page - 1) * limit) if page > 1 else skip
    return query.order_by(desc(Opportunity.created_at)).offset(offset).limit(limit).all()

@router.get("/search", response_model=List[schemas.OpportunityResponse])
def search_opportunities(
    q: str = Query(..., min_length=3),
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(database.get_db)
):
    """
    Full-text search on title, description, and tags.
    """
    from datetime import datetime
    search_term = f"%{q}%"
    offset = max(0, (page - 1) * limit)
    return db.query(Opportunity).filter(
        Opportunity.is_open != False,
        or_(
            Opportunity.deadline == None,
            Opportunity.deadline >= datetime.now()
        ),
        or_(
            Opportunity.title.ilike(search_term),
            Opportunity.description.ilike(search_term),
        )
    ).order_by(desc(Opportunity.created_at)).offset(offset).limit(limit).all()

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
    Personalized priority stream.
    Returns ALL open/future opportunities sorted by AI score + user match bonus.
    Fast: no per-item AI engine calls — uses pre-computed scores from DB.
    """
    from datetime import datetime
    
    # Base query: open and not expired
    query = db.query(Opportunity).filter(
        Opportunity.is_open == True,
        or_(
            Opportunity.deadline == None,
            Opportunity.deadline >= datetime.now()
        )
    )
    
    # Get ALL opportunities (no limit) for consistent counts
    all_opps = query.order_by(
        Opportunity.deadline.asc().nullslast(),
        desc(Opportunity.created_at)
    ).all()
    
    if current_user:
        user_skills = set(s.lower() for s in (current_user.skills or []))
        user_chains = set(c.lower() for c in (current_user.preferred_chains or []))
        
        for opp in all_opps:
            base_score = opp.ai_score or 0
            # Ensure base_score is int
            if isinstance(base_score, float):
                base_score = int(round(base_score * 100)) if base_score < 1.0 else int(round(base_score))
            match_bonus = 0
            opp_tags = set(t.lower() for t in (opp.tags or []))
            opp_reqs = set(r.lower() for r in (opp.required_skills or []))
            
            skill_matches = user_skills.intersection(opp_tags.union(opp_reqs))
            match_bonus += len(skill_matches) * 5
            if opp.chain and opp.chain.lower() in user_chains:
                match_bonus += 10
            
            opp.ai_score = min(base_score + match_bonus, 100)
        
        all_opps.sort(key=lambda x: (x.ai_score or 0), reverse=True)
    
    return all_opps

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
