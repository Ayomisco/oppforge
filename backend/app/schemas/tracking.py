from pydantic import BaseModel, computed_field
from typing import Optional
from datetime import datetime
from .opportunity import OpportunityResponse

class TrackedAppBase(BaseModel):
    status: str = "Interested"
    notes: Optional[str] = None
    submission_link: Optional[str] = None
    reminder_at: Optional[datetime] = None

class TrackedAppCreate(TrackedAppBase):
    opportunity_id: int

class TrackedAppUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    submission_link: Optional[str] = None

class TrackedAppResponse(TrackedAppBase):
    id: int
    user_id: int
    opportunity: OpportunityResponse
    ai_strategy_notes: Optional[str] = None
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    # --- Flattened fields for frontend table ---
    # Frontend tracker page expects flat: { title, type, status, date, reward }
    @computed_field
    @property
    def title(self) -> str:
        return self.opportunity.title if self.opportunity else ""

    @computed_field
    @property
    def type(self) -> str:
        return self.opportunity.category if self.opportunity else ""

    @computed_field
    @property
    def date(self) -> Optional[str]:
        return self.created_at.strftime("%Y-%m-%d") if self.created_at else None

    @computed_field
    @property
    def reward(self) -> Optional[str]:
        return self.opportunity.reward_pool if self.opportunity else None

    class Config:
        from_attributes = True
