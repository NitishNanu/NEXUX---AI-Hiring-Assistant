"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):

    # --- Standard OpenAI (GPT) ---
    openai_api_key: str = ""

    # --- Google Gemini ---
    google_api_key: str = ""

    # --- Paths ---
    faiss_index_path: str = "./data/faiss_index"
    upload_dir: str = "./data/uploads"

    # --- CORS ---
    cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,"
        "http://localhost:3000,http://127.0.0.1:5173,"
        "http://127.0.0.1:5174,http://127.0.0.1:3000"
    )

    # --- MongoDB (local) ---
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "nexus"

    # --- JWT ---
    jwt_secret: str = "change-this-secret-minimum-32-characters-long"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def use_openai(self) -> bool:
        """Check if Standard OpenAI (GPT) is configured. RECOMMENDED for better performance."""
        return bool(self.openai_api_key)

    @property
    def use_gemini(self) -> bool:
        """Check if Google Gemini is configured."""
        return bool(self.google_api_key)

    @property
    def llm_provider(self) -> str:
        """Get active LLM provider."""
        if self.use_openai:
            return "openai"
        elif self.use_gemini:
            return "gemini"
        else:
            return "none"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()