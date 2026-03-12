from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    category = Column(String, nullable=True)
    rating = Column(Integer, default=0)
    bugs = Column(Text, nullable=True)
    ux_feedback = Column(Text, nullable=True)
    feature_requests = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
