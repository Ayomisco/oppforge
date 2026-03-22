from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func, desc, or_
import uuid
import logging
from typing import List, Optional
from pydantic import BaseModel
from .. import database, schemas
from ..models.chat import ChatMessage
from ..models.opportunity import Opportunity
from .auth import get_current_user, check_subscription_clearance
import os
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

class ChatRequest(BaseModel):
    message: str
    opportunity_id: Optional[uuid.UUID] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    role: str
    content: str
    session_id: Optional[str] = None


async def _call_gemini(messages: list) -> str | None:
    """Gemini fallback — used when Groq hits rate limits."""
    if not GEMINI_API_KEY:
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                GEMINI_URL,
                headers={
                    "Authorization": f"Bearer {GEMINI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"model": GEMINI_MODEL, "messages": messages, "temperature": 0.8, "max_tokens": 1000},
                timeout=20.0,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            logger.error(f"Gemini error: {resp.status_code} - {resp.text[:200]}")
    except Exception as e:
        logger.error(f"Gemini exception: {e}")
    return None


async def _call_groq_direct(
    message: str,
    user_profile: dict,
    opportunity: dict = None,
    relevant_opportunities: list = None,
) -> str:
    """Direct Groq API fallback when AI Engine service is unreachable."""
    if not GROQ_API_KEY:
        return "Forge AI is temporarily unavailable. Please try again later."

    skills = (user_profile.get("skills") or []) if user_profile else []
    chains = (user_profile.get("preferred_chains") or []) if user_profile else []
    level = (user_profile.get("level") or 1) if user_profile else 1
    xp = (user_profile.get("xp") or 0) if user_profile else 0

    system_prompt = (
        "You are Forge AI — OppForge's personalized Web3 opportunity agent. "
        "OppForge is a platform that aggregates grants, hackathons, bounties, testnets, and ambassador programs across all major blockchains. "
        "Your role: recommend opportunities, help users write proposals, brainstorm strategies, and provide Web3 career guidance. "
        "You have access to live opportunity data from the platform — always reference specific opportunities by name, reward, and deadline when relevant. "
        "Personalize every response to the user's skills, level, and preferred chains. "
        "Be direct, tactical, and actionable. Keep responses concise unless drafting a proposal."
    )

    # Build context
    context_parts = []
    if user_profile:
        context_parts.append(
            f"USER PROFILE:\n"
            f"  Name: {user_profile.get('full_name', 'Operator')}\n"
            f"  Level: {level} | XP: {xp}\n"
            f"  Skills: {', '.join(skills) if skills else 'Not specified'}\n"
            f"  Preferred Chains: {', '.join(chains) if chains else 'Not specified'}\n"
            f"  Bio: {user_profile.get('bio') or 'Not provided'}"
        )

    if opportunity:
        context_parts.append(
            f"FOCUSED OPPORTUNITY:\n"
            f"  Title: {opportunity.get('title', 'Unknown')}\n"
            f"  Category: {opportunity.get('category', 'N/A')} | Chain: {opportunity.get('chain', 'N/A')}\n"
            f"  Reward: {opportunity.get('reward_pool', 'N/A')}\n"
            f"  Requirements: {opportunity.get('mission_requirements', [])}"
        )

    if relevant_opportunities:
        opp_lines = []
        for o in relevant_opportunities:
            deadline_str = o.get("deadline", "")
            if deadline_str:
                deadline_str = f" | Deadline: {deadline_str}"
            opp_lines.append(
                f"  • [{o.get('category', '?')}] {o.get('title')} — {o.get('reward_pool', 'N/A')}"
                f"{deadline_str} | Chain: {o.get('chain', 'N/A')}"
            )
        context_parts.append("PLATFORM OPPORTUNITIES (live data):\n" + "\n".join(opp_lines))

    user_content = message
    if context_parts:
        user_content = "\n\n".join(context_parts) + "\n\nUSER MESSAGE:\n" + message

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.8, "max_tokens": 1000},
                timeout=20.0,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            if resp.status_code == 429:
                logger.warning("Groq rate limit hit, falling back to Gemini")
                result = await _call_gemini(messages)
                if result:
                    return result
            logger.error(f"Groq fallback error: {resp.status_code} - {resp.text[:200]}")
            return "Forge AI is experiencing high load. Please try again in a moment."
    except Exception as e:
        logger.error(f"Groq fallback exception: {e}")
        result = await _call_gemini(messages)
        if result:
            return result
        return "Forge AI is temporarily unavailable. Please try again later."


def _fetch_relevant_opportunities(db: Session, message: str, current_user) -> list:
    """
    Fetch top platform opportunities relevant to this conversation.
    Matches on user skills/chains; falls back to most-recently-active open opps.
    Returns a list of dicts for injection into AI context.
    """
    try:
        now = datetime.utcnow()
        recently_active = sql_func.coalesce(Opportunity.updated_at, Opportunity.created_at)

        # Build base query: only open opportunities (no deadline or future deadline)
        base_q = db.query(Opportunity).filter(
            or_(Opportunity.deadline.is_(None), Opportunity.deadline >= now)
        )

        # Try to match opportunities by user skills or preferred chains
        skills = current_user.skills or []
        preferred_chains = getattr(current_user, "preferred_chains", None) or []

        # Keyword matching from message (look for category/chain hints)
        msg_lower = message.lower()
        category_hints = []
        for kw, cat in [
            ("hackathon", "Hackathon"), ("grant", "Grant"), ("bounty", "Bounty"),
            ("testnet", "Testnet"), ("ambassador", "Ambassador"), ("airdrop", "Airdrop"),
        ]:
            if kw in msg_lower:
                category_hints.append(cat)

        scored_opps = []

        # Get top candidates, score them, return best 6
        candidates = base_q.order_by(desc(recently_active)).limit(50).all()
        for opp in candidates:
            score = 0
            # Category hint match
            if opp.category in category_hints:
                score += 3
            # Chain match
            if opp.chain and any(c.lower() in (opp.chain or "").lower() for c in preferred_chains):
                score += 2
            # Skill overlap (tags or description)
            if skills and opp.tags:
                skill_hit = any(s.lower() in " ".join(opp.tags).lower() for s in skills)
                if skill_hit:
                    score += 2
            scored_opps.append((score, opp))

        # Sort by score desc, then pick top 6
        scored_opps.sort(key=lambda x: x[0], reverse=True)
        top_opps = [opp for _, opp in scored_opps[:6]]

        result = []
        for opp in top_opps:
            deadline_str = opp.deadline.strftime("%b %d, %Y") if opp.deadline else None
            result.append({
                "title": opp.title,
                "category": opp.category,
                "chain": opp.chain,
                "reward_pool": opp.reward_pool,
                "deadline": deadline_str,
                "tags": opp.tags or [],
            })
        return result
    except Exception as e:
        logger.warning(f"Failed to fetch relevant opportunities for chat: {e}")
        return []


@router.post("", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    db: Session = Depends(database.get_db),
    current_user = Depends(check_subscription_clearance)
):
    """
    Send a message to Forge AI. Requires active subscription.
    Tries AI Engine first, falls back to direct Groq API call.
    Auto-assigns a session_id for conversation threading.
    """
    # Resolve or create session
    session_id = req.session_id or str(uuid.uuid4())

    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        sender="user",
        content=req.message,
        related_opportunity_id=req.opportunity_id
    )
    db.add(user_msg)

    # Build user profile context (includes onboarding data)
    user_profile = {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "skills": current_user.skills,
        "xp": current_user.xp,
        "level": current_user.level,
        "bio": current_user.bio,
        "preferred_chains": getattr(current_user, "preferred_chains", None),
    }

    # Fetch focused opportunity if ID provided
    opportunity_context = None
    if req.opportunity_id:
        opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
        if opp:
            opportunity_context = {
                "id": str(opp.id),
                "title": opp.title,
                "description": opp.description,
                "category": opp.category,
                "chain": opp.chain,
                "reward_pool": opp.reward_pool,
                "trust_score": opp.trust_score,
                "mission_requirements": opp.mission_requirements,
            }

    # Fetch relevant opportunities from DB to inject as platform context
    relevant_opps = _fetch_relevant_opportunities(db, req.message, current_user)

    ai_content = None

    # Strategy 1: Try AI Engine service (if URL is not localhost default)
    if AI_ENGINE_URL and "localhost" not in AI_ENGINE_URL:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{AI_ENGINE_URL}/ai/chat",
                    json={
                        "message": req.message,
                        "user_profile": user_profile,
                        "opportunity": opportunity_context,
                        "relevant_opportunities": relevant_opps,
                    },
                    timeout=10.0,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    ai_content = data.get("response")
        except Exception as e:
            logger.warning(f"AI Engine unreachable, falling back to Groq: {e}")

    # Strategy 2: Direct Groq API fallback (always available)
    if not ai_content:
        ai_content = await _call_groq_direct(
            req.message, user_profile, opportunity_context, relevant_opps
        )

    # Save AI response
    ai_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        sender="ai",
        content=ai_content,
        related_opportunity_id=req.opportunity_id
    )
    db.add(ai_msg)
    db.commit()

    return ChatResponse(role="ai", content=ai_content, session_id=session_id)

@router.get("/sessions", response_model=List[schemas.ChatSessionResponse])
def list_sessions(
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """List all chat sessions for the current user, newest first."""
    from sqlalchemy import case

    # Get sessions with their latest message and count
    sessions = (
        db.query(
            ChatMessage.session_id,
            sql_func.count(ChatMessage.id).label("message_count"),
            sql_func.max(ChatMessage.timestamp).label("updated_at"),
        )
        .filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id.isnot(None),
        )
        .group_by(ChatMessage.session_id)
        .order_by(desc("updated_at"))
        .limit(50)
        .all()
    )

    result = []
    for sess in sessions:
        # Get the first user message as title
        first_msg = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.session_id == sess.session_id,
                ChatMessage.sender == "user",
            )
            .order_by(ChatMessage.timestamp.asc())
            .first()
        )
        # Get the last message as preview
        last_msg = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == sess.session_id)
            .order_by(ChatMessage.timestamp.desc())
            .first()
        )

        title = (first_msg.content[:80] + "...") if first_msg and len(first_msg.content) > 80 else (first_msg.content if first_msg else "New Chat")
        last_content = (last_msg.content[:100] + "...") if last_msg and len(last_msg.content) > 100 else (last_msg.content if last_msg else "")

        result.append(schemas.ChatSessionResponse(
            session_id=sess.session_id,
            title=title,
            last_message=last_content,
            message_count=sess.message_count,
            updated_at=sess.updated_at,
        ))

    return result


@router.get("/sessions/{session_id}", response_model=List[schemas.ChatMessageResponse])
def get_session_messages(
    session_id: str,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """Get all messages for a specific chat session."""
    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id,
        )
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )
    return messages


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """Delete an entire chat session."""
    deleted = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id,
        )
        .delete()
    )
    db.commit()
    return {"success": True, "deleted_count": deleted}


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
