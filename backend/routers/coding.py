"""Coding challenges router for interview system."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson.objectid import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.database import get_db
from backend.logger import get_logger
from backend.models.interview import SubmitCodingRequest
from backend.routers.auth import verify_token
from backend.services.coding_executor import CodingExecutor
from backend.services.interview_engine import InterviewEngine

router = APIRouter(prefix="/api/coding", tags=["Coding Challenges"])
executor = CodingExecutor()
engine = InterviewEngine()
log = get_logger(__name__)


# ---------------------------------------------------------------------------
# Shared dependency
# ---------------------------------------------------------------------------

async def get_current_user_id(token: dict = Depends(verify_token)) -> str:
    return token.get("sub", "")


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class AnalyzeCodeRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str


class RecommendProblemsRequest(BaseModel):
    weak_topics: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/problems")
async def list_problems(
    user_id: str = Depends(get_current_user_id),
    page: int = 1,
    page_size: int = 20,
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
):
    """
    Paginated list of all coding problems with optional filters.

    Query params
    ------------
    page        : Page number starting at 1 (default 1)
    page_size   : Items per page 1–100 (default 20)
    difficulty  : Filter by easy | medium | hard | expert
    category    : Filter by category slug (e.g. array, graph, dp)
    """
    db = get_db()
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    skip = (page - 1) * page_size

    query: dict = {}
    if difficulty:
        valid_diff = {"easy", "medium", "hard", "expert"}
        if difficulty.lower() not in valid_diff:
            raise HTTPException(
                status_code=422,
                detail=f"difficulty must be one of: {sorted(valid_diff)}",
            )
        query["difficulty"] = difficulty.lower()
    if category:
        query["category"] = category.lower()

    try:
        total = await db.coding_problems.count_documents(query)
        problems = (
            await db.coding_problems.find(query)
            .skip(skip)
            .limit(page_size)
            .to_list(None)
        )

        return {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": max(1, -(-total // page_size)),
            "problems": [
                {
                    "id": str(p["_id"]),
                    "title": p.get("title", ""),
                    "difficulty": p.get("difficulty", ""),
                    "category": p.get("category", ""),
                    "tags": p.get("tags", []),
                    "expected_time_complexity": p.get("expected_time_complexity", ""),
                    "expected_space_complexity": p.get("expected_space_complexity", ""),
                }
                for p in problems
            ],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/problem/{problem_id}")
async def get_problem(
    problem_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a specific coding problem by ID."""
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
            "category": problem.get("category", ""),
            "constraints": problem.get("constraints", []),
            "examples": problem.get("examples", []),
            "expected_time_complexity": problem.get("expected_time_complexity", "O(n)"),
            "expected_space_complexity": problem.get("expected_space_complexity", "O(1)"),
            "hints": problem.get("ai_hints", []),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/run")
async def run_code(
    request: SubmitCodingRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Execute submitted code against stored test cases."""
    db = get_db()
    try:
        problem = await db.coding_problems.find_one(
            {"_id": ObjectId(request.question_id)}
        )
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        test_cases = problem.get("test_cases", [])
        results = await executor.execute_code(
            request.code, request.language, test_cases, timeout=5
        )

        return {
            "success": results.get("success", True),
            "passed": results.get("passed", 0),
            "total": results.get("total", 0),
            "test_results": results.get("test_results", []),
            "execution_time_ms": results.get("execution_time_ms", 0),
            "errors": results.get("errors", []),
        }

    except HTTPException:
        raise
    except Exception as exc:
        return {
            "success": False,
            "error": str(exc),
            "passed": 0,
            "total": 0,
            "test_results": [],
            "execution_time_ms": 0,
            "errors": [str(exc)],
        }


@router.post("/submit")
async def submit_coding_solution(
    request: SubmitCodingRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Submit a coding solution and get AI evaluation."""
    db = get_db()
    try:
        problem = await db.coding_problems.find_one(
            {"_id": ObjectId(request.question_id)}
        )
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        # Execute code
        test_cases = problem.get("test_cases", [])
        execution_results = await executor.execute_code(
            request.code, request.language, test_cases
        )

        # AI evaluation
        evaluation = await engine.evaluate_coding_answer(
            problem, request.code, execution_results
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
            "overall_score": evaluation.get("overall_score", 0),
            "created_at": datetime.utcnow(),
        }

        result = await db.coding_submissions.insert_one(submission)

        log.info(
            "Code submitted",
            user_id=user_id,
            problem_id=request.question_id,
            language=request.language,
            score=evaluation.get("overall_score", 0),
            passed=execution_results.get("passed", 0),
            total=execution_results.get("total", 0),
        )

        # Update session progress
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
                pass  # Session update failure should not fail the submission

        return {
            "submission_id": str(result.inserted_id),
            "overall_score": evaluation.get("overall_score", 0),
            "correctness": evaluation.get("correctness", 0),
            "efficiency": evaluation.get("efficiency", 0),
            "code_quality": evaluation.get("code_quality", 0),
            "passed_tests": execution_results.get("passed", 0),
            "total_tests": execution_results.get("total", 0),
            "strengths": evaluation.get("strengths", []),
            "weaknesses": evaluation.get("weaknesses", []),
            "improvements": evaluation.get("improvements", []),
            "optimal_solution": evaluation.get("optimal_solution", ""),
            "time_complexity_actual": evaluation.get("time_complexity_actual", ""),
            "space_complexity_actual": evaluation.get("space_complexity_actual", ""),
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Submission failed: {exc}")


@router.post("/hints/{problem_id}")
async def get_coding_hints(
    problem_id: str,
    request: dict = {},
    user_id: str = Depends(get_current_user_id),
):
    """Get AI-generated hints for a coding problem."""
    db = get_db()
    try:
        problem = await db.coding_problems.find_one({"_id": ObjectId(problem_id)})
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        # Use stored hints first; generate AI hints if none exist
        hints: list[str] = problem.get("ai_hints", [])

        if not hints:
            user_code = request.get("code", "") if isinstance(request, dict) else ""
            problem_desc = problem.get("description", problem.get("title", ""))
            try:
                hint_data = await engine._ai.generate_coding_hints(problem_desc, user_code)
                hints = hint_data.get("hints", [])
            except Exception:
                hints = [
                    "Start with the simplest correct solution — optimise later.",
                    "Consider all edge cases: empty input, duplicates, negatives.",
                    f"Target time complexity: {problem.get('expected_time_complexity', 'O(n)')}",
                ]

        return {"hints": hints, "step_count": len(hints)}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/problems/difficulty/{difficulty}")
async def get_problems_by_difficulty(
    difficulty: str,
    user_id: str = Depends(get_current_user_id),
    limit: int = 10,
):
    """Get coding problems filtered by difficulty."""
    db = get_db()
    valid = {"easy", "medium", "hard", "expert"}
    if difficulty.lower() not in valid:
        raise HTTPException(
            status_code=422,
            detail=f"difficulty must be one of: {sorted(valid)}",
        )
    try:
        problems = (
            await db.coding_problems.find({"difficulty": difficulty.lower()})
            .limit(min(limit, 50))
            .to_list(None)
        )
        return [
            {
                "id": str(p["_id"]),
                "title": p.get("title", ""),
                "difficulty": p.get("difficulty", ""),
                "category": p.get("category", ""),
                "constraints": p.get("constraints", []),
                "examples": p.get("examples", []),
                "expected_time_complexity": p.get("expected_time_complexity", "O(n)"),
                "expected_space_complexity": p.get("expected_space_complexity", "O(1)"),
                "hints": p.get("ai_hints", []),
            }
            for p in problems
        ]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# P1-03: Previously missing endpoints — now implemented
# ---------------------------------------------------------------------------

@router.post("/analyze")
async def analyze_code(
    request: AnalyzeCodeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Static analysis of submitted code without executing it.

    Returns heuristic quality metrics including line count, comment presence,
    estimated complexity, and style issues.
    """
    if not request.code.strip():
        raise HTTPException(status_code=422, detail="code must not be empty")

    analysis = executor.analyze_code_quality(request.code, request.language)
    return analysis


@router.get("/stats")
async def get_coding_stats(
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve aggregated coding statistics for the authenticated user.

    Returns total problems solved, acceptance rate, per-difficulty breakdown,
    and per-category breakdown.
    """
    db = get_db()
    try:
        submissions = await db.coding_submissions.find({"user_id": user_id}).to_list(None)

        if not submissions:
            return {
                "total_problems_solved": 0,
                "accepted_submissions": 0,
                "acceptance_rate": 0.0,
                "avg_score": 0.0,
                "by_difficulty": {},
                "by_category": {},
                "recent_submissions": [],
            }

        total = len(submissions)
        accepted = sum(
            1 for s in submissions
            if s.get("passed_tests", 0) == s.get("total_tests", 1)
            and s.get("total_tests", 0) > 0
        )
        avg_score = (
            sum(s.get("overall_score", 0) for s in submissions) / total
            if total else 0
        )

        by_difficulty: dict = {}
        by_category: dict = {}

        for sub in submissions:
            # We need the problem for difficulty/category
            diff = sub.get("difficulty", "unknown")
            cat = sub.get("category", "unknown")
            is_solved = (
                sub.get("passed_tests", 0) >= sub.get("total_tests", 1)
                and sub.get("total_tests", 0) > 0
            )

            by_difficulty.setdefault(diff, {"attempted": 0, "solved": 0})
            by_difficulty[diff]["attempted"] += 1
            if is_solved:
                by_difficulty[diff]["solved"] += 1

            by_category.setdefault(cat, {"attempted": 0, "solved": 0})
            by_category[cat]["attempted"] += 1
            if is_solved:
                by_category[cat]["solved"] += 1

        # Most recent 5
        recent = sorted(
            submissions, key=lambda s: s.get("created_at", datetime.min), reverse=True
        )[:5]

        return {
            "total_problems_solved": accepted,
            "accepted_submissions": accepted,
            "acceptance_rate": round(accepted / total * 100, 1) if total else 0.0,
            "avg_score": round(avg_score, 1),
            "by_difficulty": by_difficulty,
            "by_category": by_category,
            "recent_submissions": [
                {
                    "submission_id": str(s["_id"]),
                    "problem_id": s.get("problem_id", ""),
                    "language": s.get("language", ""),
                    "passed_tests": s.get("passed_tests", 0),
                    "total_tests": s.get("total_tests", 0),
                    "overall_score": s.get("overall_score", 0),
                    "created_at": s.get("created_at", "").isoformat()
                    if hasattr(s.get("created_at", ""), "isoformat") else "",
                }
                for s in recent
            ],
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Stats query failed: {exc}")


@router.post("/recommend")
async def get_recommended_problems(
    request: RecommendProblemsRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Return a curated list of problems targeting the user's weak topic areas.

    Queries for problems whose ``tags`` field overlaps with the requested
    weak topics.  Falls back to medium-difficulty problems when no targeted
    problems are found.
    """
    db = get_db()
    try:
        weak_topics = [t.strip().lower() for t in request.weak_topics if t.strip()]

        if weak_topics:
            cursor = db.coding_problems.find(
                {"$or": [
                    {"tags": {"$in": weak_topics}},
                    {"category": {"$in": weak_topics}},
                    {"topic": {"$in": weak_topics}},
                ]}
            ).limit(10)
        else:
            cursor = db.coding_problems.find({"difficulty": "medium"}).limit(10)

        problems = await cursor.to_list(None)

        # Always return at least a minimal set even if DB is empty
        if not problems:
            return {
                "problems": [],
                "message": "No problems found for your weak topics. Add coding problems to the database.",
                "weak_topics": weak_topics,
            }

        return {
            "problems": [
                {
                    "id": str(p["_id"]),
                    "title": p.get("title", ""),
                    "difficulty": p.get("difficulty", "medium"),
                    "category": p.get("category", ""),
                    "tags": p.get("tags", []),
                    "expected_time_complexity": p.get("expected_time_complexity", "O(n)"),
                }
                for p in problems
            ],
            "weak_topics": weak_topics,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {exc}")
