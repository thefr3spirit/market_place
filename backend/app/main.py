from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.redis import close_redis
from app.routers import (
    auth_router,
    users_router,
    products_router,
    orders_router,
    messages_router,
    reviews_router,
    search_router,
    wishlist_router,
)
from app.routers import images_router
from app.websockets.chat_socket import chat_websocket

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize search index (gracefully)
    try:
        from app.core.search import init_search_index
        init_search_index()
    except Exception:
        pass  # Search engine may not be available in dev
    logger.info("Marketplace API started")
    yield
    # Shutdown
    await close_redis()
    logger.info("Marketplace API shutdown")


app = FastAPI(
    title="Marketplace API",
    description="Multi-vendor marketplace platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Routers
app.include_router(auth_router.router, prefix="/api")
app.include_router(users_router.router, prefix="/api")
app.include_router(products_router.router, prefix="/api")
app.include_router(orders_router.router, prefix="/api")
app.include_router(messages_router.router, prefix="/api")
app.include_router(reviews_router.router, prefix="/api")
app.include_router(search_router.router, prefix="/api")
app.include_router(wishlist_router.router, prefix="/api")
app.include_router(images_router.router, prefix="/api")

# WebSocket
app.websocket("/ws/chat")(chat_websocket)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
