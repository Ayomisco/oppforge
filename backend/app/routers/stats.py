import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from .. import database, models
from .auth import get_optional_user

router = APIRouter(
    prefix="/stats",
    tags=["stats"]
)


def _parse_reward_string(reward_str):
    """Parse reward strings like '$50,000', '10K USDC', '$1.2M' into a USD float."""
    if not reward_str:
        return 0.0
    text = str(reward_str).replace(',', '').strip()
    match = re.search(r'\$?([\d.]+)\s*(m|k)?', text, re.IGNORECASE)
    if not match:
        return 0.0
    amount = float(match.group(1))
    suffix = (match.group(2) or '').lower()
    if suffix == 'm':
        amount *= 1_000_000
    elif suffix == 'k':
        amount *= 1_000
    return amount


@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user = Depends(get_optional_user)):
    """
    Returns real Mission Control stats based on DB data.
    Active count matches /opportunities/priority: is_open AND not expired.
    """
    now = datetime.utcnow()
    one_week_later = now + timedelta(days=7)

    # Base filter: open AND (no deadline OR deadline in future) — matches /priority
    base_filter = [
        models.Opportunity.is_open == True,
        or_(
            models.Opportunity.deadline == None,
            models.Opportunity.deadline >= now
        )
    ]
    
    # 1. Total Active Targets (excludes expired)
    active_count = db.query(models.Opportunity).filter(*base_filter).count()

    # 2. Closing Soon (Deadlines in next 7 days)
    closing_soon = db.query(models.Opportunity).filter(
        models.Opportunity.is_open == True,
        models.Opportunity.deadline >= now,
        models.Opportunity.deadline <= one_week_later
    ).count()
    
    # 3. Dynamic Win Probability 
    if current_user:
        skill_bonus = len(current_user.skills or [])
        wallet_bonus = 5 if current_user.wallet_address else 0
        win_prob = min(70 + (current_user.level * 2) + wallet_bonus + skill_bonus, 99)
    else:
        win_prob = 70
    
    # 4. Total Pool Estimate
    # Use estimated_value_usd when available, otherwise parse reward_pool string
    pool_sum = db.query(func.sum(models.Opportunity.estimated_value_usd)).filter(
        *base_filter
    ).scalar() or 0.0

    # For rows without estimated_value_usd, parse the reward_pool string
    rows_without_value = db.query(models.Opportunity.reward_pool).filter(
        *base_filter,
        or_(
            models.Opportunity.estimated_value_usd == None,
            models.Opportunity.estimated_value_usd == 0
        ),
        models.Opportunity.reward_pool != None
    ).all()
    for (rp,) in rows_without_value:
        pool_sum += _parse_reward_string(rp)
    
    # Format pool sum for display
    if pool_sum >= 1_000_000:
        pool_display = f"${pool_sum / 1_000_000:.1f}M"
    elif pool_sum >= 1_000:
        pool_display = f"${pool_sum / 1_000:.1f}K"
    elif pool_sum > 0:
        pool_display = f"${pool_sum:,.0f}"
    else:
        pool_display = "$0"
    
    return {
        "active_grants": active_count,
        "closing_soon": closing_soon,
        "win_probability": f"{win_prob}%",
        "total_pool": pool_display,
        "targets_identified": active_count,
        "system_status": "ONLINE"
    }
