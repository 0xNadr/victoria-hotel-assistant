from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import Call, Feedback

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class SummaryMetrics(BaseModel):
    total_calls: int
    completed_calls: int
    dropped_calls: int
    average_duration_seconds: Optional[float]
    average_rating: Optional[float]
    total_ratings: int
    calls_with_feedback: int


class CallVolumePoint(BaseModel):
    date: str
    count: int


class RatingDistribution(BaseModel):
    rating: int
    count: int


@router.get("/summary", response_model=SummaryMetrics)
def get_summary_metrics(
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    db: Session = Depends(get_db),
):
    """Get summary metrics for the dashboard."""
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Base query for calls in the time period
    calls_query = db.query(Call).filter(Call.started_at >= cutoff_date)

    total_calls = calls_query.count()
    completed_calls = calls_query.filter(Call.status == "completed").count()
    dropped_calls = calls_query.filter(Call.status == "dropped").count()

    # Average duration
    avg_duration = (
        calls_query.filter(Call.duration_seconds.isnot(None))
        .with_entities(func.avg(Call.duration_seconds))
        .scalar()
    )

    # Feedback metrics
    feedback_query = (
        db.query(Feedback)
        .join(Call)
        .filter(Call.started_at >= cutoff_date)
    )

    total_ratings = feedback_query.count()
    avg_rating = feedback_query.with_entities(func.avg(Feedback.rating)).scalar()

    # Calls with feedback
    calls_with_feedback = (
        calls_query.filter(Call.feedback != None).count()
    )

    return SummaryMetrics(
        total_calls=total_calls,
        completed_calls=completed_calls,
        dropped_calls=dropped_calls,
        average_duration_seconds=round(avg_duration) if avg_duration else None,
        average_rating=round(avg_rating, 2) if avg_rating else None,
        total_ratings=total_ratings,
        calls_with_feedback=calls_with_feedback,
    )


@router.get("/calls-over-time", response_model=list[CallVolumePoint])
def get_calls_over_time(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Get daily call volume for the specified period."""
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Group by date
    results = (
        db.query(
            func.date(Call.started_at).label("date"),
            func.count(Call.id).label("count"),
        )
        .filter(Call.started_at >= cutoff_date)
        .group_by(func.date(Call.started_at))
        .order_by(func.date(Call.started_at))
        .all()
    )

    return [
        CallVolumePoint(date=str(row.date), count=row.count)
        for row in results
    ]


@router.get("/ratings", response_model=list[RatingDistribution])
def get_rating_distribution(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Get distribution of ratings."""
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    results = (
        db.query(Feedback.rating, func.count(Feedback.id).label("count"))
        .join(Call)
        .filter(Call.started_at >= cutoff_date)
        .group_by(Feedback.rating)
        .order_by(Feedback.rating)
        .all()
    )

    # Ensure all ratings 1-5 are represented
    rating_counts = {row.rating: row.count for row in results}
    return [
        RatingDistribution(rating=i, count=rating_counts.get(i, 0))
        for i in range(1, 6)
    ]
