"""
Master seed runner — runs all seed scripts in the correct order.

Usage (from project root):
    python -m backend.scripts.seed_all

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.scripts.seed_problems import seed_problems
from backend.scripts.seed_mcq import seed_mcq
from backend.scripts.seed_knowledge_base import seed_knowledge_base
from backend.logger import get_logger

log = get_logger(__name__)


async def main():
    print("=" * 60)
    print("  NEXUS Database Seed Runner")
    print("=" * 60)

    print("\n[1/3] Seeding coding problems...")
    await seed_problems()

    print("\n[2/3] Seeding MCQ questions...")
    await seed_mcq()

    print("\n[3/3] Seeding knowledge base (FAISS)...")
    seed_knowledge_base()  # synchronous

    print("\n" + "=" * 60)
    print("  ✅ All seeds complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

