"""MCQ questions router for interview system."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from bson.objectid import ObjectId

from backend.database import get_db
from backend.models.interview import SubmitMCQRequest
from backend.routers.auth import verify_token

router = APIRouter(prefix="/api/mcq", tags=["MCQ Questions"])


async def get_current_user_id(token: str = Depends(verify_token)) -> str:
    """Extract user_id from token."""
    return token.get("sub")


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
            "explanation": question.get("explanation", ""),
        }

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

        result = await db.mcq_answers.insert_one(answer)

        # Update session
        await db.interview_sessions.update_one(
            {"_id": ObjectId(request.interview_session_id)},
            {
                "$push": {"answers": str(result.inserted_id)},
                "$inc": {"completed_questions": 1},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )

        return {
            "answer_id": str(result.inserted_id),
            "is_correct": is_correct,
            "correct_option": correct_option_index,
            "selected_option": request.selected_option,
            "explanation": question.get("explanation", ""),
            "score": 100 if is_correct else 0,
        }

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
        questions = (
            await db.mcq_questions.find(
                {"topic": topic, "difficulty": difficulty}
            )
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

        return {
            "topics": sorted(topics),
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
        # Get all MCQ answers for user
        answers = (
            await db.mcq_answers.find({"user_id": user_id}).to_list(None)
        )

        if not answers:
            return {
                "total_attempted": 0,
                "correct": 0,
                "accuracy": 0,
                "by_topic": {},
                "by_difficulty": {},
            }

        # Calculate statistics
        total = len(answers)
        correct = sum(1 for a in answers if a.get("is_correct", False))
        accuracy = (correct / total * 100) if total > 0 else 0

        # By topic
        by_topic = {}
        for answer in answers:
            topic = answer.get("topic", "Unknown")
            if topic not in by_topic:
                by_topic[topic] = {"attempted": 0, "correct": 0}
            by_topic[topic]["attempted"] += 1
            if answer.get("is_correct"):
                by_topic[topic]["correct"] += 1

        # By difficulty
        by_difficulty = {}
        for answer in answers:
            diff = answer.get("difficulty", "unknown").lower()
            if diff not in by_difficulty:
                by_difficulty[diff] = {"attempted": 0, "correct": 0}
            by_difficulty[diff]["attempted"] += 1
            if answer.get("is_correct"):
                by_difficulty[diff]["correct"] += 1

        return {
            "total_attempted": total,
            "correct": correct,
            "accuracy": round(accuracy, 2),
            "by_topic": {
                k: {
                    "accuracy": round(
                        v["correct"] / v["attempted"] * 100, 2
                    )
                    if v["attempted"] > 0
                    else 0,
                    **v,
                }
                for k, v in by_topic.items()
            },
            "by_difficulty": {
                k: {
                    "accuracy": round(
                        v["correct"] / v["attempted"] * 100, 2
                    )
                    if v["attempted"] > 0
                    else 0,
                    **v,
                }
                for k, v in by_difficulty.items()
            },
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
