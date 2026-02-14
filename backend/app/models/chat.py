from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    session_id = Column(String, index=True, nullable=True) # For grouping conversations
    
    sender = Column(String, nullable=False) # "user", "ai", "system"
    content = Column(Text, nullable=False)
    
    # Context
    related_opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True)
    metadata_json = Column(JSON, default={}) # For tool calls, citations, etc.
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="messages")
    # opportunity relationship optional if we want to link chat to opps
