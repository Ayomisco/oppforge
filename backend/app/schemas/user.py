from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional, Any, Dict
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    google_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserUpdate(BaseModel):
    # Profile
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    wallet_address: Optional[str] = None
    location: Optional[str] = None
    website_url: Optional[str] = None
    
    # Socials
    github_handle: Optional[str] = None
    twitter_handle: Optional[str] = None
    discord_handle: Optional[str] = None
    linkedin_url: Optional[str] = None
    
    # Pro
    skills: Optional[List[str]] = None
    preferred_chains: Optional[List[str]] = None
    preferred_categories: Optional[List[str]] = None
    
    # Settings
    onboarded: Optional[bool] = None
    notification_settings: Optional[Dict[str, bool]] = None
    
    # Subscription
    tier: Optional[str] = None
    is_pro: Optional[bool] = None
    subscription_status: Optional[str] = None

class UserResponse(UserBase):
    id: uuid.UUID
    username: Optional[str] = None
    wallet_address: Optional[str] = None
    role: str
    # Computed/Gamified
    xp: int
    level: int
    rank_title: str
    badges: List[str] = []
    
    # Status
    tier: str
    is_pro: bool
    
    # Arrays
    skills: List[str] = []
    preferred_chains: List[str] = []
    preferred_categories: List[str] = []
    onboarded: bool = False
    subscription_status: str = "trialing"
    trial_started_at: Optional[datetime] = None
    subscription_expires_at: Optional[datetime] = None
    
    created_at: datetime

    class Config:
        from_attributes = True
        
    @classmethod
    def model_validate(cls, obj, from_attributes: bool = True):
        """Override to ensure role enum and onboarded status are safely converted"""
        # Ensure obj is not None
        if not obj: return None
        
        # If it's already a dict, we can just fix it
        if isinstance(obj, dict):
            if 'role' in obj and hasattr(obj['role'], 'value'):
                obj['role'] = obj['role'].value
            if 'onboarded' in obj and obj['onboarded'] is None:
                obj['onboarded'] = False
            return super().model_validate(obj)

        # It's an object (SQLAlchemy model)
        # Create a proxy dict with fixed values
        # We only need to fix role and onboarded
        role_val = getattr(obj, 'role', 'user')
        if hasattr(role_val, 'value'):
            role_val = role_val.value
        
        onboarded_val = bool(getattr(obj, 'onboarded', False))
        
        # Use a dict to avoid triggering Pydantic's dir() logic on the proxy
        data = {
            "id": getattr(obj, "id"),
            "email": getattr(obj, "email"),
            "username": getattr(obj, "username", None),
            "full_name": getattr(obj, "full_name", None),
            "avatar_url": getattr(obj, "avatar_url", None),
            "wallet_address": getattr(obj, "wallet_address", None),
            "role": str(role_val),
            "xp": getattr(obj, "xp", 0),
            "level": getattr(obj, "level", 1),
            "rank_title": getattr(obj, "rank_title", "Novice Scout"),
            "badges": getattr(obj, "badges", []),
            "tier": getattr(obj, "tier", "scout"),
            "is_pro": getattr(obj, "is_pro", False),
            "onboarded": onboarded_val,
            "subscription_status": getattr(obj, "subscription_status", "trialing"),
            "trial_started_at": getattr(obj, "trial_started_at", None),
            "subscription_expires_at": getattr(obj, "subscription_expires_at", None),
            "skills": getattr(obj, "skills", []),
            "preferred_chains": getattr(obj, "preferred_chains", []),
            "preferred_categories": getattr(obj, "preferred_categories", []),
            "created_at": getattr(obj, "created_at", datetime.utcnow())
        }
        
        return super().model_validate(data)
