import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import init_db
from app.routers import (
    calls_router,
    feedback_router,
    knowledge_router,
    webhooks_router,
    analytics_router,
)

settings = get_settings()


def seed_knowledge_base():
    """Seed the knowledge base with hotel data on startup."""
    from app.services.knowledge_base import KnowledgeBaseService

    try:
        kb = KnowledgeBaseService()

        # Check if already seeded
        status = kb.get_status()
        if status["document_count"] > 0:
            print(f"Knowledge base already has {status['document_count']} documents, skipping seed.")
            return

        # Load and seed hotel data
        data_dir = os.path.join(os.path.dirname(__file__), "data", "hotels")

        if not os.path.exists(data_dir):
            print(f"No hotel data directory found at {data_dir}")
            return

        total_docs = 0
        for filename in os.listdir(data_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(data_dir, filename)
                print(f"Loading {filename}...")

                with open(filepath, "r") as f:
                    data = json.load(f)

                hotel_id = data["hotel_id"]
                hotel_name = data["hotel_name"]

                documents = []
                for doc in data["documents"]:
                    documents.append({
                        "id": doc["id"],
                        "content": doc["content"],
                        "metadata": {
                            "hotel_id": hotel_id,
                            "hotel_name": hotel_name,
                            "category": doc["category"],
                        },
                    })

                kb.add_documents(documents)
                total_docs += len(documents)
                print(f"  Added {len(documents)} documents")

        print(f"Knowledge base seeded with {total_docs} documents")
    except Exception as e:
        print(f"Warning: Failed to seed knowledge base: {e}")


def seed_sample_calls_if_enabled():
    """Optionally seed sample call data on startup."""
    if not settings.seed_sample_calls:
        return

    try:
        from scripts.seed_sample_calls import create_sample_calls

        print("Seeding sample call data...")
        create_sample_calls(
            num_calls=settings.seed_sample_calls_count,
            clear_existing=False,
            only_if_empty=settings.seed_sample_calls_only_if_empty,
        )
    except Exception as e:
        print(f"Warning: Failed to seed sample calls: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Initialize database tables on startup
    init_db()

    # Seed sample calls (optional)
    seed_sample_calls_if_enabled()

    # Seed knowledge base (runs in background to not block startup)
    print("Seeding knowledge base...")
    seed_knowledge_base()

    yield
    # Cleanup on shutdown (if needed)


app = FastAPI(
    title=settings.app_name,
    description="Backend API for Viktoria Voice AI - Dormero Hotels",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calls_router)
app.include_router(feedback_router)
app.include_router(knowledge_router)
app.include_router(webhooks_router)
app.include_router(analytics_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "status": "operational",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
