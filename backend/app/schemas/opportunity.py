from pydantic import BaseModel, computed_field
from typing import List, Optional
from datetime import datetime

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

class OpportunityResponse(OpportunityBase):
    id: int
    slug: Optional[str] = None
    
    # AI Stats
    ai_score: int = 0
    ai_summary: Optional[str] = None
    win_probability: str = "Medium"
    difficulty: str = "Intermediate"
    required_skills: List[str] = []
    
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
        return self.ai_summary or self.description

    @computed_field
    @property
    def requirements(self) -> List[str]:
        return self.required_skills

    class Config:
        from_attributes = True
