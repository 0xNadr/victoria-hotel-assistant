#!/usr/bin/env python3
"""
Seed sample call data for testing the Control Center.
Run from the backend directory: python -m scripts.seed_sample_calls
"""

import os
import sys
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import Call, Feedback


SAMPLE_TRANSCRIPTS = [
    {
        "transcript": """Customer: Hi, I'd like to know about parking at your Berlin hotel.
Viktoria: Hello! Welcome to Dormero Hotels. Our Berlin Ku'damm hotel offers underground parking for 25 EUR per day. The garage has a height limit of 1.90 meters. Would you like me to help with anything else?
Customer: Is there EV charging available?
Viktoria: Yes, electric vehicle charging stations are available upon request. Just let us know when you make your reservation and we'll arrange it for you.
Customer: Great, thank you!
Viktoria: You're welcome! Have a wonderful day.""",
        "summary": "Customer inquired about parking options and EV charging at Berlin hotel",
        "topics": "parking,ev-charging,berlin",
    },
    {
        "transcript": """Customer: Can I bring my dog to the hotel?
Viktoria: Absolutely! Dormero Hotels are pet-friendly. We welcome dogs and cats at our Berlin hotel for a fee of 15 EUR per night. We can also provide water bowls and pet beds upon request.
Customer: That's great! What about leaving the dog in the room?
Viktoria: We kindly ask that pets are not left unattended in the room. Is there anything else I can help you with?
Customer: No, that's all. Thanks!
Viktoria: You're welcome! We look forward to hosting you and your furry friend.""",
        "summary": "Customer asked about pet policy for bringing their dog",
        "topics": "pets,policy,berlin",
    },
    {
        "transcript": """Customer: What time is check-in?
Viktoria: Check-in at DORMERO Hotel Berlin Ku'damm is from 3:00 PM. Check-out is by 12:00 PM noon. Early check-in or late check-out may be available upon request, subject to availability.
Customer: Can I get early check-in?
Viktoria: Early check-in is subject to availability and may incur additional charges. I recommend contacting the hotel directly on the day of arrival to check availability.
Customer: OK, thank you.
Viktoria: You're welcome! Enjoy your stay.""",
        "summary": "Customer inquired about check-in and check-out times",
        "topics": "check-in,check-out,policy",
    },
    {
        "transcript": """Customer: I need to cancel my reservation.
Viktoria: I understand. Our standard cancellation policy allows free cancellation up to 24 hours before check-in. When is your reservation for?
Customer: It's for tomorrow actually.
Viktoria: Since that's less than 24 hours away, unfortunately the first night would be charged. However, I recommend contacting our reservations team directly as they may be able to help depending on the circumstances.
Customer: I see. What's the number?
Viktoria: You can reach our Berlin hotel at +49 30 21234-0. They'll be happy to assist you.
Customer: Thanks for your help.""",
        "summary": "Customer asked about cancellation policy for next-day reservation",
        "topics": "cancellation,policy,reservations",
    },
    {
        "transcript": """Customer: Do you have a gym?
Viktoria: Yes! DORMERO Hotel Berlin Ku'damm has a fitness center available for all guests. It's equipped with modern cardio machines and free weights, and access is complimentary 24 hours a day.
Customer: Perfect. What about breakfast?
Viktoria: Breakfast is served daily from 6:30 AM to 10:30 AM, and until 11:00 AM on weekends. We offer an international buffet with regional specialties.
Customer: Sounds good, thank you!
Viktoria: You're welcome! Let me know if you have any other questions.""",
        "summary": "Customer asked about fitness center and breakfast options",
        "topics": "fitness,breakfast,amenities",
    },
]


def create_sample_calls(
    num_calls: int = 25,
    clear_existing: bool = True,
    only_if_empty: bool = False,
):
    """Create sample call records."""
    init_db()
    db = SessionLocal()

    try:
        if only_if_empty:
            existing_count = db.query(Call).count()
            if existing_count > 0:
                print(f"Sample calls not seeded: {existing_count} calls already exist")
                return

        if clear_existing:
            # Clear existing data
            db.query(Feedback).delete()
            db.query(Call).delete()
            db.commit()

        calls_created = []

        for i in range(num_calls):
            # Random timestamp within last 30 days
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            started_at = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)

            # Random duration between 30 seconds and 5 minutes
            duration = random.randint(30, 300)
            ended_at = started_at + timedelta(seconds=duration)

            # Pick a random transcript
            sample = random.choice(SAMPLE_TRANSCRIPTS)

            # Random status (mostly completed)
            status = random.choices(
                ["completed", "dropped"],
                weights=[0.9, 0.1],
            )[0]

            call = Call(
                elevenlabs_call_id=f"11labs_sample_{i}",
                started_at=started_at,
                ended_at=ended_at,
                duration_seconds=duration,
                status=status,
                caller_id=f"+49 {random.randint(100, 999)} {random.randint(1000000, 9999999)}",
                transcript=sample["transcript"],
                summary=sample["summary"],
                topics=sample["topics"],
            )
            db.add(call)
            db.flush()
            calls_created.append(call)

        db.commit()

        # Add feedback to ~60% of calls
        for call in calls_created:
            if random.random() < 0.6:
                rating = random.choices(
                    [1, 2, 3, 4, 5],
                    weights=[0.05, 0.1, 0.15, 0.35, 0.35],
                )[0]

                comments = [
                    None,
                    "Very helpful!",
                    "Agent was knowledgeable.",
                    "Quick and efficient.",
                    "Could be more detailed.",
                    "Great service!",
                    "Answered all my questions.",
                    None,
                    None,
                ]

                feedback = Feedback(
                    call_id=call.id,
                    rating=rating,
                    comment=random.choice(comments),
                    created_by=random.choice(["Operator A", "Operator B", None]),
                )
                db.add(feedback)

        db.commit()
        print(f"Created {num_calls} sample calls with feedback")

    finally:
        db.close()


if __name__ == "__main__":
    create_sample_calls()
