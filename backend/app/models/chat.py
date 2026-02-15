from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

from sqlalchemy.dialects.postgresql import UUID
import uuid

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    session_id = Column(String, index=True, nullable=True) # For grouping conversations
    
    sender = Column(String, nullable=False) # "user", "ai", "system"
    content = Column(Text, nullable=False)
    
    # Context
    related_opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=True)
    metadata_json = Column(JSON, default={}) # For tool calls, citations, etc.
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="messages")
    # opportunity relationship optional if we want to link chat to opps
