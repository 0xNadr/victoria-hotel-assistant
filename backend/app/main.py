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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Initialize database tables on startup
    init_db()
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
