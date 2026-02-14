from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ChatMessageBase(BaseModel):
    content: str
    sender: str = "user" # user, ai
    metadata_json: Optional[Dict[str, Any]] = None

class ChatMessageCreate(ChatMessageBase):
    related_opportunity_id: Optional[int] = None
    session_id: Optional[str] = None

class ChatMessageResponse(ChatMessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
