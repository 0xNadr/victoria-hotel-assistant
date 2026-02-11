from app.routers.calls import router as calls_router
from app.routers.feedback import router as feedback_router
from app.routers.knowledge import router as knowledge_router
from app.routers.webhooks import router as webhooks_router
from app.routers.analytics import router as analytics_router

__all__ = [
    "calls_router",
    "feedback_router",
    "knowledge_router",
    "webhooks_router",
    "analytics_router",
]
