"""Pydantic schemas for interview sessions, answers, and analytics."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class InterviewType(str, Enum):
    """Interview types available."""
    SDE = "sde"
    FRONTEND = "frontend"
    BACKEND = "backend"
    FULLSTACK = "fullstack"
    ML = "ml"
    AI = "ai"
    DATA_ANALYST = "data_analyst"
    DEVOPS = "devops"
    PRODUCT_BASED = "product_based"
    STARTUP = "startup"
    FAANG_MODE = "faang_mode"
    SYSTEM_DESIGN = "system_design"
    DSA_INTENSIVE = "dsa_intensive"


class QuestionType(str, Enum):
    """Question types available."""
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"
    CODING = "coding"
    SYSTEM_DESIGN = "system_design"
    MCQ = "mcq"
    HR = "hr"
    RAPID_FIRE = "rapid_fire"
    RESUME_DEEP_DIVE = "resume_deep_dive"
    MOCK_LOOP = "mock_loop"


class Difficulty(str, Enum):
    """Question difficulty levels."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class EvaluationMetrics(BaseModel):
    """AI evaluation metrics for an answer."""
    overall_score: int = Field(..., ge=0, le=100)
    communication: int = Field(..., ge=0, le=100)
    technical_depth: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    problem_solving: int = Field(..., ge=0, le=100)
    leadership: int = Field(..., ge=0, le=100)
    clarity: int = Field(..., ge=0, le=100)
    correctness: int = Field(..., ge=0, le=100)
    star_format_adherence: int = Field(..., ge=0, le=100)


class StrengthWeakness(BaseModel):
    """Identified strengths or weaknesses."""
    category: str
    description: str
    evidence: Optional[str] = None


class InterviewQuestion(BaseModel):
    """An interview question."""
    question_id: Optional[str] = None
    category: QuestionType
    difficulty: Difficulty
    question_text: str
    context: Optional[str] = None
    why_asked: Optional[str] = None
    expected_traits: List[str] = []
    follow_up_questions: List[str] = []
    interview_style: Optional[str] = None
    ai_hints: List[str] = []
    marked_as_practiced: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterviewAnswer(BaseModel):
    """User's answer to an interview question."""
    answer_id: Optional[str] = None
    interview_session_id: str
    question_id: str
    user_answer: str
    answer_type: str = "text"  # text, code, mcq, voice
    duration_seconds: Optional[int] = None
    
    # AI Evaluation
    metrics: Optional[EvaluationMetrics] = None
    strengths: List[StrengthWeakness] = []
    weaknesses: List[StrengthWeakness] = []
    missing_concepts: List[str] = []
    improvement_tips: List[str] = []
    ideal_answer: Optional[str] = None
    rewritten_answer: Optional[str] = None
    
    # For coding questions
    code_output: Optional[str] = None
    test_results: Optional[dict] = None
    execution_time_ms: Optional[int] = None
    
    # For MCQ
    selected_option: Optional[str] = None
    correct_option: Optional[str] = None
    explanation: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterviewSession(BaseModel):
    """An interview session."""
    session_id: Optional[str] = None
    user_id: str
    interview_type: InterviewType
    selected_role: Optional[str] = None
    questions: List[InterviewQuestion] = []
    answers: List[InterviewAnswer] = []
    
    # Session metadata
    start_time: datetime
    end_time: Optional[datetime] = None
    total_duration_seconds: Optional[int] = None
    
    # Scoring
    overall_score: Optional[int] = None
    average_communication_score: Optional[int] = None
    average_technical_score: Optional[int] = None
    average_confidence_score: Optional[int] = None
    
    # Status
    status: str = "in_progress"  # in_progress, completed, paused
    completed_questions: int = 0
    skipped_questions: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterviewAnalytics(BaseModel):
    """User's interview analytics."""
    analytics_id: Optional[str] = None
    user_id: str
    total_interviews: int = 0
    total_questions_attempted: int = 0
    average_score: Optional[int] = None
    
    # Skill scores
    communication_trend: List[int] = []
    coding_trend: List[int] = []
    system_design_trend: List[int] = []
    leadership_trend: List[int] = []
    
    # Topic-wise analytics
    topic_weaknesses: dict = {}  # {topic: score}
    topic_strengths: dict = {}
    
    # Confidence metrics
    confidence_scores: List[int] = []
    readiness_score: Optional[int] = None
    
    # Sessions
    interview_sessions: List[str] = []  # session IDs
    
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CodingProblem(BaseModel):
    """A coding problem for interview."""
    problem_id: Optional[str] = None
    title: str
    description: str
    difficulty: Difficulty
    category: str  # "array", "graph", "dp", etc.
    tags: List[str] = []
    
    # Examples
    examples: List[dict] = []  # [{input: ..., output: ..., explanation: ...}]
    
    # Constraints
    constraints: List[str] = []
    expected_time_complexity: Optional[str] = None
    expected_space_complexity: Optional[str] = None
    
    # Solution
    solution_template: dict = {}  # {language: template_code}
    test_cases: List[dict] = []  # [{input: ..., output: ..., hidden: bool}]
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MCQQuestion(BaseModel):
    """An MCQ question."""
    mcq_id: Optional[str] = None
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str
    category: str
    difficulty: Difficulty
    topic: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Request/Response DTOs

class StartInterviewRequest(BaseModel):
    """Request to start a new interview session."""
    interview_type: InterviewType
    selected_role: Optional[str] = None


class SubmitAnswerRequest(BaseModel):
    """Request to submit an answer."""
    interview_session_id: str
    question_id: str
    user_answer: str
    answer_type: str = "text"  # text, code, mcq, voice
    duration_seconds: Optional[int] = None
    code_language: Optional[str] = None


class SubmitCodingRequest(BaseModel):
    """Request to submit coding solution."""
    interview_session_id: str
    question_id: str
    code: str
    language: str
    duration_seconds: Optional[int] = None


class SubmitMCQRequest(BaseModel):
    """Request to submit MCQ answer."""
    interview_session_id: str
    question_id: str
    selected_option: int
    duration_seconds: Optional[int] = None


class InterviewSessionResponse(BaseModel):
    """Response with interview session data."""
    session_id: str
    user_id: str
    interview_type: InterviewType
    questions: List[InterviewQuestion]
    status: str
    created_at: datetime


class AnswerEvaluationResponse(BaseModel):
    """Response with answer evaluation."""
    answer_id: str
    metrics: EvaluationMetrics
    strengths: List[StrengthWeakness]
    weaknesses: List[StrengthWeakness]
    ideal_answer: str
    rewritten_answer: str
    improvement_tips: List[str]
    follow_up_questions: List[str]


class CodingEvaluationResponse(BaseModel):
    """Response with coding evaluation."""
    submission_id: str
    overall_score: int
    correctness: int
    efficiency: int
    code_quality: int
    passed_tests: int
    total_tests: int
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    optimal_solution: Optional[str] = None


class UserProfileForInterview(BaseModel):
    """User profile data for interview context."""
    user_id: str
    name: str
    email: str
    resume_skills: List[str] = []
    experience_years: int = 0
    target_role: str = ""
    weak_areas: List[str] = []
    previous_scores: List[int] = []
    target_role: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: List[str] = []
    projects: List[dict] = []
    ats_score: Optional[int] = None
    weak_areas: List[str] = []
    strong_areas: List[str] = []
