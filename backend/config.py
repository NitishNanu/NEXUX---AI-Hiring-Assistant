"""
Application configuration loaded from environment variables.

All settings are sourced from the .env file (or real environment variables).
Pydantic-settings validates types and provides defaults.
"""

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):

    # ── LLM providers ────────────────────────────────────────────────
    openai_api_key: str = ""
    google_api_key: str = ""

    # Model names are exposed as config so they can be overridden via .env
    # without touching source code.
    openai_model: str = "gpt-5.4-2026-03-05"
    gemini_model: str = "gemini-2.0-flash"

    # ── Paths ────────────────────────────────────────────────────────
    faiss_index_path: str = "./data/faiss_index"
    upload_dir: str = "./data/uploads"

    # Maximum size (bytes) accepted for uploaded resume files (default 10 MB)
    max_upload_bytes: int = 10 * 1024 * 1024

    # ── CORS ─────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins.  Must NOT contain "*" when
    # allow_credentials is True (browsers reject that combination).
    cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,"
        "http://localhost:3000,http://127.0.0.1:5173,"
        "http://127.0.0.1:5174,http://127.0.0.1:3000"
    )

    # ── MongoDB ──────────────────────────────────────────────────────
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "nexus"

    # ── JWT ──────────────────────────────────────────────────────────
    jwt_secret: str = "change-this-secret-minimum-32-characters-long"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # ── Rate limiting ────────────────────────────────────────────────
    # Maximum login/register attempts per minute per IP
    auth_rate_limit: str = "20/minute"

    # ── Feature flags ────────────────────────────────────────────────
    skip_vector_store: bool = False
    skip_lora_export: bool = False

    # ── Properties ───────────────────────────────────────────────────

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def use_openai(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def use_gemini(self) -> bool:
        return bool(self.google_api_key)

    @property
    def llm_provider(self) -> str:
        if self.use_openai:
            return "openai"
        if self.use_gemini:
            return "gemini"
        return "none"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()