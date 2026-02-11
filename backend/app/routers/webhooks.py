from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Any
import json
from app.database import get_db
from app.models import Call

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


class ElevenLabsWebhookPayload(BaseModel):
    """
    Payload structure from ElevenLabs webhooks.
    Note: This is a simplified version - actual payload may vary.
    """
    event_type: str  # e.g., "call.started", "call.ended", "call.transcript"
    call_id: str
    timestamp: Optional[str] = None
    data: Optional[dict[str, Any]] = None


@router.post("/elevenlabs")
async def handle_elevenlabs_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Handle incoming webhooks from ElevenLabs.
    This captures call events and stores them in the database.
    """
    try:
        body = await request.json()
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = body.get("event_type", body.get("type", "unknown"))
    call_id = body.get("call_id", body.get("conversation_id"))

    if not call_id:
        # Log but don't fail - might be a test webhook
        return {"status": "ignored", "reason": "No call_id in payload"}

    if event_type in ["call.started", "conversation.started"]:
        # Create new call record
        existing = db.query(Call).filter(Call.elevenlabs_call_id == call_id).first()
        if not existing:
            call = Call(
                elevenlabs_call_id=call_id,
                started_at=datetime.utcnow(),
                status="in_progress",
                caller_id=body.get("data", {}).get("caller_id"),
            )
            db.add(call)
            db.commit()
            return {"status": "created", "call_id": call.id}
        return {"status": "exists", "call_id": existing.id}

    elif event_type in ["call.ended", "conversation.ended"]:
        # Update existing call
        call = db.query(Call).filter(Call.elevenlabs_call_id == call_id).first()
        if call:
            call.ended_at = datetime.utcnow()
            call.status = "completed"

            # Calculate duration if we have start time
            if call.started_at:
                duration = (call.ended_at - call.started_at).total_seconds()
                call.duration_seconds = int(duration)

            # Extract transcript if provided
            data = body.get("data", {})
            if "transcript" in data:
                call.transcript = data["transcript"]
            if "summary" in data:
                call.summary = data["summary"]

            db.commit()
            return {"status": "updated", "call_id": call.id}
        return {"status": "not_found"}

    elif event_type in ["call.transcript", "conversation.transcript"]:
        # Update transcript for existing call
        call = db.query(Call).filter(Call.elevenlabs_call_id == call_id).first()
        if call:
            data = body.get("data", {})
            call.transcript = data.get("transcript", call.transcript)
            db.commit()
            return {"status": "transcript_updated"}
        return {"status": "not_found"}

    # Unknown event type - log it
    return {"status": "ignored", "event_type": event_type}


@router.post("/elevenlabs/tool")
async def handle_tool_call(request: Request):
    """
    Handle tool calls from ElevenLabs agent.
    This is called when the agent wants to query the knowledge base.
    """
    try:
        body = await request.json()
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Extract tool name and parameters
    tool_name = body.get("tool_name", body.get("name"))
    parameters = body.get("parameters", body.get("input", {}))

    if tool_name == "query_knowledge":
        # Forward to knowledge base
        from app.services.knowledge_base import KnowledgeBaseService
        kb = KnowledgeBaseService()

        query = parameters.get("query", "")
        hotel_id = parameters.get("hotel_id")

        results = kb.query(query=query, hotel_id=hotel_id, n_results=3)

        # Format response for the agent
        if results:
            response_text = "\n\n".join([
                f"**{r['metadata'].get('category', 'Info')}**: {r['content']}"
                for r in results
            ])
        else:
            response_text = "I couldn't find specific information about that. Please ask about our hotels, rooms, amenities, or policies."

        return {"response": response_text}

    return {"error": f"Unknown tool: {tool_name}"}
