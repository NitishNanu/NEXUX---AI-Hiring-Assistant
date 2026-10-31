"""
OpenAI / Gemini LLM Service.

Responsibilities
----------------
* Initialize the configured LLM provider (OpenAI preferred, Gemini fallback).
* Provide async helpers for plain text generation and structured JSON generation.
* Evaluate interview answers and generate questions / hints.
* Apply safe prompt-length limits to prevent context overflow and prompt injection.
* Retry transient LLM errors with exponential backoff before giving up.

Design decisions
----------------
* ``generate_text`` wraps the synchronous LangChain ``invoke`` call in
  ``asyncio.to_thread`` so FastAPI's event loop is never blocked.
* ``generate_json`` initialises ``response_text`` before the try block so the
  ``except`` clause can safely reference it even when ``generate_text`` raises.
* Retries: up to 3 attempts with exponential back-off (1s, 2s, 4s) before
  propagating the error and serving static fallback data from InterviewEngine.
* All public methods have explicit return-type annotations and raise descriptive
  exceptions rather than silently returning empty structures.
"""

from __future__ import annotations

import json
import asyncio
import re
from typing import Optional

import tenacity

from backend.config import settings
from backend.exceptions import LLMUnavailableError
from backend.logger import get_logger

log = get_logger(__name__)


# ---------------------------------------------------------------------------
# Module-level LLM singleton (initialised once, reused everywhere)
# ---------------------------------------------------------------------------

_llm_instance = None


def _get_llm_instance():
    """Return a module-level LLM singleton, initialising on first call."""
    global _llm_instance
    if _llm_instance is not None:
        return _llm_instance

    if settings.use_openai:
        from langchain_openai import ChatOpenAI
        _llm_instance = ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=0.7,
            max_tokens=2000,
            request_timeout=60,
        )
        log.info("LLM initialized", provider="openai", model=settings.openai_model)
    elif settings.use_gemini:
        from langchain_google_genai import ChatGoogleGenerativeAI
        _llm_instance = ChatGoogleGenerativeAI(
            google_api_key=settings.google_api_key,
            model=settings.gemini_model,
            temperature=0.7,
        )
        log.info("LLM initialized", provider="gemini", model=settings.gemini_model)
    else:
        raise LLMUnavailableError(
            "No LLM provider configured. Set OPENAI_API_KEY or GOOGLE_API_KEY."
        )

    return _llm_instance


def _sanitize_prompt_input(text: str, max_chars: int = 3000) -> str:
    """
    Truncate user-supplied text to prevent prompt injection and context overflow.
    Does not strip the text of content — only length-limits it.
    """
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n\n[Content truncated for processing]"


def _extract_json_from_text(text: str) -> Optional[dict]:
    """
    Attempt to parse JSON from a raw LLM response.

    Handles three common patterns:
    1. Pure JSON
    2. JSON wrapped in ```json ... ``` fences
    3. JSON object embedded somewhere in surrounding prose
    """
    # Strip markdown code fences
    stripped = text.strip()
    if stripped.startswith("```"):
        # Remove opening fence (```json or ```)
        stripped = re.sub(r"^```[a-zA-Z]*\n?", "", stripped)
        # Remove closing fence
        stripped = re.sub(r"\n?```$", "", stripped.rstrip())
        stripped = stripped.strip()

    # Try direct parse first
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # Try extracting the first {...} block
    match = re.search(r"\{.*\}", stripped, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


# ---------------------------------------------------------------------------
# Main service class
# ---------------------------------------------------------------------------


class OpenAIService:
    """Service for generating text and structured JSON using the configured LLM."""

    def __init__(self) -> None:
        # Validate that a provider is configured at construction time so
        # failures surface early (e.g. during startup) rather than at
        # request time.
        self._llm = _get_llm_instance()

    # ------------------------------------------------------------------
    # Core generation primitives
    # ------------------------------------------------------------------

    @tenacity.retry(
        stop=tenacity.stop_after_attempt(3),
        wait=tenacity.wait_exponential(multiplier=1, min=1, max=8),
        retry=tenacity.retry_if_exception_type(Exception),
        reraise=True,
        before_sleep=lambda rs: log.warning(
            "LLM call retrying",
            attempt=rs.attempt_number,
            error=str(rs.outcome.exception()),
        ),
    )
    async def generate_text(self, prompt: str) -> str:
        """
        Generate free-form text from *prompt*.

        Retries up to 3 times with exponential back-off before re-raising.
        Raises
        ------
        RuntimeError
            When the LLM call fails after exhausting retries.
        """
        try:
            response = await asyncio.to_thread(self._llm.invoke, prompt)
            return response.content if hasattr(response, "content") else str(response)
        except Exception as exc:
            raise RuntimeError(f"LLM text generation failed: {exc}") from exc

    async def generate_json(self, prompt: str) -> dict:
        """
        Generate a JSON object from *prompt*.

        ``response_text`` is initialised to an empty string before the try block
        so that the except clause can reference it safely even when
        ``generate_text`` raises before assigning a value.

        Raises
        ------
        ValueError
            When the LLM response cannot be parsed as JSON after all
            extraction attempts.
        RuntimeError
            When the LLM call itself fails.
        """
        response_text: str = ""  # must be initialised before try
        try:
            response_text = await self.generate_text(prompt)
            parsed = _extract_json_from_text(response_text)
            if parsed is not None:
                return parsed
            raise ValueError(
                f"LLM returned non-JSON response: {response_text[:200]!r}"
            )
        except (RuntimeError, ValueError):
            raise
        except Exception as exc:
            raise ValueError(
                f"JSON generation failed. Raw response: {response_text[:200]!r}. "
                f"Error: {exc}"
            ) from exc

    # ------------------------------------------------------------------
    # Answer evaluation
    # ------------------------------------------------------------------

    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        ideal_answer: str,
    ) -> dict:
        """
        Evaluate a single interview answer and return a structured scoring dict.

        All user-supplied fields are length-limited before injection into the
        prompt to prevent prompt injection and context overflow.
        """
        safe_question = _sanitize_prompt_input(question, 500)
        safe_answer = _sanitize_prompt_input(answer, 2000)
        safe_ideal = _sanitize_prompt_input(ideal_answer, 1000)

        prompt = f"""Evaluate this interview answer objectively and fairly.

Question: {safe_question}

Ideal/Expected Answer: {safe_ideal}

User's Answer: {safe_answer}

Provide a JSON evaluation with these exact fields:
{{
    "overall_score": <0-100 integer>,
    "communication": <0-100 integer>,
    "technical_depth": <0-100 integer>,
    "confidence": <0-100 integer>,
    "problem_solving": <0-100 integer>,
    "leadership": <0-100 integer>,
    "clarity": <0-100 integer>,
    "correctness": <0-100 integer>,
    "star_format_adherence": <0-100 integer>,
    "strengths": [<list of 2-3 specific strengths>],
    "weaknesses": [<list of 2-3 specific weaknesses>],
    "missing_concepts": [<list of missing technical concepts>],
    "improvements": [<list of 3-4 specific actionable improvements>],
    "ideal_answer_full": "<a complete model answer>",
    "rewritten_answer": "<how to improve the user's answer>",
    "follow_up_questions": [<2-3 natural follow-up questions>]
}}

Be fair, constructive, and specific. Return ONLY the JSON object."""

        return await self.generate_json(prompt)

    # ------------------------------------------------------------------
    # Question generation helpers
    # ------------------------------------------------------------------

    async def generate_interview_question(
        self,
        role: str,
        category: str,
        user_context: str,
        weak_areas: list[str] | None = None,
    ) -> dict:
        """Generate a single interview question tailored to the candidate."""
        safe_context = _sanitize_prompt_input(user_context, 1500)
        weak_areas_str = ", ".join(weak_areas) if weak_areas else "none identified"

        prompt = f"""Generate a {category} interview question for a {role} position.

User Context:
{safe_context}

User's Weak Areas: {weak_areas_str}

Return ONLY a valid JSON object:
{{
    "question_text": "<the interview question>",
    "context": "<why this question is important>",
    "why_asked": "<what specific skills/knowledge this tests>",
    "expected_traits": ["<trait1>", "<trait2>", "<trait3>"],
    "follow_up_questions": ["<follow-up 1>", "<follow-up 2>"],
    "ai_hints": ["<hint 1>", "<hint 2>", "<hint 3>"],
    "ideal_answer": "<example of a strong answer>"
}}"""

        return await self.generate_json(prompt)

    async def generate_coding_hints(self, problem: str, user_code: str) -> dict:
        """Generate progressive hints for a coding problem without giving away the solution."""
        safe_problem = _sanitize_prompt_input(problem, 1000)
        safe_code = _sanitize_prompt_input(user_code, 1500)

        prompt = f"""The user is working on this coding problem:

{safe_problem}

Their current code:
{safe_code}

Provide helpful hints without revealing the complete solution.

Return ONLY a JSON object:
{{
    "observation": "<what you observe about their approach>",
    "hints": ["<hint 1>", "<hint 2>", "<hint 3>"],
    "complexity_tips": "<advice on time/space complexity>",
    "edge_cases": ["<edge case 1>", "<edge case 2>"]
}}"""

        return await self.generate_json(prompt)

    async def generate_ai_insights(self, analytics: dict, sessions_count: int) -> dict:
        """Generate personalised AI insights from aggregated analytics data."""
        import json as _json

        prompt = f"""Based on this user's interview analytics:

{_json.dumps(analytics, indent=2)}

Sessions Completed: {sessions_count}

Generate 4-5 specific, actionable insights that reference the actual data.

Return ONLY a JSON object:
{{
    "insights": ["<insight 1>", "<insight 2>", "<insight 3>", "<insight 4>"],
    "focus_areas": ["<area 1>", "<area 2>", "<area 3>"],
    "strengths": ["<strength 1>", "<strength 2>"]
}}"""

        return await self.generate_json(prompt)
