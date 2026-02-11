from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Call, Feedback
from app.schemas import FeedbackCreate, FeedbackUpdate, FeedbackResponse

router = APIRouter(prefix="/api/calls", tags=["feedback"])


@router.get("/{call_id}/feedback", response_model=FeedbackResponse)
def get_feedback(call_id: str, db: Session = Depends(get_db)):
    """Get feedback for a specific call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if not call.feedback:
        raise HTTPException(status_code=404, detail="No feedback for this call")

    return call.feedback


@router.post("/{call_id}/feedback", response_model=FeedbackResponse, status_code=201)
def create_feedback(
    call_id: str, feedback_data: FeedbackCreate, db: Session = Depends(get_db)
):
    """Add feedback to a call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    # Check if feedback already exists
    if call.feedback:
        raise HTTPException(
            status_code=400, detail="Feedback already exists for this call"
        )

    feedback = Feedback(call_id=call_id, **feedback_data.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.patch("/{call_id}/feedback", response_model=FeedbackResponse)
def update_feedback(
    call_id: str, feedback_data: FeedbackUpdate, db: Session = Depends(get_db)
):
    """Update feedback for a call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if not call.feedback:
        raise HTTPException(status_code=404, detail="No feedback to update")

    update_data = feedback_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(call.feedback, field, value)

    db.commit()
    db.refresh(call.feedback)
    return call.feedback


@router.delete("/{call_id}/feedback", status_code=204)
def delete_feedback(call_id: str, db: Session = Depends(get_db)):
    """Delete feedback for a call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if not call.feedback:
        raise HTTPException(status_code=404, detail="No feedback to delete")

    db.delete(call.feedback)
    db.commit()
