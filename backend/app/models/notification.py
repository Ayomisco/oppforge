from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

from sqlalchemy.dialects.postgresql import UUID
import uuid

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    type = Column(String, default="info")  # info, success, warning, alert
    link = Column(String, nullable=True)   # Deep link e.g. /dashboard/opportunity/5
    
    is_read = Column(Boolean, default=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="notifications")
