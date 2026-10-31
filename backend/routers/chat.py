"""Chat router — RAG-powered HR chatbot with conversation memory and SSE streaming."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import asyncio
import json

from backend.services.rag_pipeline import chat_with_rag
from backend.services.interview_generator import generate_interview_questions

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str
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

    history_str = ""
    for msg in request.history[-10:]:
        history_str += f"{msg.role.capitalize()}: {msg.content}\n"

    resume_ctx = request.resume_context or ""

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


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming RAG chat via Server-Sent Events.
    Emits JSON lines: data: {"token": "word"}  or  data: {"done": true}
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    history_str = ""
    for msg in request.history[-10:]:
        history_str += f"{msg.role.capitalize()}: {msg.content}\n"

    resume_ctx = request.resume_context or ""

    async def event_stream():
        try:
            from backend.services.rag_pipeline import _get_llm
            llm = _get_llm()
            if llm is None:
                yield f"data: {json.dumps({'error': 'LLM not configured'})}\n\n"
                return

            # Build system + user prompt
            parts = [
                "You are NEXUS, an expert HR AI assistant. Be concise, direct, and helpful.",
            ]
            if resume_ctx:
                parts.append(f"\nResume Context:\n{resume_ctx[:2000]}")
            if history_str:
                parts.append(f"\nConversation History:\n{history_str.strip()}")
            parts.append(f"\nUser: {request.message}\n\nAssistant:")
            full_prompt = "\n".join(parts)

            # Try native async streaming first
            try:
                async for chunk in llm.astream(full_prompt):
                    token = getattr(chunk, 'content', None) or str(chunk)
                    if token:
                        yield f"data: {json.dumps({'token': token})}\n\n"

            except (AttributeError, NotImplementedError, TypeError):
                # Synchronous fallback: invoke once, emit word-by-word
                response = await asyncio.to_thread(llm.invoke, full_prompt)
                content = getattr(response, 'content', None) or str(response)
                words = content.split(' ')
                for i, word in enumerate(words):
                    tok = word + ('' if i == len(words) - 1 else ' ')
                    yield f"data: {json.dumps({'token': tok})}\n\n"
                    await asyncio.sleep(0.016)  # ~60fps feel

            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as exc:  # noqa: BLE001
            yield f"data: {json.dumps({'error': str(exc)[:200]})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


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
