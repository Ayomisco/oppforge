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
    urgency_score = Column(Integer, default=0) # 0-100 based on deadline closeness
    win_probability = Column(String, default="Medium") # Low, Medium, High
    difficulty = Column(String, default="Intermediate") # Beginner, Intermediate, Expert
    difficulty_score = Column(Integer, default=5) # 1-10 numeric difficulty
    required_skills = Column(JSON, default=[])
    mission_requirements = Column(JSON, default=[]) # Specific mission requirements (List)
    
    # Trust & Verification
    trust_score = Column(Integer, default=70) # 0-100 based on anti-deception engine
    risk_score = Column(Integer, nullable=True, index=True) # 0-100, null if not assessed yet
    risk_level = Column(String, nullable=True) # Low, Medium, High, Critical
    risk_flags = Column(JSON, default=[]) # List of detected risk issues
    
    # Meta
    is_verified = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    
    # Aliases/Computed helpers for the user request
    @property
    def raw_url(self):
        return self.source_url or self.url

    @property
    def reward_estimate(self):
        return self.estimated_value_usd or self.reward_pool
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tracked_by = relationship("TrackedApplication", back_populates="opportunity")
    
    def to_dict(self):
        """Convert opportunity to dictionary for AI processing"""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "chain": self.chain,
            "reward_pool": self.reward_pool,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "source": self.source,
            "tags": self.tags,
            "required_skills": self.required_skills,
            "mission_requirements": self.mission_requirements,
            "trust_score": self.trust_score,
            "url": self.url,
            "is_verified": self.is_verified,
        }
