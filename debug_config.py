#!/usr/bin/env python
"""Debug script to check loaded configuration."""

from backend.config import settings

print("=" * 60)
print("🔍 NEXUS Configuration Debug")
print("=" * 60)

# LLM Configuration
print("\n📊 LLM Provider Status:")
print(f"  OpenAI (GPT) API Key Set: {bool(settings.openai_api_key)}")
print(f"  Azure OpenAI API Key Set: {bool(settings.azure_openai_api_key)}")
print(f"  Google API Key Set: {bool(settings.google_api_key)}")

print(f"\n✅ Active LLM Provider: {settings.llm_provider.upper()}")

if settings.llm_provider == "openai":
    print("     → Using gpt-5.4-2026-03-05 (RECOMMENDED ⭐)")
elif settings.llm_provider == "azure":
    print(f"     → Using {settings.azure_openai_deployment}")
elif settings.llm_provider == "gemini":
    print("     → Using gemini-2.0-flash")
else:
    print("     → Using HuggingFace fallback (LOCAL, no API)")

# Database Configuration
print(f"\n🗄️  Database:")
print(f"  MongoDB URL: {settings.mongodb_url}")
print(f"  Database: {settings.mongodb_db_name}")

# Paths
print(f"\n📁 Paths:")
print(f"  FAISS Index: {settings.faiss_index_path}")
print(f"  Upload Dir: {settings.upload_dir}")

print("\n" + "=" * 60)
