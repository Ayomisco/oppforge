from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List, Optional
from pydantic import BaseModel
from .. import database, schemas
from ..models.chat import ChatMessage
from .auth import get_current_user, check_subscription_clearance
import os

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    opportunity_id: Optional[uuid.UUID] = None

class ChatResponse(BaseModel):
    role: str
    content: str

@router.post("/", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    db: Session = Depends(database.get_db),
    current_user = Depends(check_subscription_clearance)
):
    """
    Send a message to Forge AI. Requires active subscription.
    """
    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        sender="user",
        content=req.message,
        related_opportunity_id=req.opportunity_id
    )
    db.add(user_msg)
    
    # Build Contextual Request for AI Engine
    ai_request = {
        "message": req.message,
        "user_profile": {
            "id": str(current_user.id),
            "full_name": current_user.full_name,
            "skills": current_user.skills,
            "xp": current_user.xp,
            "level": current_user.level,
            "bio": current_user.bio
        }
    }
    
    if req.opportunity_id:
        from ..models.opportunity import Opportunity
        opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
        if opp:
            ai_request["opportunity"] = {
                "id": str(opp.id),
                "title": opp.title,
                "description": opp.description,
                "category": opp.category,
                "chain": opp.chain,
                "reward_pool": opp.reward_pool,
                "trust_score": opp.trust_score,
                "mission_requirements": opp.mission_requirements
            }

    # Call AI Engine Service (Decoupled Architecture)
    AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{AI_ENGINE_URL}/ai/chat",
                json=ai_request,
                timeout=30.0
            )
            if resp.status_code == 200:
                data = resp.json()
                ai_content = data.get("response", "AI Engine failed to return response.")
            else:
                ai_content = f"Forge AI Engine offline (Status: {resp.status_code})."
    except Exception as e:
        ai_content = f"Communication failure with AI Engine: {str(e)[:100]}"

    # Save AI response
    ai_msg = ChatMessage(
        user_id=current_user.id,
        sender="ai",
        content=ai_content,
        related_opportunity_id=req.opportunity_id
    )
    db.add(ai_msg)
    db.commit()

    return ChatResponse(role="ai", content=ai_content)

@router.get("/history", response_model=List[schemas.ChatMessageResponse])
def get_history(
    limit: int = 50,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """Get chat history for current user."""
    return db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.timestamp.asc()).limit(limit).all()

@router.delete("/{message_id}")
def delete_message(
    message_id: uuid.UUID,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """Delete a chat message."""
    msg = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.user_id == current_user.id
    ).first()
    
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    db.delete(msg)
    db.commit()
    return {"success": True}

class EditRequest(BaseModel):
    content: str

@router.patch("/{message_id}")
def edit_message(
    message_id: uuid.UUID,
    req: EditRequest,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """Edit a chat message."""
    msg = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.user_id == current_user.id
    ).first()
    
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    msg.content = req.content
    db.commit()
    return {"success": True, "content": msg.content}
