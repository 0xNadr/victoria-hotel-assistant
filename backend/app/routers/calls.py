from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app.database import get_db
from app.models import Call
from app.schemas import CallCreate, CallUpdate, CallResponse, CallListResponse

router = APIRouter(prefix="/api/calls", tags=["calls"])


@router.get("", response_model=CallListResponse)
def list_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all calls with pagination."""
    query = db.query(Call)

    if status:
        query = query.filter(Call.status == status)

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    calls = (
        query.order_by(desc(Call.started_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return CallListResponse(
        calls=[CallResponse.model_validate(call) for call in calls],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{call_id}", response_model=CallResponse)
def get_call(call_id: str, db: Session = Depends(get_db)):
    """Get a single call by ID."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@router.post("", response_model=CallResponse, status_code=201)
def create_call(call_data: CallCreate, db: Session = Depends(get_db)):
    """Create a new call record."""
    call = Call(**call_data.model_dump())
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


@router.patch("/{call_id}", response_model=CallResponse)
def update_call(call_id: str, call_data: CallUpdate, db: Session = Depends(get_db)):
    """Update an existing call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    update_data = call_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(call, field, value)

    db.commit()
    db.refresh(call)
    return call


@router.delete("/{call_id}", status_code=204)
def delete_call(call_id: str, db: Session = Depends(get_db)):
    """Delete a call record."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    db.delete(call)
    db.commit()
