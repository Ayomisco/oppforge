from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, JSON, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

from sqlalchemy.dialects.postgresql import UUID
import uuid

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Core Info
    title = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True) # URL friendly title
    description = Column(Text, nullable=True)
    url = Column(String, nullable=False) # Application/Source URL
    logo_url = Column(String, nullable=True)
    
    # Source Tracking
    source = Column(String, index=True) # twitter, reddit, web, gitcoin, manual
    source_id = Column(String, index=True, nullable=True) # External ID (e.g. Tweet ID)
    source_url = Column(String, nullable=True)
    posted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Classification
    category = Column(String, index=True) # Grant, Airdrop, Hackathon, Bounty
    sub_category = Column(String, nullable=True) # DeFi, NFT, Infra
    chain = Column(String, index=True) # Solana, Ethereum, Multi-chain
    tags = Column(JSON, default=[]) # ["Rust", "Zero Knowledge", "DeFi"]
    
    # Reward & Value
    reward_pool = Column(String, nullable=True) # "$50,000"
    reward_token = Column(String, nullable=True) # "USDC", "OP"
    estimated_value_usd = Column(Float, nullable=True)
    winner_count = Column(Integer, nullable=True)
    
    # Timeline
    deadline = Column(DateTime(timezone=True), nullable=True, index=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    is_open = Column(Boolean, default=True)
    
    # AI Analysis & Scoring
    ai_summary = Column(Text, nullable=True)
    ai_strategy = Column(Text, nullable=True)
    ai_score = Column(Integer, default=0, index=True) # 0-100
    win_probability = Column(String, default="Medium") # Low, Medium, High
    difficulty = Column(String, default="Intermediate") # Beginner, Intermediate, Expert
    required_skills = Column(JSON, default=[])
    
    # Meta
    is_verified = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tracked_by = relationship("TrackedApplication", back_populates="opportunity")
