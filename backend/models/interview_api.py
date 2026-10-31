"""
Pydantic request/response models for the mock interview API.

These models replace the bare `dict` parameters in router handlers,
providing input validation, OpenAPI schema generation, and IDE autocompletion.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field

from backend.models.interview import InterviewType


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------


class StartInterviewRequest(BaseModel):
    """Body for POST /api/mock-interview/start."""

    interview_type: str = Field(
        default="sde",
        description="Type of interview: sde, behavioral, technical, coding, system_design, etc.",
    )
    selected_role: str = Field(
        default="Software Engineer",
        description="Target role for the interview session.",
    )


class SubmitAnswerRequestEnhanced(BaseModel):
    """Body for POST /api/mock-interview/submit-answer."""

    interview_session_id: str = Field(..., description="Active session ID.")
    question_id: str = Field(..., description="ID of the question being answered.")
    answer_text: str = Field(..., min_length=1, description="Candidate's answer text.")
    duration_seconds: Optional[int] = Field(
        default=None, ge=0, description="Time taken to answer in seconds."
    )


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------


class StartInterviewResponse(BaseModel):
    """Response from POST /api/mock-interview/start."""

    session_id: str
    user_id: str
    interview_type: str
    selected_role: Optional[str]
    has_resume: bool
    status: str
    created_at: str


class ResumeIntelligenceResponse(BaseModel):
    """Response from GET /api/mock-interview/resume-intelligence."""

    ats_score: float
    resume_strength: float
    interview_readiness: float
    missing_skills: List[str]
    ai_confidence: int
    recommended_role: str


class QuestionResponse(BaseModel):
    """Response from GET /api/mock-interview/question/{session_id}."""

    id: str
    category: str
    difficulty: str
    questionText: str
    whyAsked: str
    expectedTraits: List[str]
    followUpQuestions: List[str]
    aiHints: List[str]
    idealAnswer: str
    description: str
    constraints: List
    examples: List
    expectedTimeComplexity: str
    expectedSpaceComplexity: str


class AnswerEvaluationEnhancedResponse(BaseModel):
    """Response from POST /api/mock-interview/submit-answer."""

    answer_id: str
    overall_score: int
    communication: int
    technical_depth: int
    confidence: int
    problem_solving: int
    leadership: int
    clarity: int
    correctness: int
    star_format_adherence: int
    strengths: List[str]
    weaknesses: List[str]
    missing_concepts: List[str]
    improvements: List[str]
    ideal_answer_full: str
    rewritten_answer: str
    follow_up_questions: List[str]
    readiness_score: int


class SessionAnalyticsResponse(BaseModel):
    """Response from GET /api/mock-interview/analytics/{session_id}."""

    communication: float
    technical_depth: float
    confidence: float
    problem_solving: float
    leadership: float
    system_design: float
    coding: float
    readiness_score: float
    session_id: str


class SessionHistoryItem(BaseModel):
    """One item in the session history list."""

    session_id: str
    interview_type: Optional[str]
    selected_role: Optional[str]
    score: Optional[float]
    status: Optional[str]
    created_at: str


class InterviewHistoryResponse(BaseModel):
    """Response from GET /api/mock-interview/history."""

    total: int
    sessions: List[SessionHistoryItem]


class HintsResponse(BaseModel):
    """Response from GET /api/mock-interview/hints/{session_id}/{question_id}."""

    hints: List[str]
    step_count: int


class EndInterviewResponse(BaseModel):
    """Response from POST /api/mock-interview/end/{session_id}."""

    completed: bool
    score: float
    session_id: str
