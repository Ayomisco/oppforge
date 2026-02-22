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
    subscription_status: str
    
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
    def model_validate(cls, obj):
        """Override to ensure role enum is converted to string value and boolean defaults are safe"""
        # Ensure onboarded is never None
        if hasattr(obj, 'onboarded') and obj.onboarded is None:
            obj.onboarded = False
            
        if hasattr(obj, 'role') and hasattr(obj.role, 'value'):
            # Convert enum to its string value
            obj_dict = {
                **{k: getattr(obj, k) for k in dir(obj) if not k.startswith('_')},
                'role': obj.role.value,
                'onboarded': getattr(obj, 'onboarded', False) or False
            }
            return super().model_validate(obj_dict)
        return super().model_validate(obj)
