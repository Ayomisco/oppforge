from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import database, models
from .auth import get_current_user

router = APIRouter(
    prefix="/stats",
    tags=["stats"]
)

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user = Depends(get_current_user)):
    """
    Returns Mission Control stats:
    - Active Grants
    - Closing Soon
    - Win Probability (Avg of user's tracked opps)
    - Total Pool (Sum of active opps)
    """
    
    # Active Grants
    active_count = db.query(models.Opportunity).filter(
        models.Opportunity.is_open == True,
        models.Opportunity.category.in_(["Grant", "Hackathon", "Bounty"])
    ).count()
    
    # Closing Soon (Next 7 days)
    # closing_soon = db.query(models.Opportunity).filter(...) # Add date logic
    closing_soon = 12 # Mock for now or implement logic
    
    # Win Probability (Mock logic based on user stats)
    win_prob = min(80 + (current_user.level * 2), 99)
    
    # Total Pool (Mock, hard to parse strings like "$1M" in SQL without cleaning)
    total_pool = "$4.2M"
    
    return {
        "active_grants": active_count,
        "closing_soon": closing_soon,
        "win_probability": f"{win_prob}%",
        "total_pool": total_pool
    }
