from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.knowledge_base import KnowledgeBaseService

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class KnowledgeQuery(BaseModel):
    query: str
    hotel_id: Optional[str] = None  # Filter by specific hotel
    n_results: int = 3


class KnowledgeResult(BaseModel):
    content: str
    metadata: dict
    relevance_score: float


class KnowledgeResponse(BaseModel):
    results: list[KnowledgeResult]
    query: str


# Initialize knowledge base service
kb_service = KnowledgeBaseService()


@router.post("/query", response_model=KnowledgeResponse)
async def query_knowledge(query_data: KnowledgeQuery):
    """
    Query the knowledge base for relevant information.
    This endpoint is called by the ElevenLabs agent as a tool.
    """
    try:
        results = kb_service.query(
            query=query_data.query,
            hotel_id=query_data.hotel_id,
            n_results=query_data.n_results,
        )

        return KnowledgeResponse(
            results=[
                KnowledgeResult(
                    content=r["content"],
                    metadata=r["metadata"],
                    relevance_score=r["score"],
                )
                for r in results
            ],
            query=query_data.query,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge base error: {str(e)}")


@router.get("/health")
async def knowledge_health():
    """Check if knowledge base is initialized and healthy."""
    try:
        status = kb_service.get_status()
        return {"status": "healthy", **status}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
