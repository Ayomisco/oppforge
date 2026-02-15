from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class NotificationCreate(BaseModel):
    title: str
    message: Optional[str] = None
    type: str = "info"
    link: Optional[str] = None

class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: Optional[str] = None
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
