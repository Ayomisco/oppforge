from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base

class Ecosystem(Base):
    __tablename__ = "ecosystems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Basic Info
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    type = Column(String, nullable=False, index=True)  # L1, L2, DeFi, Infra, DAO, Gaming
    tier = Column(Integer, default=3)  # 1 (highest priority), 2, 3
    
    # Capabilities
    has_grants = Column(Boolean, default=False)
    has_bounties = Column(Boolean, default=False)
    has_hackathons = Column(Boolean, default=False)
    has_ambassadors = Column(Boolean, default=False)
    has_testnet = Column(Boolean, default=False)
    
    # URLs for Scraping
    official_website = Column(String, nullable=True)
    official_grants_url = Column(String, nullable=True)
    governance_url = Column(String, nullable=True)
    blog_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    twitter_handle = Column(String, nullable=True)
    discord_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    docs_url = Column(String, nullable=True)
    announcement_feed_url = Column(String, nullable=True)
    
    # Metadata
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    native_token = Column(String, nullable=True)
    chain_id = Column(Integer, nullable=True)
    rpc_url = Column(String, nullable=True)
    
    # Scraping Configuration
    scraper_enabled = Column(Boolean, default=True)
    scraper_frequency = Column(String, default='daily')
    scraper_priority = Column(Integer, default=5)
    last_scraped_at = Column(DateTime(timezone=True), nullable=True)
    scrape_count = Column(Integer, default=0)
    
    # Stats
    total_opportunities = Column(Integer, default=0)
    avg_reward_usd = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
