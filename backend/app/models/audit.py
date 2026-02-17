from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from ..database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    action = Column(String, nullable=False) # e.g., "manual_upload", "user_promotion", "ai_triage"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    target_id = Column(String, nullable=True) # ID of the impacted record (e.g., Opp ID)
    details = Column(String, nullable=True) # Readable summary
    payload = Column(JSON, nullable=True) # Raw data involved
    type = Column(String, default="info") # info, security, data, system
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
