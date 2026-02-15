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
    notification_settings: Optional[Dict[str, bool]] = None

class UserResponse(UserBase):
    id: uuid.UUID
    username: Optional[str] = None
    wallet_address: Optional[str] = None
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
    
    created_at: datetime

    class Config:
        from_attributes = True
