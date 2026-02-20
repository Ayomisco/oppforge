from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, JSON, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from .enums import UserRole

from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Auth & Identity
    email = Column(String, unique=True, index=True, nullable=False)
    # Role / RBAC
    role = Column(Enum(UserRole), default=UserRole.USER)
    
    google_id = Column(String, unique=True, index=True, nullable=True)
    wallet_address = Column(String, unique=True, index=True, nullable=True)
    
    # Profile
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    
    # Social Links
    github_handle = Column(String, nullable=True)
    twitter_handle = Column(String, nullable=True)
    discord_handle = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    
    # Professional Profile (For AI matching)
    cv_url = Column(String, nullable=True) # Uploaded CV link
    skills = Column(JSON, default=[]) # ["Rust", "Solidity", "React"]
    experience_level = Column(String, default="Intermediate") # Beginner, Intermediate, Expert
    preferred_chains = Column(JSON, default=[]) # ["Solana", "Arbitrum"]
    preferred_categories = Column(JSON, default=[]) # ["Grant", "Bounty"]
    
    # Gamification & Stats
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    rank_title = Column(String, default="Novice Scout")
    badges = Column(JSON, default=[]) # List of earned badge IDs
    
    # Subscription & Billing
    tier = Column(String, default="scout") # scout, hunter, founder
    is_pro = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    subscription_status = Column(String, default="trialing") # trialing, active, expired, cancelled
    trial_started_at = Column(DateTime(timezone=True), server_default=func.now())
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Settings
    onboarded = Column(Boolean, default=False)
    notification_settings = Column(JSON, default={
        "email_alerts": True,
        "push_alerts": False,
        "weekly_digest": True,
        "marketing_emails": False
    })

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    tracked_opps = relationship("TrackedApplication", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

