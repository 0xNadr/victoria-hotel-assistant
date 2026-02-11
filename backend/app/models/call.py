import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Call(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    elevenlabs_call_id = Column(String(100), unique=True, index=True, nullable=True)

    # Call metadata
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    status = Column(String(20), default="completed")  # completed, dropped, in_progress

    # Caller info
    caller_id = Column(String(50), nullable=True)  # Phone number if available

    # Conversation content
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    # Topics/tags for filtering
    topics = Column(String(500), nullable=True)  # Comma-separated topics

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to feedback
    feedback = relationship("Feedback", back_populates="call", uselist=False)

    def __repr__(self):
        return f"<Call {self.id} - {self.status}>"
