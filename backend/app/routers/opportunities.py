from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import database, schemas
from ..models import Opportunity as OppModel
from .auth import get_current_user

router = APIRouter(
    prefix="/opportunities",
    tags=["opportunities"]
)

@router.get("/", response_model=List[schemas.OpportunityResponse])
def get_opportunities(
    skip: int = 0, 
    limit: int = 50,
    category: Optional[str] = None,
    chain: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    """
    List opportunities with filters and search.
    """
    query = db.query(OppModel).filter(OppModel.is_open == True)
    
    if category:
        query = query.filter(OppModel.category == category)
    if chain:
        query = query.filter(OppModel.chain == chain)
    if difficulty:
        query = query.filter(OppModel.difficulty == difficulty)
    if search:
        query = query.filter(OppModel.title.ilike(f"%{search}%"))
        
    # Sort by AI Score Descending by default (Best opps first)
    query = query.order_by(OppModel.ai_score.desc())
        
    return query.offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.OpportunityResponse)
def get_opportunity(id: int, db: Session = Depends(database.get_db)):
    """
    Get detailed view of a single opportunity.
    """
    opp = db.query(OppModel).filter(OppModel.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    # Increment view count
    opp.views_count += 1
    db.commit()
    return opp

@router.get("/trending", response_model=List[schemas.OpportunityResponse])
def get_trending(limit: int = 5, db: Session = Depends(database.get_db)):
    """
    Get top opportunities by AI Score.
    """
    return db.query(OppModel).filter(OppModel.is_open == True)\
        .order_by(OppModel.ai_score.desc()).limit(limit).all()
