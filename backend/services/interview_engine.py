"""
Interview question generation and AI answer evaluation engine.

All methods return rich structured dicts.  When the LLM call fails the engine
falls back to sensible static data so the UI never breaks.

Design notes
------------
* A single ``OpenAIService`` instance is created per ``InterviewEngine``
  instance.  The underlying LLM itself is a module-level singleton in
  ``openai_service``, so creating multiple engine instances does not waste
  resources.
* All user-supplied text is sanitised (length-limited) before prompt injection.
* JSON cleaning (markdown fence stripping) is centralised in
  ``openai_service._extract_json_from_text`` — not duplicated here.
"""

from __future__ import annotations

import json
from typing import Any

from backend.services.openai_service import OpenAIService, _sanitize_prompt_input


class InterviewEngine:
    """Generate interview questions and AI-evaluate candidate answers."""

    def __init__(self) -> None:
        self._ai = OpenAIService()

    # ------------------------------------------------------------------
    # Question generators
    # ------------------------------------------------------------------

    async def generate_behavioral_question(
        self,
        user_context: str,
        role: str,
        weak_topics: list[str] | None = None,
    ) -> dict[str, Any]:
        """Generate a behavioral (STAR-format) interview question."""
        safe_ctx = _sanitize_prompt_input(user_context, 1500)
        weak_str = ", ".join(weak_topics) if weak_topics else "general competencies"

        prompt = f"""Generate a behavioral interview question for a {role} position.

User Context:
{safe_ctx}

Focus Areas: {weak_str}

Return ONLY a valid JSON object (no markdown, no code fences):
{{
    "question_text": "<specific behavioral question>",
    "why_asked": "<why this question matters>",
    "expected_traits": ["<trait1>", "<trait2>", "<trait3>"],
    "follow_up_questions": ["<follow-up 1>", "<follow-up 2>"],
    "ai_hints": ["<hint 1>", "<hint 2>", "<hint 3>"],
    "ideal_answer": "<what an excellent answer looks like>",
    "difficulty": "medium"
}}"""
        return await self._generate_with_fallback(prompt, "behavioral")

    async def generate_technical_question(
        self,
        user_context: str,
        role: str,
        weak_topics: list[str] | None = None,
    ) -> dict[str, Any]:
        """Generate a technical knowledge interview question."""
        safe_ctx = _sanitize_prompt_input(user_context, 1500)
        weak_str = ", ".join(weak_topics) if weak_topics else "general technical knowledge"

        prompt = f"""Generate a technical interview question for a {role} position.

User Context:
{safe_ctx}

Weak Areas to Test: {weak_str}

Return ONLY a valid JSON object (no markdown, no code fences):
{{
    "question_text": "<the technical question>",
    "why_asked": "<what this tests>",
    "expected_traits": ["deep_knowledge", "problem_solving", "clarity"],
    "follow_up_questions": ["<follow-up 1>", "<follow-up 2>"],
    "ai_hints": ["<hint 1>", "<hint 2>", "<hint 3>"],
    "ideal_answer": "<expected answer structure>",
    "difficulty": "medium"
}}"""
        return await self._generate_with_fallback(prompt, "technical")

    async def generate_coding_question(
        self,
        user_context: str,
        role: str,
        difficulty: str = "medium",
    ) -> dict[str, Any]:
        """Generate a coding / algorithmic problem."""
        safe_ctx = _sanitize_prompt_input(user_context, 1500)

        prompt = f"""Generate a {difficulty} difficulty coding problem for a {role} position.

User Context:
{safe_ctx}

Return ONLY a valid JSON object (no markdown, no code fences):
{{
    "question_text": "<clear problem title>",
    "description": "<detailed problem statement with context>",
    "constraints": ["<constraint 1>", "<constraint 2>"],
    "examples": [
        {{"input": "<example input>", "output": "<example output>", "explanation": "<why>"}}
    ],
    "expected_time_complexity": "O(n)",
    "expected_space_complexity": "O(1)",
    "ai_hints": ["<hint 1>", "<hint 2>", "<hint 3>"],
    "follow_up_questions": ["<follow-up 1>", "<follow-up 2>"],
    "ideal_answer": "<optimal solution sketch>",
    "difficulty": "{difficulty}"
}}"""
        return await self._generate_with_fallback(prompt, "coding")

    async def generate_system_design_question(
        self,
        user_context: str,
        role: str,
    ) -> dict[str, Any]:
        """Generate a system design interview question."""
        safe_ctx = _sanitize_prompt_input(user_context, 1500)

        prompt = f"""Generate a system design interview question for a {role} position.

User Context:
{safe_ctx}

Return ONLY a valid JSON object (no markdown, no code fences):
{{
    "question_text": "Design a system for ...",
    "why_asked": "Tests scalability and architecture thinking",
    "expected_traits": ["scalability", "reliability", "design_patterns"],
    "follow_up_questions": [
        "How would you handle 1M requests per second?",
        "How do you ensure high availability?"
    ],
    "ai_hints": ["Consider CAP theorem", "Think about load balancing", "Discuss caching"],
    "ideal_answer": "<high-level architectural walkthrough>",
    "difficulty": "hard"
}}"""
        return await self._generate_with_fallback(prompt, "system_design")

    async def generate_mcq_question(
        self,
        user_context: str,
        topic: str,
        difficulty: str = "medium",
    ) -> dict[str, Any]:
        """Generate a multiple-choice question."""
        safe_ctx = _sanitize_prompt_input(user_context, 800)

        prompt = f"""Generate a {difficulty} difficulty MCQ question about {topic}.

User Context:
{safe_ctx}

Return ONLY a valid JSON object (no markdown, no code fences):
{{
    "question_text": "<the question>",
    "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
    "correct_option": <0-3 integer index of correct option>,
    "explanation": "<why this answer is correct and others are wrong>",
    "topic": "{topic}",
    "concepts": ["<concept1>", "<concept2>"],
    "difficulty": "{difficulty}"
}}"""
        return await self._generate_with_fallback(prompt, "mcq")

    # ------------------------------------------------------------------
    # Answer evaluation
    # ------------------------------------------------------------------

    async def evaluate_answer(
        self,
        question: dict[str, Any],
        user_answer: str,
        question_type: str = "behavioral",
    ) -> dict[str, Any]:
        """
        Evaluate a candidate's free-text answer using AI.

        Returns a dict with keys:
          overall_score, communication, technical_depth, confidence,
          problem_solving, leadership, clarity, correctness,
          star_format_adherence, strengths, weaknesses, missing_concepts,
          improvements, ideal_answer_full, rewritten_answer,
          follow_up_questions

        All scores are integers in [0, 100].
        """
        safe_answer = _sanitize_prompt_input(user_answer, 2000)
        question_text = question.get("question_text", "")
        ideal = question.get("ideal_answer", "")
        traits = question.get("expected_traits", [])

        prompt = f"""Evaluate this interview answer objectively and thoroughly.

Question: {question_text}
Expected Traits: {traits}
Ideal Answer: {_sanitize_prompt_input(ideal, 800)}

User's Answer:
{safe_answer}

Return ONLY a valid JSON object (no markdown, no code fences):
{{
    "overall_score": <0-100>,
    "communication": <0-100>,
    "technical_depth": <0-100>,
    "confidence": <0-100>,
    "problem_solving": <0-100>,
    "leadership": <0-100>,
    "clarity": <0-100>,
    "correctness": <0-100>,
    "star_format_adherence": <0-100>,
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "missing_concepts": ["<concept 1>"],
    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
    "ideal_answer_full": "<complete model answer>",
    "rewritten_answer": "<rewrite of user's answer with improvements>",
    "follow_up_questions": ["<follow-up 1>", "<follow-up 2>"]
}}"""
        return await self._evaluate_with_fallback(prompt)

    async def evaluate_coding_answer(
        self,
        problem: dict[str, Any],
        code: str,
        test_results: dict[str, Any],
    ) -> dict[str, Any]:
        """Evaluate a coding solution for correctness, efficiency, and quality."""
        safe_code = _sanitize_prompt_input(code, 2000)

        prompt = f"""Evaluate this coding solution:

Problem: {problem.get('question_text', '')}
Expected Time: {problem.get('expected_time_complexity', 'N/A')}
Expected Space: {problem.get('expected_space_complexity', 'N/A')}

Code:
{safe_code}

Test Results: {json.dumps(test_results)}

Return ONLY a valid JSON object (no markdown, no code fences):
{{
    "overall_score": <0-100>,
    "correctness": <0-100>,
    "efficiency": <0-100>,
    "code_quality": <0-100>,
    "readability": <0-100>,
    "edge_case_handling": <0-100>,
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "missing_concepts": ["<concept>"],
    "time_complexity_actual": "<O(...)>",
    "space_complexity_actual": "<O(...)>",
    "improvements": ["<improvement 1>", "<improvement 2>"],
    "optimal_solution": "<brief description of optimal approach>",
    "follow_up": "<a good follow-up challenge>"
}}"""
        return await self._evaluate_with_fallback(prompt, coding=True)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _generate_with_fallback(
        self, prompt: str, question_type: str
    ) -> dict[str, Any]:
        try:
            return await self._ai.generate_json(prompt)
        except Exception as exc:
            print(f"[InterviewEngine] Question generation failed ({question_type}): {exc}")
            return self._get_fallback_question(question_type)

    async def _evaluate_with_fallback(
        self, prompt: str, *, coding: bool = False
    ) -> dict[str, Any]:
        try:
            return await self._ai.generate_json(prompt)
        except Exception as exc:
            print(f"[InterviewEngine] Evaluation failed: {exc}")
            return self._get_fallback_coding_evaluation() if coding else self._get_fallback_evaluation()

    # ------------------------------------------------------------------
    # Static fallback data (used when LLM is unavailable)
    # ------------------------------------------------------------------

    @staticmethod
    def _get_fallback_question(question_type: str) -> dict[str, Any]:
        fallbacks: dict[str, dict[str, Any]] = {
            "behavioral": {
                "question_text": "Tell me about a time you had to overcome a significant challenge at work.",
                "why_asked": "Tests problem-solving resilience and communication",
                "expected_traits": ["problem_solving", "resilience", "communication"],
                "follow_up_questions": ["What did you learn?", "What would you do differently?"],
                "ai_hints": ["Use the STAR method", "Quantify the impact", "Show what you learned"],
                "ideal_answer": "Structure: Situation → Task → Action → Result, with specific metrics.",
                "difficulty": "medium",
            },
            "technical": {
                "question_text": "Explain the difference between SQL and NoSQL databases.",
                "why_asked": "Tests fundamental database knowledge",
                "expected_traits": ["technical_knowledge", "clarity", "critical_thinking"],
                "follow_up_questions": ["When would you choose each?", "What are the trade-offs?"],
                "ai_hints": ["Consider ACID properties", "Think about scalability", "Discuss schema flexibility"],
                "ideal_answer": "SQL: ACID, fixed schema, relational. NoSQL: flexible schema, horizontal scaling.",
                "difficulty": "medium",
            },
            "coding": {
                "question_text": "Write a function to find two numbers in an array that sum to a target.",
                "description": "Given an integer array and a target, return the indices of two numbers that add up to the target.",
                "constraints": ["2 <= n <= 10^4", "Each input has exactly one solution"],
                "examples": [{"input": "[2,7,11,15], target=9", "output": "[0,1]", "explanation": "2+7=9"}],
                "expected_time_complexity": "O(n)",
                "expected_space_complexity": "O(n)",
                "ai_hints": ["Use a hash map", "Single-pass is possible", "Store complement → index"],
                "follow_up_questions": ["Can you do it with O(1) space?"],
                "ideal_answer": "Iterate with a hash map; for each num store target-num → index, check on each step.",
                "difficulty": "medium",
            },
            "system_design": {
                "question_text": "Design a URL shortener like bit.ly",
                "why_asked": "Tests scalability and architecture thinking",
                "expected_traits": ["scalability", "design_patterns", "problem_solving"],
                "follow_up_questions": ["How to handle 1M URLs daily?", "How do you handle collisions?"],
                "ai_hints": ["Consider distributed ID generation", "Think about caching", "Database sharding"],
                "ideal_answer": "API layer → encoder service → DB (short→long) → CDN cache → analytics.",
                "difficulty": "hard",
            },
            "mcq": {
                "question_text": "What is the time complexity of binary search?",
                "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
                "correct_option": 2,
                "explanation": "Binary search halves the search space each step → O(log n).",
                "topic": "algorithms",
                "concepts": ["binary_search", "logarithmic_complexity"],
                "difficulty": "easy",
            },
        }
        return fallbacks.get(question_type, fallbacks["behavioral"])

    @staticmethod
    def _get_fallback_evaluation() -> dict[str, Any]:
        return {
            "overall_score": 70,
            "communication": 72,
            "technical_depth": 65,
            "confidence": 70,
            "problem_solving": 68,
            "leadership": 60,
            "clarity": 72,
            "correctness": 70,
            "star_format_adherence": 65,
            "strengths": ["Clear communication", "Relevant experience mentioned"],
            "weaknesses": ["Lacks specific metrics", "Answer could be more structured"],
            "missing_concepts": ["Quantified impact"],
            "improvements": [
                "Add specific numbers and metrics",
                "Use the STAR format explicitly",
                "Describe the long-term outcome",
            ],
            "ideal_answer_full": "A stronger answer would include: specific situation, measurable impact, and key learning.",
            "rewritten_answer": "Try restructuring with: Situation (1-2 sentences) → Task → Actions taken → Quantified Result.",
            "follow_up_questions": ["Can you give a specific metric?", "What would you do differently?"],
        }

    @staticmethod
    def _get_fallback_coding_evaluation() -> dict[str, Any]:
        return {
            "overall_score": 70,
            "correctness": 75,
            "efficiency": 65,
            "code_quality": 70,
            "readability": 72,
            "edge_case_handling": 60,
            "strengths": ["Correct base logic", "Readable variable names"],
            "weaknesses": ["Suboptimal time complexity", "Missing edge cases"],
            "missing_concepts": ["hash map optimization"],
            "time_complexity_actual": "O(n²)",
            "space_complexity_actual": "O(1)",
            "improvements": [
                "Use a hash map to reduce to O(n)",
                "Handle empty array and null inputs",
            ],
            "optimal_solution": "Single-pass with hash map tracking complements.",
            "follow_up": "Can you solve it in a single pass with O(n) time?",
        }
