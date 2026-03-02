from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

class ChatMessageBase(BaseModel):
    content: str
    sender: str = "user" # user, ai
    metadata_json: Optional[Dict[str, Any]] = None

class ChatMessageCreate(ChatMessageBase):
    related_opportunity_id: Optional[uuid.UUID] = None
    session_id: Optional[str] = None

class ChatMessageResponse(ChatMessageBase):
    id: uuid.UUID
    session_id: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    """A chat session/conversation summary."""
    session_id: str
    title: str
    last_message: str
    message_count: int
    updated_at: datetime

    class Config:
        from_attributes = True
