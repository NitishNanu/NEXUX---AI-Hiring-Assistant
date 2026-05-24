"""Mock Interview feature - complete interview simulation with AI."""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from bson.objectid import ObjectId
import json

from backend.config import settings
from backend.database import get_db
from backend.models.interview import (
    InterviewType,
    QuestionType,
    Difficulty,
    StartInterviewRequest,
    InterviewSessionResponse,
    SubmitAnswerRequest,
    AnswerEvaluationResponse,
    EvaluationMetrics,
    StrengthWeakness,
    UserProfileForInterview,
)
from backend.routers.auth import verify_token
from backend.services.openai_service import OpenAIService

router = APIRouter(prefix="/api/mock-interview", tags=["Mock Interview"])
openai_service = OpenAIService()


async def get_current_user_id(token: str = Depends(verify_token)) -> str:
    """Extract user_id from token."""
    return token.get("sub")


# ─────────────────────────────────────────────────────────────
# INTERVIEW SESSION MANAGEMENT
# ─────────────────────────────────────────────────────────────

@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(
    request: StartInterviewRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Start a new mock interview session."""
    db = get_db()
    
    # Get user's resume data
    resume = await db.resumes.find_one({"user_id": user_id})
    if not resume:
        raise HTTPException(status_code=400, detail="No resume found. Please upload a resume first.")
    
    # Get user analytics to understand weak areas
    analytics = await db.interview_analytics.find_one({"user_id": user_id})
    
    # Create interview session
    session = {
        "user_id": user_id,
        "interview_type": request.interview_type.value,
        "selected_role": request.selected_role or request.interview_type.value,
        "status": "in_progress",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "questions": [],
        "answers": [],
        "overall_score": None,
        "completed_questions": 0,
        "skipped_questions": 0,
        "total_duration_seconds": 0,
    }
    
    result = await db.interview_sessions.insert_one(session)
    session_id = str(result.inserted_id)
    
    # Generate interview questions based on role and resume
    questions = await _generate_interview_questions(
        session_id,
        user_id,
        request.interview_type,
        request.selected_role,
        resume,
        analytics,
    )
    
    # Save questions
    await db.interview_questions.insert_many(questions)
    
    # Update session with question IDs
    question_ids = [str(q["_id"]) for q in questions]
    await db.interview_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"questions": question_ids}}
    )
    
    return InterviewSessionResponse(
        session_id=session_id,
        user_id=user_id,
        interview_type=request.interview_type,
        questions=[q for q in questions],  # Stripped of IDs
        status="in_progress",
        created_at=session["created_at"],
    )


async def _generate_interview_questions(
    session_id: str,
    user_id: str,
    interview_type: InterviewType,
    selected_role: Optional[str],
    resume: dict,
    analytics: Optional[dict],
) -> List[dict]:
    """Generate interview questions based on user profile and role."""
    db = get_db()
    questions = []
    
    # Question distribution based on interview type
    distribution = _get_question_distribution(interview_type)
    
    # Build context from resume
    user_context = f"""
    User Resume:
    - Skills: {resume.get('extracted_skills', [])}
    - Experience: {resume.get('years_of_experience', 0)} years
    - Projects: {len(resume.get('projects', []))} projects
    - Target Role: {selected_role}
    - ATS Score: {resume.get('ats_score', 'N/A')}
    """
    
    if analytics:
        user_context += f"""
    Weak Areas: {analytics.get('weak_topics', [])}
    Strong Areas: {analytics.get('strong_areas', [])}
    Previous Average Score: {analytics.get('average_score', 'N/A')}
    """
    
    # Generate questions for each category
    for category, count in distribution.items():
        for i in range(count):
            question = await _generate_question(
                session_id,
                category,
                user_context,
                selected_role,
            )
            if question:
                questions.append(question)
    
    return questions


def _get_question_distribution(interview_type: InterviewType) -> dict:
    """Get question distribution based on interview type."""
    distributions = {
        InterviewType.SDE: {
            QuestionType.BEHAVIORAL: 2,
            QuestionType.TECHNICAL: 2,
            QuestionType.CODING: 3,
            QuestionType.SYSTEM_DESIGN: 1,
            QuestionType.MCQ: 2,
        },
        InterviewType.FRONTEND: {
            QuestionType.BEHAVIORAL: 2,
            QuestionType.TECHNICAL: 3,
            QuestionType.CODING: 2,
            QuestionType.MCQ: 3,
        },
        InterviewType.BACKEND: {
            QuestionType.BEHAVIORAL: 2,
            QuestionType.TECHNICAL: 2,
            QuestionType.CODING: 2,
            QuestionType.SYSTEM_DESIGN: 2,
            QuestionType.MCQ: 2,
        },
        InterviewType.ML: {
            QuestionType.BEHAVIORAL: 2,
            QuestionType.TECHNICAL: 3,
            QuestionType.MCQ: 4,
            QuestionType.CODING: 1,
        },
        InterviewType.SYSTEM_DESIGN: {
            QuestionType.BEHAVIORAL: 1,
            QuestionType.SYSTEM_DESIGN: 4,
            QuestionType.TECHNICAL: 2,
        },
    }
    
    return distributions.get(interview_type, {
        QuestionType.BEHAVIORAL: 2,
        QuestionType.TECHNICAL: 2,
        QuestionType.CODING: 2,
        QuestionType.MCQ: 2,
    })


async def _generate_question(
    session_id: str,
    category: QuestionType,
    user_context: str,
    selected_role: str,
) -> Optional[dict]:
    """Generate a single interview question using AI."""
    
    prompt = f"""
    Generate a professional interview question for a {selected_role} position.
    
    Category: {category.value}
    User Context: {user_context}
    
    Return a JSON object with:
    {{
        "question_text": "The interview question",
        "context": "Why this question is asked",
        "why_asked": "What this tests",
        "expected_traits": ["trait1", "trait2"],
        "follow_up_questions": ["follow-up1", "follow-up2"],
        "ai_hints": ["hint1", "hint2"],
        "ideal_answer": "Example of a strong answer"
    }}
    """
    
    try:
        response = await openai_service.generate_text(prompt)
        data = json.loads(response)
        
        question = {
            "session_id": session_id,
            "category": category.value,
            "difficulty": _get_difficulty_for_category(category),
            "question_text": data.get("question_text", ""),
            "context": data.get("context", ""),
            "why_asked": data.get("why_asked", ""),
            "expected_traits": data.get("expected_traits", []),
            "follow_up_questions": data.get("follow_up_questions", []),
            "ai_hints": data.get("ai_hints", []),
            "ideal_answer": data.get("ideal_answer", ""),
            "marked_as_practiced": False,
            "created_at": datetime.utcnow(),
        }
        return question
    except Exception as e:
        print(f"Error generating question: {e}")
        return None


def _get_difficulty_for_category(category: QuestionType) -> str:
    """Determine difficulty based on category."""
    difficulty_map = {
        QuestionType.BEHAVIORAL: Difficulty.MEDIUM.value,
        QuestionType.TECHNICAL: Difficulty.HARD.value,
        QuestionType.CODING: Difficulty.HARD.value,
        QuestionType.SYSTEM_DESIGN: Difficulty.EXPERT.value,
        QuestionType.MCQ: Difficulty.MEDIUM.value,
    }
    return difficulty_map.get(category, Difficulty.MEDIUM.value)


@router.get("/session/{session_id}")
async def get_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get interview session details."""
    db = get_db()
    
    session = await db.interview_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": user_id,
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    return {
        "session_id": str(session["_id"]),
        "user_id": session["user_id"],
        "interview_type": session["interview_type"],
        "status": session["status"],
        "created_at": session["created_at"],
        "questions_count": len(session.get("questions", [])),
        "answers_count": len(session.get("answers", [])),
        "overall_score": session.get("overall_score"),
    }


@router.post("/resume-intelligence")
async def get_resume_intelligence(
    user_id: str = Depends(get_current_user_id),
):
    """Get intelligence from user's resume for interview personalization."""
    db = get_db()
    
    resume = await db.resumes.find_one({"user_id": user_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "ats_match_score": resume.get("ats_score", 0),
        "resume_strength": _calculate_resume_strength(resume),
        "interview_readiness": resume.get("interview_readiness_score", 0),
        "missing_skills": resume.get("missing_skills", []),
        "ai_confidence": resume.get("ai_confidence_score", 0),
        "recommended_role": resume.get("recommended_role", ""),
        "key_strengths": resume.get("key_strengths", []),
        "weak_areas": resume.get("weak_areas", []),
    }


def _calculate_resume_strength(resume: dict) -> int:
    """Calculate resume strength score 0-100."""
    score = 50  # baseline
    
    # Experience bonus
    years = resume.get("years_of_experience", 0)
    score += min(years * 3, 20)
    
    # Skills bonus
    skills_count = len(resume.get("extracted_skills", []))
    score += min(skills_count * 2, 15)
    
    # Projects bonus
    projects_count = len(resume.get("projects", []))
    score += min(projects_count * 3, 15)
    
    return min(score, 100)


# ─────────────────────────────────────────────────────────────
# ANSWER SUBMISSION & EVALUATION
# ─────────────────────────────────────────────────────────────

@router.post("/submit-answer")
async def submit_answer(
    request: SubmitAnswerRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Submit an answer and get AI evaluation."""
    db = get_db()
    
    # Get question details
    question = await db.interview_questions.find_one({
        "_id": ObjectId(request.question_id),
        "session_id": request.interview_session_id,
    })
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Evaluate answer
    evaluation = await _evaluate_answer(
        question,
        request.user_answer,
        request.answer_type,
    )
    
    # Save answer
    answer = {
        "session_id": request.interview_session_id,
        "question_id": request.question_id,
        "user_id": user_id,
        "user_answer": request.user_answer,
        "answer_type": request.answer_type,
        "duration_seconds": request.duration_seconds,
        "evaluation": evaluation.dict() if evaluation else None,
        "created_at": datetime.utcnow(),
    }
    
    result = await db.interview_answers.insert_one(answer)
    
    # Update session
    await db.interview_sessions.update_one(
        {"_id": ObjectId(request.interview_session_id)},
        {
            "$push": {"answers": str(result.inserted_id)},
            "$inc": {"completed_questions": 1},
            "$set": {"updated_at": datetime.utcnow()},
        }
    )
    
    return {
        "answer_id": str(result.inserted_id),
        "evaluation": evaluation.dict() if evaluation else None,
    }


async def _evaluate_answer(
    question: dict,
    user_answer: str,
    answer_type: str,
) -> Optional[EvaluationMetrics]:
    """Evaluate user's answer using AI."""
    
    prompt = f"""
    Evaluate the following interview answer:
    
    Question: {question.get('question_text')}
    Expected Traits: {question.get('expected_traits', [])}
    Ideal Answer: {question.get('ideal_answer', '')}
    
    User Answer: {user_answer}
    
    Return a JSON evaluation with:
    {{
        "overall_score": 0-100,
        "communication": 0-100,
        "technical_depth": 0-100,
        "confidence": 0-100,
        "problem_solving": 0-100,
        "leadership": 0-100,
        "clarity": 0-100,
        "correctness": 0-100,
        "star_format_adherence": 0-100,
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1"],
        "missing_concepts": ["concept1"],
        "improvements": ["improvement1"],
        "ideal_answer_full": "What a perfect answer should sound like",
        "rewritten_answer": "How to improve the user's answer",
        "follow_up_questions": ["follow-up1"]
    }}
    """
    
    try:
        response = await openai_service.generate_text(prompt)
        data = json.loads(response)
        
        return EvaluationMetrics(
            overall_score=data.get("overall_score", 0),
            communication=data.get("communication", 0),
            technical_depth=data.get("technical_depth", 0),
            confidence=data.get("confidence", 0),
            problem_solving=data.get("problem_solving", 0),
            leadership=data.get("leadership", 0),
            clarity=data.get("clarity", 0),
            correctness=data.get("correctness", 0),
            star_format_adherence=data.get("star_format_adherence", 0),
        )
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return None


# ─────────────────────────────────────────────────────────────
# ANALYTICS & INSIGHTS
# ─────────────────────────────────────────────────────────────

@router.get("/analytics/{session_id}")
async def get_session_analytics(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get analytics for a completed interview session."""
    db = get_db()
    
    session = await db.interview_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": user_id,
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all answers for this session
    answers = list(await db.interview_answers.find({
        "session_id": session_id
    }).to_list(None))
    
    # Calculate analytics
    analytics = _calculate_session_analytics(session, answers)
    
    # Update user's global analytics
    await _update_user_analytics(user_id, analytics)
    
    return analytics


def _calculate_session_analytics(session: dict, answers: List[dict]) -> dict:
    """Calculate comprehensive analytics for a session."""
    
    if not answers:
        return {
            "overall_score": 0,
            "total_questions": len(session.get("questions", [])),
            "answered_questions": 0,
            "communication": 0,
            "technical_depth": 0,
            "confidence": 0,
            "problem_solving": 0,
            "leadership": 0,
        }
    
    scores = [a.get("evaluation", {}) for a in answers if a.get("evaluation")]
    
    if not scores:
        return {
            "overall_score": 0,
            "total_questions": len(session.get("questions", [])),
            "answered_questions": len(answers),
        }
    
    avg_overall = sum(s.get("overall_score", 0) for s in scores) / len(scores)
    avg_communication = sum(s.get("communication", 0) for s in scores) / len(scores)
    avg_technical = sum(s.get("technical_depth", 0) for s in scores) / len(scores)
    avg_confidence = sum(s.get("confidence", 0) for s in scores) / len(scores)
    avg_problem_solving = sum(s.get("problem_solving", 0) for s in scores) / len(scores)
    avg_leadership = sum(s.get("leadership", 0) for s in scores) / len(scores)
    
    return {
        "overall_score": round(avg_overall, 1),
        "total_questions": len(session.get("questions", [])),
        "answered_questions": len(answers),
        "communication": round(avg_communication, 1),
        "technical_depth": round(avg_technical, 1),
        "confidence": round(avg_confidence, 1),
        "problem_solving": round(avg_problem_solving, 1),
        "leadership": round(avg_leadership, 1),
        "completed_at": datetime.utcnow(),
    }


async def _update_user_analytics(user_id: str, session_analytics: dict):
    """Update user's global interview analytics."""
    db = get_db()
    
    # Get or create user analytics
    analytics = await db.interview_analytics.find_one({"user_id": user_id})
    
    if not analytics:
        analytics = {
            "user_id": user_id,
            "total_interviews": 0,
            "total_questions_attempted": 0,
            "average_score": 0,
            "communication_trend": [],
            "technical_trend": [],
            "readiness_score": 0,
            "weak_topics": [],
            "strong_topics": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    
    # Update trends
    analytics["total_interviews"] += 1
    analytics["total_questions_attempted"] += session_analytics.get("answered_questions", 0)
    analytics["communication_trend"].append(session_analytics.get("communication", 0))
    analytics["technical_trend"].append(session_analytics.get("technical_depth", 0))
    
    # Calculate new average
    all_scores = analytics["communication_trend"] + analytics["technical_trend"]
    if all_scores:
        analytics["average_score"] = round(sum(all_scores) / len(all_scores), 1)
    
    analytics["updated_at"] = datetime.utcnow()
    
    await db.interview_analytics.update_one(
        {"user_id": user_id},
        {"$set": analytics},
        upsert=True,
    )


@router.get("/user-analytics")
async def get_user_analytics(
    user_id: str = Depends(get_current_user_id),
):
    """Get comprehensive user analytics across all interviews."""
    db = get_db()
    
    analytics = await db.interview_analytics.find_one({"user_id": user_id})
    
    if not analytics:
        return {
            "total_interviews": 0,
            "average_score": 0,
            "communication_trend": [],
            "technical_trend": [],
            "readiness_score": 0,
        }
    
    return {
        "total_interviews": analytics.get("total_interviews", 0),
        "average_score": analytics.get("average_score", 0),
        "communication_trend": analytics.get("communication_trend", []),
        "technical_trend": analytics.get("technical_trend", []),
        "readiness_score": analytics.get("readiness_score", 0),
        "weak_topics": analytics.get("weak_topics", []),
        "strong_topics": analytics.get("strong_topics", []),
    }


@router.post("/complete-interview/{session_id}")
async def complete_interview(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Mark interview as completed and finalize analytics."""
    db = get_db()
    
    session = await db.interview_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": user_id,
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get answers
    answers = list(await db.interview_answers.find({
        "session_id": session_id
    }).to_list(None))
    
    # Calculate final analytics
    analytics = _calculate_session_analytics(session, answers)
    
    # Update session
    await db.interview_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow(),
                "overall_score": analytics["overall_score"],
                "updated_at": datetime.utcnow(),
            }
        }
    )
    
    # Update user analytics
    await _update_user_analytics(user_id, analytics)
    
    return {
        "session_id": session_id,
        "status": "completed",
        "analytics": analytics,
    }
