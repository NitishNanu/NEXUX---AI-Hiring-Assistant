"""AI Hiring Assistant — FastAPI entry point."""

from __future__ import annotations

import os
import sys
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import settings
from backend.database import close_client, init_indexes
from backend.exceptions import NexusError
from backend.logger import get_logger
from backend.routers import ats, chat, ingest, lora, resume, coding, mcq
from backend.routers import mock_interview_enhanced
from backend.routers.auth import router as auth_router

log = get_logger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────
    log.info("NEXUS starting up", version="2.0.0")
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs(settings.faiss_index_path, exist_ok=True)

    try:
        await init_indexes()
    except Exception as exc:
        log.warning("MongoDB init error", error=str(exc))

    if not settings.skip_vector_store:
        try:
            from backend.services.rag_pipeline import load_vector_store
            load_vector_store()
        except Exception as exc:
            log.warning("Vector store not loaded", error=str(exc))
    else:
        log.info("Skipping vector store load", reason="SKIP_VECTOR_STORE=true")

    if not settings.skip_lora_export:
        try:
            from backend.services.lora_manager import save_training_data
            save_training_data()
        except Exception as exc:
            log.warning("LoRA data not exported", error=str(exc))
    else:
        log.info("Skipping LoRA training data export", reason="SKIP_LORA_EXPORT=true")

    log.info("NEXUS ready", llm_provider=settings.llm_provider)
    yield

    # ── Shutdown ──────────────────────────────────────────────────────
    await close_client()
    log.info("NEXUS shut down")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="NEXUS AI Hiring Assistant",
    version="2.0.0",
    lifespan=lifespan,
)

# ── Rate limiting (SlowAPI) ───────────────────────────────────────────
_limiter = Limiter(key_func=get_remote_address)
app.state.limiter = _limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS
#
# IMPORTANT: When allow_credentials=True the spec forbids allow_origins=["*"].
# Browsers will reject such a response.  We use the explicit list from config.
# ---------------------------------------------------------------------------

_cors_origins = settings.cors_origin_list

# Warn loudly at startup if no origins are configured
if not _cors_origins:
    print(
        "⚠️  WARNING: cors_origins is empty — CORS will block all cross-origin requests. "
        "Set CORS_ORIGINS in .env."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-Request-ID"],
)


# ---------------------------------------------------------------------------
# Middleware — inject X-Request-ID for traceability
# ---------------------------------------------------------------------------

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(NexusError)
async def nexus_error_handler(request: Request, exc: NexusError):
    """Map domain exceptions to the correct HTTP status codes."""
    log.warning(
        "Domain error",
        path=str(request.url.path),
        status=exc.status_code,
        detail=exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all — prevents leaking stack traces to clients."""
    log.error(
        "Unhandled exception",
        path=str(request.url.path),
        error=str(exc),
        exc_type=type(exc).__name__,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

# Auth first — JWT dependency used by all other routers
app.include_router(auth_router)
app.include_router(resume.router)
app.include_router(ats.router)
app.include_router(chat.router)
app.include_router(ingest.router)
app.include_router(lora.router)
app.include_router(mock_interview_enhanced.router)
app.include_router(coding.router)
app.include_router(mcq.router)


# ---------------------------------------------------------------------------
# Built-in endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health", tags=["System"])
async def health():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "auth": "jwt+mongodb",
        "llm_provider": settings.llm_provider,
        "openai_configured": settings.use_openai,
        "gemini_configured": settings.use_gemini,
    }


@app.get("/", tags=["System"])
async def root():
    return {"message": "NEXUS API", "docs": "/docs"}