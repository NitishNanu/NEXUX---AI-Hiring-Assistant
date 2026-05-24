"""Coding challenges router for interview system."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from bson.objectid import ObjectId
import json

from backend.config import settings
from backend.database import get_db
from backend.models.interview import SubmitCodingRequest
from backend.routers.auth import verify_token
from backend.services.coding_executor import CodingExecutor
from backend.services.interview_engine import InterviewEngine

router = APIRouter(prefix="/api/coding", tags=["Coding Challenges"])
executor = CodingExecutor()
engine = InterviewEngine()


async def get_current_user_id(token: str = Depends(verify_token)) -> str:
    """Extract user_id from token."""
    return token.get("sub")


@router.get("/problem/{problem_id}")
async def get_problem(
    problem_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a specific coding problem."""
    db = get_db()

    try:
        problem = await db.coding_problems.find_one({"_id": ObjectId(problem_id)})
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        return {
            "id": str(problem["_id"]),
            "title": problem.get("title", ""),
            "description": problem.get("description", ""),
            "difficulty": problem.get("difficulty", ""),
            "constraints": problem.get("constraints", []),
            "examples": problem.get("examples", []),
            "expected_time_complexity": problem.get("expected_time_complexity"),
            "expected_space_complexity": problem.get("expected_space_complexity"),
            "hints": problem.get("ai_hints", []),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/run")
async def run_code(
    request: SubmitCodingRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Execute submitted code against test cases."""
    db = get_db()

    try:
        # Get problem details
        problem = await db.coding_problems.find_one(
            {"_id": ObjectId(request.question_id)}
        )
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        # Execute code
        test_cases = problem.get("test_cases", [])
        results = await executor.execute_code(
            request.code,
            request.language,
            test_cases,
            timeout=5,
        )

        return {
            "success": results.get("success", True),
            "passed": results.get("passed", 0),
            "total": results.get("total", 0),
            "test_results": results.get("test_results", []),
            "execution_time_ms": results.get("execution_time_ms", 0),
            "errors": results.get("errors", []),
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "passed": 0,
            "total": 0,
            "test_results": [],
        }


@router.post("/submit")
async def submit_coding_solution(
    request: SubmitCodingRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Submit a coding solution and get AI evaluation."""
    db = get_db()

    try:
        # Get problem
        problem = await db.coding_problems.find_one(
            {"_id": ObjectId(request.question_id)}
        )
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        # Execute code first
        test_cases = problem.get("test_cases", [])
        execution_results = await executor.execute_code(
            request.code,
            request.language,
            test_cases,
        )

        # Get AI evaluation
        evaluation = await engine.evaluate_coding_answer(
            problem,
            request.code,
            execution_results,
        )

        # Save submission
        submission = {
            "session_id": request.interview_session_id,
            "problem_id": request.question_id,
            "user_id": user_id,
            "code": request.code,
            "language": request.language,
            "duration_seconds": request.duration_seconds,
            "test_results": execution_results,
            "evaluation": evaluation,
            "passed_tests": execution_results.get("passed", 0),
            "total_tests": execution_results.get("total", 0),
            "created_at": datetime.utcnow(),
        }

        result = await db.coding_submissions.insert_one(submission)

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
            "submission_id": str(result.inserted_id),
            "overall_score": evaluation.get("overall_score", 0),
            "passed_tests": execution_results.get("passed", 0),
            "total_tests": execution_results.get("total", 0),
            "strengths": evaluation.get("strengths", []),
            "weaknesses": evaluation.get("weaknesses", []),
            "improvements": evaluation.get("improvements", []),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/hints/{problem_id}")
async def get_coding_hints(
    problem_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get AI hints for a coding problem."""
    db = get_db()

    try:
        problem = await db.coding_problems.find_one({"_id": ObjectId(problem_id)})
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        hints = problem.get("ai_hints", [])
        if not hints:
            # Generate hints using AI
            from backend.services.interview_engine import InterviewEngine

            eng = InterviewEngine()
            # Simple fallback hints
            hints = [
                "Consider the basic approach first",
                "Think about edge cases",
                "Optimize after correctness",
            ]

        return {"hints": hints, "step_count": len(hints)}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/problems/difficulty/{difficulty}")
async def get_problems_by_difficulty(
    difficulty: str,
    user_id: str = Depends(get_current_user_id),
    limit: int = 10,
):
    """Get coding problems by difficulty."""
    db = get_db()

    try:
        problems = (
            await db.coding_problems.find({"difficulty": difficulty})
            .limit(limit)
            .to_list(None)
        )

        return [
            {
                "id": str(p["_id"]),
                "title": p.get("title", ""),
                "difficulty": p.get("difficulty", ""),
                "category": p.get("category", ""),
            }
            for p in problems
        ]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
