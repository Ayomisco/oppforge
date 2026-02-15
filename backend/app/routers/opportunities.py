from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from .. import database, schemas
from ..models.opportunity import Opportunity
from .auth import get_current_user

router = APIRouter(prefix="/opportunities", tags=["opportunities"])

@router.get("/", response_model=List[schemas.OpportunityResponse])
def read_opportunities(
    skip: int = 0, 
    limit: int = 20, 
    category: Optional[str] = None,
    chain: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(Opportunity)
    
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
    current_user = Depends(get_current_user)
):
    """
    Personalized stream based on user skills and preferred chains.
    Calculates a dynamic score: AI Base Score + Match Bonus.
    """
    all_opps = db.query(Opportunity).filter(Opportunity.is_open == True).all()
    
    scored_opps = []
    user_skills = set(current_user.skills or [])
    user_chains = set(current_user.preferred_chains or [])
    
    for opp in all_opps:
        match_bonus = 0
        opp_tags = set(opp.tags or [])
        opp_reqs = set(opp.required_skills or [])
        
        # Skill Match Bonus (+5 per skill)
        skill_matches = user_skills.intersection(opp_tags.union(opp_reqs))
        match_bonus += len(skill_matches) * 5
        
        # Chain Match Bonus (+10)
        if opp.chain in user_chains:
            match_bonus += 10
            
        # Add a dynamic 'match_score' attribute for the response
        # In a real app, we'd probably save this or return it in a wrapper
        # For now, we'll just sort by (ai_score + match_bonus)
        opp.ai_score = min(opp.ai_score + match_bonus, 100)
        scored_opps.append(opp)
        
    # Sort by the updated score
    scored_opps.sort(key=lambda x: x.ai_score, reverse=True)
    
    return scored_opps[:20]

@router.get("/testnets", response_model=List[schemas.OpportunityResponse])
def get_testnets(db: Session = Depends(database.get_db)):
    """
    Returns only testnet opportunities for the side widget.
    """
    return db.query(Opportunity).filter(Opportunity.category == "Testnet").limit(5).all()

@router.get("/{id}", response_model=schemas.OpportunityResponse)
def read_opportunity(id: int, db: Session = Depends(database.get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if opp is None:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp
