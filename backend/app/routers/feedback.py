from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models.feedback import Feedback

router = APIRouter(prefix="/api", tags=["feedback"])

class FeedbackCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[int] = 0
    bugs: Optional[str] = None
    ux_feedback: Optional[str] = None
    feature_requests: Optional[str] = None
    comments: Optional[str] = None

@router.post("/feedback")
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    fb = Feedback(
        name=data.name,
        email=data.email,
        category=data.category,
        rating=data.rating,
        bugs=data.bugs,
        ux_feedback=data.ux_feedback,
        feature_requests=data.feature_requests,
        comments=data.comments,
    )
    db.add(fb)
    db.commit()
    return {"status": "ok", "message": "Feedback received"}
