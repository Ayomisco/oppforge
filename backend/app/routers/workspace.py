from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_
from typing import List
from datetime import datetime, date
import os
import uuid
import shutil
from pydantic import BaseModel
from .. import database, models
from ..models.user import User
from .auth import get_current_user

router = APIRouter(prefix="/workspace", tags=["workspace"])

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    context: dict = {}

class ChatResponse(BaseModel):
    content: str
    
class UploadResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    uploaded_at: datetime

# File upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "workspace")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Maximum file size: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.md'}

@router.get("/uploads", response_model=List[UploadResponse])
def get_user_uploads(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all uploaded files for the current user"""
    uploads = db.query(models.WorkspaceUpload).filter(
        models.WorkspaceUpload.user_id == current_user.id
    ).order_by(desc(models.WorkspaceUpload.uploaded_at)).all()
    
    return uploads

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload CV or document to workspace.
    Limit: 3 uploads per day per user.
    """
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check daily upload limit
    today = date.today()
    today_uploads = db.query(func.count(models.WorkspaceUpload.id)).filter(
        and_(
            models.WorkspaceUpload.user_id == current_user.id,
            func.date(models.WorkspaceUpload.uploaded_at) == today
        )
    ).scalar()
    
    if today_uploads >= 3:
        raise HTTPException(
            status_code=429,
            detail="Daily upload limit reached (3 files per day)"
        )
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large (max 5MB)"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, 'wb') as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create database record
    upload = models.WorkspaceUpload(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        file_type=file_ext
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    
    return {
        "id": upload.id,
        "filename": upload.filename,
        "file_size": upload.file_size,
        "message": "File uploaded successfully"
    }

@router.delete("/uploads/{upload_id}")
def delete_upload(
    upload_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an uploaded file"""
    upload = db.query(models.WorkspaceUpload).filter(
        models.WorkspaceUpload.id == upload_id,
        models.WorkspaceUpload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Delete physical file
    try:
        if os.path.exists(upload.file_path):
            os.remove(upload.file_path)
    except Exception as e:
        print(f"Failed to delete file: {e}")
    
    # Delete database record
    db.delete(upload)
    db.commit()
    
    return {"message": "File deleted successfully"}

@router.post("/chat", response_model=ChatResponse)
async def workspace_chat(
    payload: ChatRequest,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Chat with AI in workspace context.
    Includes user's uploaded files, skills, and CV context.
    """
    import requests
    
    AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")
    
    # Get user's uploaded files
    uploads = db.query(models.WorkspaceUpload).filter(
        models.WorkspaceUpload.user_id == current_user.id
    ).all()
    
    # Build context
    context_text = f"User: {current_user.full_name}\\n"
    context_text += f"Level: {current_user.level}\\n"
    context_text += f"Skills: {', '.join(current_user.skills or [])}\\n"
    
    if uploads:
        context_text += f"\\nUploaded Documents ({len(uploads)}): {', '.join([u.filename for u in uploads])}\\n"
        context_text += "Note: User has uploaded their CV/portfolio. Use this context when drafting proposals.\\n"
    
    context_text += f"\\nUser Message: {payload.message}"
    
    # Call AI engine
    try:
        response = requests.post(
            f"{AI_ENGINE_URL}/ai/chat",
            json={
                "message": context_text,
                "context": {
                    "user_id": current_user.id,
                    "has_cv": len(uploads) > 0,
                    "skills": current_user.skills or [],
                    "uploaded_files": payload.context.get("uploaded_files", [])
                },
                "model": "llama-3.3-70b-versatile"
            },
            timeout=60
        )
        
        if response.status_code == 200:
            ai_response = response.json().get("content", "I'm having trouble processing that request.")
        else:
            ai_response = "AI engine is temporarily unavailable. Please try again."
    except Exception as e:
        print(f"AI Engine error: {e}")
        ai_response = "I'm experiencing connection issues. Please try again in a moment."
    
    # Save to chat history
    chat_msg = models.WorkspaceChat(
        user_id=current_user.id,
        role="user",
        content=payload.message
    )
    db.add(chat_msg)
    
    ai_msg = models.WorkspaceChat(
        user_id=current_user.id,
        role="assistant",
        content=ai_response
    )
    db.add(ai_msg)
    db.commit()
    
    return ChatResponse(content=ai_response)

@router.get("/history")
def get_chat_history(
    limit: int = 50,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent chat history"""
    messages = db.query(models.WorkspaceChat).filter(
        models.WorkspaceChat.user_id == current_user.id
    ).order_by(desc(models.WorkspaceChat.created_at)).limit(limit).all()
    
    # Reverse to show oldest first
    return list(reversed(messages))
