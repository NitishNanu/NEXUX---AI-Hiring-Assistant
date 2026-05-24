"""AI Hiring Assistant — FastAPI entry point."""

import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import settings
from backend.database import close_client, init_indexes
from backend.routers import ats, chat, ingest, lora, resume, coding, mcq
from backend.routers import mock_interview_enhanced
from backend.routers.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────
    print("NEXUS starting up…")
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs(settings.faiss_index_path, exist_ok=True)

    try:
        await init_indexes()
    except Exception as exc:
        print(f"⚠️  MongoDB init error: {exc}")

    try:
        from backend.services.rag_pipeline import load_vector_store
        load_vector_store()
    except Exception as exc:
        print(f"Vector store not loaded: {exc}")

    try:
        from backend.services.lora_manager import save_training_data
        save_training_data()
    except Exception as exc:
        print(f"LoRA data not exported: {exc}")

    print("NEXUS ready ✅")
    yield

    # ── Shutdown ─────────────────────────────────────────────────────
    await close_client()
    print("NEXUS shut down.")


app = FastAPI(
    title="NEXUS AI Hiring Assistant",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace later with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# auth first so the dependency is resolvable everywhere
app.include_router(auth_router)
app.include_router(resume.router)
app.include_router(ats.router)
app.include_router(chat.router)
app.include_router(ingest.router)
app.include_router(lora.router)
app.include_router(mock_interview_enhanced.router)
app.include_router(coding.router)
app.include_router(mcq.router)


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "auth": "jwt+mongodb-local",
        "llm_provider": settings.llm_provider,
        "recommended": settings.llm_provider == "openai",
    }


@app.get("/")
async def root():
    return {"message": "NEXUS API", "docs": "/docs"}