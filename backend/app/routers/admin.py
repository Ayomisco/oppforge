"""
Admin API Router — Dashboard analytics, user management, opportunity management.

Permission levels:
  - ADMIN: Full access (users CRUD, analytics, opp edit/flag/create)
  - SUB_ADMIN: Read-only analytics dashboard, audit logs, opp view. No user management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case, extract
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
import uuid
import logging

from .. import database, schemas
from ..models.user import User
from ..models.opportunity import Opportunity
from ..models.tracking import TrackedApplication
from ..models.notification import Notification
from ..models.audit import AuditLog
from ..models.enums import UserRole, STAFF_ROLES, MANAGEMENT_ROLES
from .auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

# ========================
# Permission dependencies
# ========================

def require_staff(current_user=Depends(get_current_user)):
    """Require ADMIN or SUB_ADMIN role."""
    role = current_user.role
    if isinstance(role, str):
        role = UserRole(role) if role in [r.value for r in UserRole] else None
    if role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Staff access required.")
    return current_user


def require_admin(current_user=Depends(get_current_user)):
    """Require full ADMIN role. SUB_ADMIN cannot access."""
    role = current_user.role
    if isinstance(role, str):
        role = UserRole(role) if role in [r.value for r in UserRole] else None
    if role not in MANAGEMENT_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


# ========================
# Schemas
# ========================

class DashboardStats(BaseModel):
    total_users: int
    new_users_today: int
    new_users_week: int
    total_opportunities: int
    verified_opportunities: int
    active_opportunities: int
    expired_opportunities: int
    total_tracked: int
    pro_users: int
    admin_users: int
    sub_admin_users: int

class UserGrowthPoint(BaseModel):
    date: str
    count: int

class CategoryBreakdown(BaseModel):
    category: str
    count: int

class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    tier: str
    is_pro: bool
    onboarded: bool
    subscription_status: Optional[str] = None
    skills: List[str] = []
    preferred_chains: List[str] = []
    created_at: Optional[datetime] = None
    tracked_count: int = 0

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str  # "admin", "sub_admin", "user", "moderator"

class UserBulkAction(BaseModel):
    user_ids: List[uuid.UUID]
    action: str  # "activate", "deactivate", "delete"

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    chain: Optional[str] = None
    tags: Optional[List[str]] = None
    reward_pool: Optional[str] = None
    reward_token: Optional[str] = None
    estimated_value_usd: Optional[float] = None
    deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    is_open: Optional[bool] = None
    ai_summary: Optional[str] = None
    ai_strategy: Optional[str] = None
    ai_score: Optional[int] = None
    trust_score: Optional[int] = None
    difficulty: Optional[str] = None
    required_skills: Optional[List[str]] = None
    mission_requirements: Optional[List[str]] = None
    risk_level: Optional[str] = None
    risk_flags: Optional[List[str]] = None
    win_probability: Optional[str] = None
    is_verified: Optional[bool] = None

class OpportunityFlag(BaseModel):
    flag_reason: str  # scam, expired, duplicate, inaccurate, other
    notes: Optional[str] = None


# ========================
# Analytics Dashboard
# ========================

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """Platform-wide statistics. Accessible by ADMIN and SUB_ADMIN."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    total_users = db.query(func.count(User.id)).scalar()
    new_today = db.query(func.count(User.id)).filter(User.created_at >= today_start).scalar()
    new_week = db.query(func.count(User.id)).filter(User.created_at >= week_start).scalar()

    total_opps = db.query(func.count(Opportunity.id)).scalar()
    verified = db.query(func.count(Opportunity.id)).filter(Opportunity.is_verified == True).scalar()
    active = db.query(func.count(Opportunity.id)).filter(
        Opportunity.is_open == True,
        (Opportunity.deadline == None) | (Opportunity.deadline >= now)
    ).scalar()
    expired = db.query(func.count(Opportunity.id)).filter(
        Opportunity.deadline != None,
        Opportunity.deadline < now
    ).scalar()
    tracked = db.query(func.count(TrackedApplication.id)).scalar()
    pro = db.query(func.count(User.id)).filter(User.is_pro == True).scalar()
    admins = db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN).scalar()
    sub_admins = db.query(func.count(User.id)).filter(User.role == UserRole.SUB_ADMIN).scalar()

    return DashboardStats(
        total_users=total_users or 0,
        new_users_today=new_today or 0,
        new_users_week=new_week or 0,
        total_opportunities=total_opps or 0,
        verified_opportunities=verified or 0,
        active_opportunities=active or 0,
        expired_opportunities=expired or 0,
        total_tracked=tracked or 0,
        pro_users=pro or 0,
        admin_users=admins or 0,
        sub_admin_users=sub_admins or 0,
    )


@router.get("/dashboard/user-growth", response_model=List[UserGrowthPoint])
def get_user_growth(
    days: int = 30,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """Daily user signups for the last N days."""
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)

    rows = (
        db.query(
            func.date(User.created_at).label("day"),
            func.count(User.id).label("count"),
        )
        .filter(User.created_at >= start)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
        .all()
    )

    return [UserGrowthPoint(date=str(r.day), count=r.count) for r in rows]


@router.get("/dashboard/category-breakdown", response_model=List[CategoryBreakdown])
def get_category_breakdown(
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """Opportunity count by category."""
    rows = (
        db.query(Opportunity.category, func.count(Opportunity.id).label("count"))
        .group_by(Opportunity.category)
        .order_by(desc("count"))
        .all()
    )
    return [CategoryBreakdown(category=r.category or "Unknown", count=r.count) for r in rows]


@router.get("/dashboard/top-opportunities")
def get_top_opportunities(
    limit: int = 10,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """Most tracked opportunities."""
    rows = (
        db.query(
            Opportunity.id,
            Opportunity.title,
            Opportunity.category,
            Opportunity.ai_score,
            func.count(TrackedApplication.id).label("track_count"),
        )
        .outerjoin(TrackedApplication, TrackedApplication.opportunity_id == Opportunity.id)
        .group_by(Opportunity.id)
        .order_by(desc("track_count"))
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "title": r.title,
            "category": r.category,
            "ai_score": r.ai_score,
            "track_count": r.track_count,
        }
        for r in rows
    ]


# ========================
# User Management (ADMIN only)
# ========================

@router.get("/users", response_model=List[AdminUserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """List all users with search/filter. ADMIN only."""
    query = db.query(User)

    if search:
        term = f"%{search}%"
        from sqlalchemy import or_
        query = query.filter(
            or_(
                User.email.ilike(term),
                User.username.ilike(term),
                User.full_name.ilike(term),
            )
        )

    if role:
        query = query.filter(User.role == role)

    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()

    result = []
    for u in users:
        tracked_count = db.query(func.count(TrackedApplication.id)).filter(
            TrackedApplication.user_id == u.id
        ).scalar() or 0
        
        role_val = u.role.value if hasattr(u.role, 'value') else str(u.role)

        result.append(AdminUserResponse(
            id=u.id,
            email=u.email,
            username=u.username,
            full_name=u.full_name,
            avatar_url=u.avatar_url,
            role=role_val,
            tier=u.tier or "scout",
            is_pro=u.is_pro or False,
            onboarded=u.onboarded or False,
            subscription_status=u.subscription_status,
            skills=u.skills or [],
            preferred_chains=u.preferred_chains or [],
            created_at=u.created_at,
            tracked_count=tracked_count,
        ))

    return result


@router.get("/users/count")
def get_user_count(
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """Total user count."""
    return {"count": db.query(func.count(User.id)).scalar()}


@router.get("/users/{user_id}", response_model=AdminUserResponse)
def get_user_detail(
    user_id: uuid.UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """Get a single user's full profile. ADMIN only."""
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    tracked_count = db.query(func.count(TrackedApplication.id)).filter(
        TrackedApplication.user_id == u.id
    ).scalar() or 0
    role_val = u.role.value if hasattr(u.role, 'value') else str(u.role)

    return AdminUserResponse(
        id=u.id, email=u.email, username=u.username, full_name=u.full_name,
        avatar_url=u.avatar_url, role=role_val, tier=u.tier or "scout",
        is_pro=u.is_pro or False, onboarded=u.onboarded or False,
        subscription_status=u.subscription_status, skills=u.skills or [],
        preferred_chains=u.preferred_chains or [], created_at=u.created_at,
        tracked_count=tracked_count,
    )


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: uuid.UUID,
    body: UserRoleUpdate,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """Change a user's role. ADMIN only. Cannot demote yourself."""
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role via API.")

    valid_roles = [r.value for r in UserRole]
    if body.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    old_role = target.role.value if hasattr(target.role, 'value') else str(target.role)
    target.role = UserRole(body.role)

    db.add(AuditLog(
        action="role_changed",
        user_id=current_user.id,
        target_id=str(user_id),
        details=f"Admin {current_user.email} changed {target.email} role: {old_role} -> {body.role}",
        type="security",
        payload={"old_role": old_role, "new_role": body.role}
    ))

    db.commit()
    return {"status": "success", "new_role": body.role}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """Delete a user. ADMIN only. Cannot delete yourself."""
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account here.")

    email = target.email
    db.delete(target)

    db.add(AuditLog(
        action="user_deleted",
        user_id=current_user.id,
        target_id=str(user_id),
        details=f"Admin {current_user.email} deleted user: {email}",
        type="security"
    ))

    db.commit()
    return {"status": "deleted", "email": email}


# ========================
# Opportunity Management
# ========================

@router.put("/opportunities/{opp_id}", response_model=schemas.OpportunityResponse)
def update_opportunity(
    opp_id: uuid.UUID,
    body: OpportunityUpdate,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """Edit any field on an opportunity. ADMIN only."""
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    update_data = body.model_dump(exclude_unset=True)
    changed_fields = []
    for field, value in update_data.items():
        if hasattr(opp, field):
            old_val = getattr(opp, field)
            setattr(opp, field, value)
            changed_fields.append(field)

    db.add(AuditLog(
        action="opportunity_edited",
        user_id=current_user.id,
        target_id=str(opp_id),
        details=f"Admin {current_user.email} edited opportunity: {opp.title}. Fields: {', '.join(changed_fields)}",
        type="data",
        payload=update_data,
    ))

    db.commit()
    db.refresh(opp)
    return opp


@router.post("/opportunities/{opp_id}/flag")
def flag_opportunity(
    opp_id: uuid.UUID,
    body: OpportunityFlag,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """Flag an opportunity for review. ADMIN + SUB_ADMIN can flag."""
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing_flags = opp.risk_flags or []
    new_flag = {
        "reason": body.flag_reason,
        "notes": body.notes,
        "flagged_by": str(current_user.id),
        "flagged_at": datetime.now(timezone.utc).isoformat(),
    }
    existing_flags.append(new_flag)
    opp.risk_flags = existing_flags

    # Auto-set risk level based on flag count
    if len(existing_flags) >= 3:
        opp.risk_level = "High"
    elif len(existing_flags) >= 1:
        opp.risk_level = "Medium"

    db.add(AuditLog(
        action="opportunity_flagged",
        user_id=current_user.id,
        target_id=str(opp_id),
        details=f"Flagged: {body.flag_reason} — {body.notes or 'No notes'}",
        type="security",
        payload={"flag_reason": body.flag_reason, "notes": body.notes},
    ))

    db.commit()
    return {"status": "flagged", "total_flags": len(existing_flags)}


@router.get("/opportunities", response_model=List[schemas.OpportunityResponse])
def list_all_opportunities(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    category: Optional[str] = None,
    verified_only: bool = False,
    flagged_only: bool = False,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """List all opportunities with filtering. ADMIN + SUB_ADMIN."""
    query = db.query(Opportunity)

    if search:
        from sqlalchemy import or_
        term = f"%{search}%"
        query = query.filter(
            or_(Opportunity.title.ilike(term), Opportunity.description.ilike(term))
        )
    if category and category.lower() not in ("all", ""):
        query = query.filter(Opportunity.category.ilike(category))
    if verified_only:
        query = query.filter(Opportunity.is_verified == True)
    if flagged_only:
        query = query.filter(Opportunity.risk_level != None)

    return query.order_by(desc(Opportunity.created_at)).offset(skip).limit(limit).all()


# ========================
# Audit Logs (override existing with staff access)
# ========================

@router.get("/audit", response_model=List[schemas.AuditLogResponse])
def read_audit_logs(
    limit: int = 50,
    action: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """Fetch system audit logs. ADMIN + SUB_ADMIN."""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()


@router.get("/audit/{log_id}", response_model=schemas.AuditLogResponse)
def read_audit_detail(
    log_id: str,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


# ========================
# Notification sender (admin sends in-app notifs)
# ========================

class SendNotification(BaseModel):
    user_id: Optional[uuid.UUID] = None  # None = broadcast
    title: str
    message: Optional[str] = None
    type: str = "info"
    link: Optional[str] = None

@router.post("/notifications/send")
def send_notification(
    body: SendNotification,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """Send an in-app notification to a specific user or broadcast to all."""
    if body.user_id:
        target = db.query(User).filter(User.id == body.user_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Target user not found")
        notif = Notification(
            user_id=target.id,
            title=body.title,
            message=body.message,
            type=body.type,
            link=body.link,
        )
        db.add(notif)
        db.commit()
        return {"status": "sent", "count": 1}
    else:
        # Broadcast to all users
        users = db.query(User).all()
        count = 0
        for u in users:
            db.add(Notification(
                user_id=u.id,
                title=body.title,
                message=body.message,
                type=body.type,
                link=body.link,
            ))
            count += 1
        db.commit()
        return {"status": "broadcast", "count": count}


# ========================
# Scraper Management
# ========================

class ScrapeRequest(BaseModel):
    source: Optional[str] = None  # None = all scrapers

@router.post("/scrape")
def trigger_scrape(
    body: ScrapeRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(require_admin)
):
    """Trigger scrapers to fetch new opportunities. Admin only."""
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

    from app.scrapers.superteam import SuperteamScraper
    from app.scrapers.dorahacks import DoraHacksScraper
    from app.scrapers.code4rena import Code4renaScraper
    from app.scrapers.curated import CuratedScraper
    from app.scrapers.hackquest import HackQuestScraper
    from app.scrapers.questbook import QuestbookScraper

    SCRAPER_REGISTRY = {
        "superteam": SuperteamScraper,
        "dorahacks": DoraHacksScraper,
        "code4rena": Code4renaScraper,
        "curated": CuratedScraper,
        "hackquest": HackQuestScraper,
        "questbook": QuestbookScraper,
    }

    # Validate source
    if body.source and body.source.lower() not in SCRAPER_REGISTRY:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown source: {body.source}. Available: {list(SCRAPER_REGISTRY.keys())}"
        )

    scrapers_to_run = {}
    if body.source:
        name = body.source.lower()
        scrapers_to_run[name] = SCRAPER_REGISTRY[name]
    else:
        scrapers_to_run = SCRAPER_REGISTRY

    results = {}
    total_saved = 0

    for name, scraper_cls in scrapers_to_run.items():
        try:
            scraper = scraper_cls()
            raw = scraper.run()

            saved = 0
            skipped = 0
            for opp_data in raw:
                source = opp_data.get("source", "Unknown")
                source_id = opp_data.get("source_id")
                title = opp_data.get("title", "")
                url = opp_data.get("url", "")

                # Dedup
                exists = False
                if source_id:
                    exists = db.query(Opportunity).filter(
                        Opportunity.source_id == str(source_id), Opportunity.source == source
                    ).first()
                if not exists and url:
                    exists = db.query(Opportunity).filter(Opportunity.url == url).first()
                if not exists and title:
                    exists = db.query(Opportunity).filter(Opportunity.title == title).first()

                if exists:
                    skipped += 1
                    continue

                slug = title.lower().replace(" ", "-").replace("'", "")[:80] if title else None
                if slug:
                    slug_exists = db.query(Opportunity).filter(Opportunity.slug == slug).first()
                    if slug_exists:
                        slug = f"{slug}-{source.lower()}"

                opp = Opportunity(
                    title=title,
                    slug=slug,
                    description=opp_data.get("description", ""),
                    url=url,
                    logo_url=opp_data.get("logo_url"),
                    source=source,
                    source_id=str(source_id) if source_id else None,
                    source_url=opp_data.get("source_url", url),
                    category=opp_data.get("category", "Hackathon"),
                    chain=opp_data.get("chain", "Multi-chain"),
                    tags=opp_data.get("tags", []),
                    reward_pool=opp_data.get("reward_pool"),
                    deadline=opp_data.get("deadline"),
                    start_date=opp_data.get("start_date"),
                    is_open=True,
                    ai_score=70,
                    trust_score=80,
                    required_skills=opp_data.get("required_skills", []),
                    is_verified=opp_data.get("is_verified", False),
                )
                db.add(opp)
                try:
                    db.commit()
                    saved += 1
                except Exception:
                    db.rollback()

            results[name] = {"found": len(raw), "saved": saved, "skipped": skipped}
            total_saved += saved

        except Exception as e:
            logger.error(f"Scraper {name} failed: {e}")
            results[name] = {"error": str(e)}

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="trigger_scrape",
        entity_type="scraper",
        entity_id=body.source or "all",
        details={"results": results, "total_saved": total_saved}
    )
    db.add(audit)
    db.commit()

    return {
        "status": "completed",
        "total_saved": total_saved,
        "results": results,
        "total_in_db": db.query(Opportunity).count()
    }


@router.get("/scraper/status")
def scraper_status(
    db: Session = Depends(database.get_db),
    current_user=Depends(require_staff)
):
    """Get scraper status and DB statistics."""
    total = db.query(Opportunity).count()
    by_source = db.query(
        Opportunity.source, func.count(Opportunity.id)
    ).group_by(Opportunity.source).all()

    by_category = db.query(
        Opportunity.category, func.count(Opportunity.id)
    ).group_by(Opportunity.category).all()

    verified = db.query(Opportunity).filter(Opportunity.is_verified == True).count()
    open_count = db.query(Opportunity).filter(Opportunity.is_open == True).count()

    return {
        "total_opportunities": total,
        "verified": verified,
        "open": open_count,
        "by_source": {s: c for s, c in by_source},
        "by_category": {c: cnt for c, cnt in by_category},
        "available_scrapers": [
            "superteam", "dorahacks", "code4rena", "curated",
            "hackquest", "questbook"
        ]
    }
