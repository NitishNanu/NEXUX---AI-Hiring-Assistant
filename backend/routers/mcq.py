"""MCQ questions router for interview system."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from bson.objectid import ObjectId

from backend.database import get_db
from backend.logger import get_logger
from backend.models.interview import SubmitMCQRequest
from backend.routers.auth import verify_token

router = APIRouter(prefix="/api/mcq", tags=["MCQ Questions"])
log = get_logger(__name__)


async def get_current_user_id(token: str = Depends(verify_token)) -> str:
    """Extract user_id from token."""
    return token.get("sub")


@router.get("/questions")
async def list_mcq_questions(
    user_id: str = Depends(get_current_user_id),
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    topic: Optional[str] = None,
):
    """
    Paginated list of MCQ questions with optional filters.

    Query params
    ------------
    page        : Page number starting at 1 (default 1)
    page_size   : Items per page 1–100 (default 20)
    category    : Filter by category (e.g. dsa, system_design, python)
    difficulty  : Filter by easy | medium | hard
    topic       : Filter by topic string
    """
    db = get_db()
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    skip = (page - 1) * page_size

    query: dict = {}
    if category:
        query["category"] = category.lower()
    if difficulty:
        query["difficulty"] = difficulty.lower()
    if topic:
        query["topic"] = topic

    try:
        total = await db.mcq_questions.count_documents(query)
        questions = (
            await db.mcq_questions.find(query)
            .skip(skip)
            .limit(page_size)
            .to_list(None)
        )

        return {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": max(1, -(-total // page_size)),
            "questions": [
                {
                    "id": str(q["_id"]),
                    "question": q.get("question", ""),
                    "options": q.get("options", []),
                    "difficulty": q.get("difficulty", ""),
                    "category": q.get("category", ""),
                    "topic": q.get("topic", ""),
                }
                for q in questions
            ],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/question/{question_id}")
async def get_mcq_question(
    question_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a specific MCQ question."""
    db = get_db()

    try:
        question = await db.mcq_questions.find_one({"_id": ObjectId(question_id)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        return {
            "id": str(question["_id"]),
            "question": question.get("question", ""),
            "options": question.get("options", []),
            "difficulty": question.get("difficulty", ""),
            "topic": question.get("topic", ""),
            "category": question.get("category", ""),
            "explanation": question.get("explanation", ""),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/submit")
async def submit_mcq_answer(
    request: SubmitMCQRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Submit MCQ answer and get evaluation."""
    db = get_db()

    try:
        # Get question
        question = await db.mcq_questions.find_one(
            {"_id": ObjectId(request.question_id)}
        )
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # Check if answer is correct
        correct_option_index = question.get("correct_option_index", 0)
        is_correct = request.selected_option == correct_option_index

        # Save answer
        answer = {
            "session_id": request.interview_session_id,
            "question_id": request.question_id,
            "user_id": user_id,
            "selected_option": request.selected_option,
            "correct_option": correct_option_index,
            "is_correct": is_correct,
            "duration_seconds": request.duration_seconds,
            "explanation": question.get("explanation", ""),
            "topic": question.get("topic", ""),
            "difficulty": question.get("difficulty", ""),
            "created_at": datetime.utcnow(),
        }

        result = await db.mcq_attempts.insert_one(answer)

        # Update session (non-critical — fire and forget)
        if request.interview_session_id:
            try:
                await db.interview_sessions.update_one(
                    {"_id": ObjectId(request.interview_session_id)},
                    {
                        "$push": {"answers": str(result.inserted_id)},
                        "$inc": {"completed_questions": 1},
                        "$set": {"updated_at": datetime.utcnow()},
                    },
                )
            except Exception:
                pass

        log.info(
            "MCQ answer submitted",
            user_id=user_id,
            question_id=request.question_id,
            is_correct=is_correct,
        )

        return {
            "answer_id": str(result.inserted_id),
            "is_correct": is_correct,
            "correct_option": correct_option_index,
            "selected_option": request.selected_option,
            "explanation": question.get("explanation", ""),
            "score": 100 if is_correct else 0,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/batch/{topic}")
async def get_mcq_batch(
    topic: str,
    user_id: str = Depends(get_current_user_id),
    difficulty: str = "medium",
    limit: int = 5,
):
    """Get a batch of MCQ questions by topic and difficulty."""
    db = get_db()

    try:
        limit = min(max(1, limit), 50)
        questions = (
            await db.mcq_questions.find(
                {"topic": topic, "difficulty": difficulty}
            )
            .limit(limit)
            .to_list(None)
        )

        # Fallback: if no topic+difficulty match, try topic only
        if not questions:
            questions = (
                await db.mcq_questions.find({"topic": topic})
                .limit(limit)
                .to_list(None)
            )

        return [
            {
                "id": str(q["_id"]),
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "difficulty": q.get("difficulty", ""),
                "topic": q.get("topic", ""),
                "category": q.get("category", ""),
            }
            for q in questions
        ]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/topics")
async def get_mcq_topics(
    user_id: str = Depends(get_current_user_id),
):
    """Get all available MCQ topics."""
    db = get_db()

    try:
        topics = await db.mcq_questions.distinct("topic")
        categories = await db.mcq_questions.distinct("category")

        return {
            "topics": sorted(t for t in topics if t),
            "categories": sorted(c for c in categories if c),
            "total_questions": await db.mcq_questions.count_documents({}),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stats")
async def get_user_mcq_stats(
    user_id: str = Depends(get_current_user_id),
):
    """Get user's MCQ statistics."""
    db = get_db()

    try:
        answers = await db.mcq_attempts.find({"user_id": user_id}).to_list(None)

        if not answers:
            return {
                "total_attempted": 0,
                "correct": 0,
                "accuracy": 0,
                "by_topic": {},
                "by_difficulty": {},
            }

        total = len(answers)
        correct = sum(1 for a in answers if a.get("is_correct", False))
        accuracy = (correct / total * 100) if total > 0 else 0

        # Aggregate by topic
        by_topic: dict = {}
        for answer in answers:
            topic = answer.get("topic", "Unknown")
            by_topic.setdefault(topic, {"attempted": 0, "correct": 0})
            by_topic[topic]["attempted"] += 1
            if answer.get("is_correct"):
                by_topic[topic]["correct"] += 1

        # Aggregate by difficulty
        by_difficulty: dict = {}
        for answer in answers:
            diff = answer.get("difficulty", "unknown").lower()
            by_difficulty.setdefault(diff, {"attempted": 0, "correct": 0})
            by_difficulty[diff]["attempted"] += 1
            if answer.get("is_correct"):
                by_difficulty[diff]["correct"] += 1

        def _add_accuracy(d: dict) -> dict:
            return {
                k: {
                    **v,
                    "accuracy": round(v["correct"] / v["attempted"] * 100, 2)
                    if v["attempted"] > 0 else 0,
                }
                for k, v in d.items()
            }

        return {
            "total_attempted": total,
            "correct": correct,
            "accuracy": round(accuracy, 2),
            "by_topic": _add_accuracy(by_topic),
            "by_difficulty": _add_accuracy(by_difficulty),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
