from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class FeedbackBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = None
    created_by: Optional[str] = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class FeedbackResponse(FeedbackBase):
    id: str
    call_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
