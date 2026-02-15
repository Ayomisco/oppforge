from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List, Optional
from pydantic import BaseModel
from .. import database, schemas
from ..models.chat import ChatMessage
from .auth import get_current_user
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
    current_user = Depends(get_current_user)
):
    """
    Send a message to Forge AI. Uses Groq API for fast LLM inference.
    """
    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        sender="user",
        content=req.message,
        related_opportunity_id=req.opportunity_id
    )
    db.add(user_msg)
    
    # Build context
    context = f"User '{current_user.full_name}' with skills {current_user.skills} asks: {req.message}"
    
    if req.opportunity_id:
        from ..models.opportunity import Opportunity
        opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
        if opp:
            context += f"\n\nContext - Opportunity: {opp.title} ({opp.category})\nChain: {opp.chain}\nReward: {opp.reward_pool}\nDescription: {opp.description}"

    # Call Groq AI
    try:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            ai_content = f"I've analyzed your request about \"{req.message}\". Based on current data, I recommend exploring the opportunity further. Note: AI service not configured — set GROQ_API_KEY in .env."
        else:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [
                            {"role": "system", "content": "You are Forge AI, a Web3 opportunity advisor for OppForge. Be concise, tactical, and data-driven. Help users evaluate grants, hackathons, bounties, and airdrops."},
                            {"role": "user", "content": context}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500
                    },
                    timeout=15.0
                )
                data = resp.json()
                ai_content = data["choices"][0]["message"]["content"]
    except Exception as e:
        ai_content = f"I encountered an issue processing your request. Please try again. (Error: {str(e)[:100]})"

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
    ).order_by(ChatMessage.timestamp.desc()).limit(limit).all()
