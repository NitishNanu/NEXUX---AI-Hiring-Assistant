"""Chat router — RAG-powered HR chatbot with conversation memory."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from backend.services.rag_pipeline import chat_with_rag, ingest_texts
from backend.services.interview_generator import generate_interview_questions

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    resume_context: Optional[str] = None
    jd_context: Optional[str] = None


class IngestRequest(BaseModel):
    texts: list[str]
    metadatas: list[dict] = []


class InterviewQuestionsRequest(BaseModel):
    resume_text: str
    jd_text: str = ""
    num_questions: int = 10


def _normalize_questions(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        lines = [line.strip() for line in value.splitlines()]
        return [line.lstrip("-•0123456789. ").strip() for line in lines if line.strip()]
    return []


@router.post("/chat")
async def chat(request: ChatRequest):
    """RAG-powered chat endpoint with conversation memory."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Build chat history string
    history_str = ""
    for msg in request.history[-10:]:  # Keep last 10 messages for context
        history_str += f"{msg.role.capitalize()}: {msg.content}\n"

    # Build resume context
    resume_ctx = ""
    if request.resume_context:
        resume_ctx = request.resume_context

    # Check for interview question intent
    message_lower = request.message.lower()
    if any(kw in message_lower for kw in ["interview question", "interview prep", "prepare for interview"]):
        iq_result = generate_interview_questions(
            resume_text=resume_ctx or "No resume provided",
            jd_text=request.jd_context or "",
        )
        questions = _normalize_questions(iq_result.get("questions", []))
        return {
            "answer": "\n".join(f"{index + 1}. {question}" for index, question in enumerate(questions)),
            "sources": [],
            "context_used": 0,
            "type": "interview_questions",
        }

    # Regular RAG chat
    result = chat_with_rag(
        question=request.message,
        chat_history=history_str,
        resume_context=resume_ctx,
    )

    return {
        "answer": result["answer"],
        "sources": result["sources"],
        "context_used": result["context_used"],
        "type": "chat",
    }


@router.post("/interview_questions")
async def interview_questions(request: InterviewQuestionsRequest):
    """Generate targeted interview questions."""
    result = generate_interview_questions(
        resume_text=request.resume_text,
        jd_text=request.jd_text,
        num_questions=request.num_questions,
    )
    questions = _normalize_questions(result.get("questions", []))
    return {
        "questions": questions,
        "rule_based_questions": result.get("rule_based_questions", []),
        "source": result.get("source", "rule_based"),
        "count": len(questions),
    }
