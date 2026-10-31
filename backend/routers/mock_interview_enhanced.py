"""Enhanced Mock Interview router with AI integration."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from bson.objectid import ObjectId

from backend.database import get_db
from backend.exceptions import SessionNotFoundError, LLMUnavailableError
from backend.logger import get_logger
from backend.models.interview_api import (
    StartInterviewRequest,
    StartInterviewResponse,
    ResumeIntelligenceResponse,
    QuestionResponse,
    SubmitAnswerRequestEnhanced,
    AnswerEvaluationEnhancedResponse,
    SessionAnalyticsResponse,
    InterviewHistoryResponse,
    HintsResponse,
    EndInterviewResponse,
)
from backend.routers.auth import verify_token
from backend.services.interview_engine import InterviewEngine
from backend.services.interview_repository import InterviewRepository

router = APIRouter(prefix="/api/mock-interview", tags=["Mock Interview Enhanced"])
engine = InterviewEngine()
log = get_logger(__name__)


async def get_current_user_id(token: str = Depends(verify_token)) -> str:
    """Extract user_id from token."""
    return token.get("sub")


# ─────────────────────────────────────────────────────────────
# ENHANCED ENDPOINTS WITH REAL AI INTEGRATION
# ─────────────────────────────────────────────────────────────


@router.post("/start", response_model=StartInterviewResponse)
async def start_interview_enhanced(
    request: StartInterviewRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Start a new interview session with AI personalization."""
    db = get_db()

    try:
        # Get user's resume for context — not mandatory; fall back to generic context
        resume = await db.resumes.find_one({"user_id": user_id})

        # Create session
        session_id = await InterviewRepository.create_session(
            user_id=user_id,
            interview_type=request.interview_type,
            selected_role=request.selected_role,
        )

        log.info(
            "Interview session started",
            session_id=session_id,
            user_id=user_id,
            interview_type=request.interview_type,
        )

        # Persist resume intelligence if resume exists
        if resume:
            resume_score = resume.get("ats_score", 0)
            try:
                await InterviewRepository.save_resume_intelligence(
                    user_id=user_id,
                    ats_score=resume_score,
                    resume_strength=resume.get("resume_strength_score", 50),
                    interview_readiness=resume.get("interview_readiness_score", 45),
                    missing_skills=resume.get("missing_skills", []),
                    recommended_role=request.selected_role,
                )
            except Exception:
                pass  # Non-critical — interview can still proceed

        return StartInterviewResponse(
            session_id=session_id,
            user_id=user_id,
            interview_type=request.interview_type,
            selected_role=request.selected_role,
            has_resume=resume is not None,
            status="in_progress",
            created_at=datetime.utcnow().isoformat(),
        )

    except HTTPException:
        raise
    except Exception as exc:
        log.error("Failed to start interview", user_id=user_id, error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {exc}")



@router.get("/resume-intelligence", response_model=ResumeIntelligenceResponse)
async def get_resume_intelligence(
    user_id: str = Depends(get_current_user_id),
):
    """Get resume intelligence for interview personalization."""
    try:
        intelligence = await InterviewRepository.get_resume_intelligence(user_id)
        return ResumeIntelligenceResponse(
            ats_score=intelligence.get("ats_score", 0),
            resume_strength=intelligence.get("resume_strength", 0),
            interview_readiness=intelligence.get("interview_readiness", 0),
            missing_skills=intelligence.get("missing_skills", []),
            ai_confidence=72,
            recommended_role=intelligence.get("recommended_role", "Software Engineer"),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/question/{session_id}")
async def get_next_question(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get next question for interview session."""
    db = get_db()

    try:
        # Verify session belongs to user
        session = await InterviewRepository.get_session(session_id)
        if not session or session["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get user's resume for context
        resume = await db.resumes.find_one({"user_id": user_id})

        # Generate question based on interview type
        interview_type = session.get("interview_type", "sde")

        # Use different question generators based on type
        if interview_type == "behavioral":
            question_data = await engine.generate_behavioral_question(
                user_context=f"Resume: {resume.get('summary', '')}",
                role=session.get("selected_role", "SDE"),
                weak_topics=resume.get("missing_skills", []),
            )
        elif interview_type == "technical":
            question_data = await engine.generate_technical_question(
                user_context=f"Resume: {resume.get('summary', '')}",
                role=session.get("selected_role", "SDE"),
                weak_topics=resume.get("missing_skills", []),
            )
        elif interview_type == "coding":
            question_data = await engine.generate_coding_question(
                user_context=f"Resume: {resume.get('summary', '')}",
                role=session.get("selected_role", "SDE"),
                difficulty="medium",
            )
        elif interview_type == "system_design":
            question_data = await engine.generate_system_design_question(
                user_context=f"Resume: {resume.get('summary', '')}",
                role=session.get("selected_role", "SDE"),
            )
        else:
            # Default to behavioral
            question_data = await engine.generate_behavioral_question(
                user_context=f"Resume: {resume.get('summary', '')}",
                role=session.get("selected_role", "SDE"),
                weak_topics=[],
            )

        # Save question to repository
        question_id = await InterviewRepository.save_question(
            session_id=session_id,
            category=interview_type,
            difficulty=question_data.get("difficulty", "medium"),
            question_text=question_data.get("question_text", ""),
            why_asked=question_data.get("why_asked", ""),
            expected_traits=question_data.get("expected_traits", []),
            follow_up_questions=question_data.get("follow_up_questions", []),
            ai_hints=question_data.get("ai_hints", []),
            ideal_answer=question_data.get("ideal_answer", ""),
            description=question_data.get("description"),
            constraints=question_data.get("constraints"),
            examples=question_data.get("examples"),
            expected_time_complexity=question_data.get("expected_time_complexity"),
            expected_space_complexity=question_data.get("expected_space_complexity"),
        )

        return {
            "id": question_id,
            "category": interview_type,
            "difficulty": question_data.get("difficulty", "medium"),
            "questionText": question_data.get("question_text", ""),
            "whyAsked": question_data.get("why_asked", ""),
            "expectedTraits": question_data.get("expected_traits", []),
            "followUpQuestions": question_data.get("follow_up_questions", []),
            "aiHints": question_data.get("ai_hints", []),
            "idealAnswer": question_data.get("ideal_answer", ""),
            "description": question_data.get("description", ""),
            "constraints": question_data.get("constraints", []),
            "examples": question_data.get("examples", []),
            "expectedTimeComplexity": question_data.get("expected_time_complexity", "O(n)"),
            "expectedSpaceComplexity": question_data.get("expected_space_complexity", "O(1)"),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/submit-answer", response_model=AnswerEvaluationEnhancedResponse)
async def submit_answer(
    request: SubmitAnswerRequestEnhanced,
    user_id: str = Depends(get_current_user_id),
):
    """Submit answer and get AI evaluation."""
    db = get_db()

    session_id = request.interview_session_id
    question_id = request.question_id
    answer_text = request.answer_text
    duration_seconds = request.duration_seconds or 0

    try:
        # Verify session ownership
        session = await InterviewRepository.get_session(session_id)
        if not session or session["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Session not found")

        # Load question
        question = await db.interview_questions.find_one(
            {"_id": ObjectId(question_id)}
        )
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # AI evaluation — engine returns overall_score (not 'score')
        evaluation = await engine.evaluate_answer(
            question=question,
            user_answer=answer_text,
            question_type=question.get("category", "behavioral"),
        )

        # Extract fields using the engine's actual return schema
        overall_score = int(evaluation.get("overall_score") or 0)
        strengths = evaluation.get("strengths") or []
        improvements = evaluation.get("improvements") or []
        ideal_answer_full = evaluation.get("ideal_answer_full") or ""
        rewritten_answer = evaluation.get("rewritten_answer") or ""
        follow_up_questions = evaluation.get("follow_up_questions") or []
        weaknesses = evaluation.get("weaknesses") or []
        missing_concepts = evaluation.get("missing_concepts") or []

        # Persist answer with all dimension scores for accurate analytics
        answer_id = await InterviewRepository.save_answer(
            session_id=session_id,
            question_id=question_id,
            user_id=user_id,
            answer_text=answer_text,
            duration_seconds=duration_seconds,
            score=overall_score,
            feedback=ideal_answer_full,
            strengths=strengths,
            improvements=improvements,
            missing_concepts=missing_concepts,
            communication=evaluation.get("communication"),
            technical_depth=evaluation.get("technical_depth"),
            confidence=evaluation.get("confidence"),
            problem_solving=evaluation.get("problem_solving"),
            leadership=evaluation.get("leadership"),
            clarity=evaluation.get("clarity"),
            correctness=evaluation.get("correctness"),
            star_format_adherence=evaluation.get("star_format_adherence"),
        )

        # Update session progress
        await db.interview_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$push": {"answers": answer_id},
                "$inc": {"completed_questions": 1},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )

        log.info(
            "Answer submitted",
            session_id=session_id,
            user_id=user_id,
            score=overall_score,
        )

        return AnswerEvaluationEnhancedResponse(
            answer_id=answer_id,
            overall_score=overall_score,
            communication=int(evaluation.get("communication") or 0),
            technical_depth=int(evaluation.get("technical_depth") or 0),
            confidence=int(evaluation.get("confidence") or 0),
            problem_solving=int(evaluation.get("problem_solving") or 0),
            leadership=int(evaluation.get("leadership") or 0),
            clarity=int(evaluation.get("clarity") or 0),
            correctness=int(evaluation.get("correctness") or 0),
            star_format_adherence=int(evaluation.get("star_format_adherence") or 0),
            strengths=strengths,
            weaknesses=weaknesses,
            missing_concepts=missing_concepts,
            improvements=improvements,
            ideal_answer_full=ideal_answer_full,
            rewritten_answer=rewritten_answer,
            follow_up_questions=follow_up_questions,
            readiness_score=overall_score,
        )

    except HTTPException:
        raise
    except Exception as exc:
        log.error("Answer evaluation failed", session_id=session_id, error=str(exc))
        raise HTTPException(status_code=500, detail=f"Answer evaluation failed: {exc}")


@router.get("/analytics/{session_id}")
async def get_session_analytics(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get analytics for a specific session."""
    try:
        session = await InterviewRepository.get_session(session_id)
        if not session or session["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Session not found")

        # Calculate analytics
        analytics = await InterviewRepository.calculate_analytics(session_id)

        return {
            "communication": analytics.get("communication", 0),
            "technical_depth": analytics.get("technical_depth", 0),
            "confidence": analytics.get("confidence", 0),
            "problem_solving": analytics.get("problem_solving", 0),
            "leadership": analytics.get("leadership", 0),
            "system_design": analytics.get("system_design", 0),
            "coding": analytics.get("coding", 0),
            "readiness_score": analytics.get("readiness_score", 0),
            "session_id": session_id,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user-analytics")
async def get_user_analytics(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get user's all-time analytics across all interview sessions.

    Returns all skill dimensions, trend arrays, topic weakness map,
    session history, and aggregate readiness score.
    """
    db = get_db()

    _EMPTY = {
        "total_interviews": 0,
        "average_score": 0,
        "readiness_score": 0,
        "communication": 0,
        "technical_depth": 0,
        "confidence": 0,
        "problem_solving": 0,
        "leadership": 0,
        "system_design": 0,
        "coding": 0,
        "communication_trend": [],
        "coding_trend": [],
        "topic_weaknesses": {},
        "session_history": [],
    }

    try:
        sessions = await InterviewRepository.get_user_sessions(user_id)
        if not sessions:
            return _EMPTY

        # Per-session analytics
        all_analytics: list[dict] = []
        for s in sessions:
            a = await InterviewRepository.calculate_analytics(str(s["_id"]))
            a["_session"] = s  # carry session doc for history
            all_analytics.append(a)

        n = len(all_analytics)

        def _avg(key: str) -> float:
            vals = [a.get(key) or 0 for a in all_analytics]
            return round(sum(vals) / n, 1) if n else 0

        # Topic weakness map — aggregate missing_concepts from all answers
        topic_weakness: dict[str, int] = {}
        answer_docs = await db.interview_answers.find(
            {"user_id": user_id}
        ).to_list(None)
        for ans in answer_docs:
            for concept in (ans.get("missing_concepts") or []):
                c = str(concept).strip().lower()
                if c:
                    topic_weakness[c] = topic_weakness.get(c, 0) + 1
        # Normalise counts to 0-100 weakness scores
        max_count = max(topic_weakness.values(), default=1)
        topic_weakness_scores = {
            k: round(v / max_count * 100)
            for k, v in sorted(topic_weakness.items(), key=lambda x: -x[1])
        }

        # Session history (newest first, up to 20)
        history = []
        for a in sorted(
            all_analytics,
            key=lambda x: x["_session"].get("created_at") or datetime.min,
            reverse=True,
        )[:20]:
            s = a["_session"]
            created = s.get("created_at")
            history.append({
                "date": created.strftime("%Y-%m-%d") if created else "",
                "role": s.get("selected_role") or s.get("interview_type", "Interview"),
                "score": round(a.get("readiness_score") or 0),
                "duration": round((s.get("total_duration_seconds") or 0) / 60),
                "interview_type": s.get("interview_type", ""),
            })

        return {
            "total_interviews": n,
            "average_score": _avg("readiness_score"),
            "readiness_score": _avg("readiness_score"),
            "communication": _avg("communication"),
            "technical_depth": _avg("technical_depth"),
            "confidence": _avg("confidence"),
            "problem_solving": _avg("problem_solving"),
            "leadership": _avg("leadership"),
            "system_design": _avg("system_design"),
            "coding": _avg("coding"),
            "communication_trend": [a.get("communication", 0) for a in all_analytics],
            "coding_trend": [a.get("coding", 0) for a in all_analytics],
            "topic_weaknesses": topic_weakness_scores,
            "session_history": history,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analytics aggregation failed: {exc}")


@router.post("/end/{session_id}")
async def end_interview(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """End interview session and finalize score."""
    try:
        session = await InterviewRepository.get_session(session_id)
        if not session or session["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Session not found")

        # Calculate final score
        analytics = await InterviewRepository.calculate_analytics(session_id)
        final_score = analytics.get("readiness_score", 0)

        # Update session
        await InterviewRepository.update_session_score(session_id, final_score)
        await InterviewRepository.complete_session(session_id)

        return {
            "completed": True,
            "score": final_score,
            "session_id": session_id,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history")
async def get_interview_history(
    user_id: str = Depends(get_current_user_id),
    limit: int = 10,
):
    """Get user's interview history."""
    try:
        sessions = await InterviewRepository.get_user_sessions(user_id, limit)

        return {
            "total": len(sessions),
            "sessions": [
                {
                    "session_id": str(s["_id"]),
                    "interview_type": s.get("interview_type"),
                    "selected_role": s.get("selected_role"),
                    "score": s.get("overall_score"),
                    "status": s.get("status"),
                    "created_at": s.get("created_at").isoformat(),
                }
                for s in sessions
            ],
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/hints/{session_id}/{question_id}")
async def get_question_hints(
    session_id: str,
    question_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get hints for a question."""
    db = get_db()

    try:
        question = await db.interview_questions.find_one(
            {"_id": ObjectId(question_id)}
        )
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        return {
            "hints": question.get("ai_hints", []),
            "step_count": len(question.get("ai_hints", [])),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
