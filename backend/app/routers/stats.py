from datetime import datetime, timedelta
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
    Returns real Mission Control stats based on DB data.
    """
    now = datetime.utcnow()
    one_week_later = now + timedelta(days=7)
    
    # 1. Total Active Targets
    active_count = db.query(models.Opportunity).filter(models.Opportunity.is_open == True).count()

    # 2. Closing Soon (Deadlines in next 7 days)
    closing_soon = db.query(models.Opportunity).filter(
        models.Opportunity.is_open == True,
        models.Opportunity.deadline >= now,
        models.Opportunity.deadline <= one_week_later
    ).count()
    
    # 3. Dynamic Win Probability 
    # Logic: Base 70% + 2% per level + 5% if wallet connected + 1% per skill (max 99%)
    skill_bonus = len(current_user.skills or [])
    wallet_bonus = 5 if current_user.wallet_address else 0
    win_prob = min(70 + (current_user.level * 2) + wallet_bonus + skill_bonus, 99)
    
    # 4. Total Pool Estimate
    # Real logic: sum estimated_value_usd if present, otherwise ignore
    pool_sum = db.query(func.sum(models.Opportunity.estimated_value_usd)).filter(
        models.Opportunity.is_open == True
    ).scalar() or 0
    
    # Format pool sum for display (e.g. $1.2M)
    if pool_sum >= 1_000_000:
        pool_display = f"${pool_sum / 1_000_000:.1f}M"
    elif pool_sum >= 1_000:
        pool_display = f"${pool_sum / 1_000:.1f}K"
    else:
        pool_display = f"${pool_sum:.0f}"
    
    return {
        "active_grants": active_count,
        "closing_soon": closing_soon,
        "win_probability": f"{win_prob}%",
        "total_pool": pool_display,
        "targets_identified": active_count,
        "system_status": "ONLINE"
    }
