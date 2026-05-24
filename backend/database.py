"""MongoDB connection using Motor (async driver)."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_url)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.mongodb_db_name]


async def init_indexes():
    """Create indexes on startup. Safe to call repeatedly."""
    db = get_db()
    
    # ─── EXISTING COLLECTIONS ───
    await db.users.create_index("email", unique=True)
    await db.resumes.create_index("user_id", unique=True)
    
    # ─── INTERVIEW SESSIONS ───
    await db.interview_sessions.create_index("user_id")
    await db.interview_sessions.create_index("created_at")
    await db.interview_sessions.create_index([("user_id", 1), ("created_at", -1)])
    await db.interview_sessions.create_index("status")
    await db.interview_sessions.create_index("interview_type")
    
    # ─── INTERVIEW QUESTIONS ───
    await db.interview_questions.create_index("session_id")
    await db.interview_questions.create_index("category")
    await db.interview_questions.create_index("difficulty")
    await db.interview_questions.create_index([("session_id", 1), ("created_at", -1)])
    
    # ─── INTERVIEW ANSWERS ───
    await db.interview_answers.create_index("session_id")
    await db.interview_answers.create_index("question_id")
    await db.interview_answers.create_index("user_id")
    await db.interview_answers.create_index([("session_id", 1), ("created_at", -1)])
    
    # ─── CODING SUBMISSIONS ───
    await db.coding_submissions.create_index("session_id")
    await db.coding_submissions.create_index("problem_id")
    await db.coding_submissions.create_index("user_id")
    await db.coding_submissions.create_index([("user_id", 1), ("created_at", -1)])
    
    # ─── MCQ QUESTIONS ───
    await db.mcq_questions.create_index("category")
    await db.mcq_questions.create_index("difficulty")
    await db.mcq_questions.create_index("topic")
    
    # ─── MCQ ATTEMPTS ───
    await db.mcq_attempts.create_index("session_id")
    await db.mcq_attempts.create_index("question_id")
    await db.mcq_attempts.create_index([("session_id", 1), ("created_at", -1)])
    
    # ─── CODING PROBLEMS ───
    await db.coding_problems.create_index("difficulty")
    await db.coding_problems.create_index("category")
    await db.coding_problems.create_index("tags")
    
    # ─── INTERVIEW ANALYTICS ───
    await db.interview_analytics.create_index("user_id", unique=True)
    await db.interview_analytics.create_index("updated_at")
    
    # ─── INTERVIEW SESSIONS STATS ───
    await db.interview_session_stats.create_index("user_id")
    await db.interview_session_stats.create_index([("user_id", 1), ("date", -1)])
    
    print("✅ MongoDB indexes initialized successfully")


async def close_client():
    global _client
    if _client:
        _client.close()
        _client = None