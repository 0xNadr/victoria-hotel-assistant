from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.feedback import FeedbackResponse


class CallBase(BaseModel):
    elevenlabs_call_id: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: str = "completed"
    caller_id: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    topics: Optional[str] = None


class CallCreate(CallBase):
    pass


class CallUpdate(BaseModel):
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    topics: Optional[str] = None


class CallResponse(CallBase):
    id: str
    created_at: datetime
    updated_at: datetime
    feedback: Optional[FeedbackResponse] = None

    class Config:
        from_attributes = True


class CallListResponse(BaseModel):
    calls: list[CallResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
