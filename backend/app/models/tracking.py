from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class TrackedApplication(Base):
    __tablename__ = "tracked_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), index=True)
    
    # Pipeline Status
    status = Column(String, default="Interested", index=True) 
    # Valid statuses: Interested, Researching, Drafted, Applied, In Review, Interview, Won, Lost
    
    # User Content
    notes = Column(Text, nullable=True)
    submission_link = Column(String, nullable=True)
    submission_date = Column(DateTime(timezone=True), nullable=True)
    reminder_at = Column(DateTime(timezone=True), nullable=True)
    
    # Custom AI Strategy (Snapshot)
    ai_strategy_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="tracked_opps")
    opportunity = relationship("Opportunity", back_populates="tracked_by")
