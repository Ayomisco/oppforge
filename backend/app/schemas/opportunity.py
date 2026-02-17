from pydantic import BaseModel, computed_field
from typing import List, Optional
from datetime import datetime
import uuid

class OpportunityBase(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    
    source: str
    category: str
    sub_category: Optional[str] = None
    chain: str
    tags: List[str] = []
    
    reward_pool: Optional[str] = None
    reward_token: Optional[str] = None
    deadline: Optional[datetime] = None
    
    is_open: bool = True

class OpportunityCreate(OpportunityBase):
    source_id: Optional[str] = None
    source_url: Optional[str] = None
    posted_at: Optional[datetime] = None
    mission_requirements: List[str] = []
    trust_score: int = 100

class OpportunityResponse(OpportunityBase):
    id: uuid.UUID
    slug: Optional[str] = None
    
    # AI Stats
    ai_score: int = 0
    ai_summary: Optional[str] = None
    ai_strategy: Optional[str] = None
    win_probability: str = "Medium"
    difficulty: str = "Intermediate"
    required_skills: List[str] = []
    mission_requirements: List[str] = [] # Real field from DB
    trust_score: int = 70
    
    is_verified: bool = False
    views_count: int = 0
    created_at: Optional[datetime] = None

    # --- Frontend Aliases ---
    # These computed fields ensure the API returns field names
    # that match what the frontend expects (type, reward, score, summary)
    @computed_field
    @property
    def type(self) -> str:
        return self.category

    @computed_field
    @property
    def reward(self) -> Optional[str]:
        return self.reward_pool

    @computed_field
    @property
    def score(self) -> int:
        return self.ai_score

    @computed_field
    @property
    def summary(self) -> Optional[str]:
        return self.ai_summary or (self.description[:300] if self.description else "")

    @computed_field
    @property
    def strategy(self) -> Optional[str]:
        return self.ai_strategy or "Focus on community engagement and technical excellence."

    @computed_field
    @property
    def requirements(self) -> List[str]:
        # Return real requirements if they exist, otherwise fallback to skills
        if hasattr(self, 'mission_requirements') and self.mission_requirements:
            return self.mission_requirements
        return self.required_skills

    class Config:
        from_attributes = True
