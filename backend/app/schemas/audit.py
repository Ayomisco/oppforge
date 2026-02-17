from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
import uuid

class AuditLogBase(BaseModel):
    action: str
    details: Optional[str] = None
    type: str = "info"
    target_id: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[uuid.UUID] = None
    payload: Optional[Dict[str, Any]] = None

class AuditLogResponse(AuditLogBase):
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
