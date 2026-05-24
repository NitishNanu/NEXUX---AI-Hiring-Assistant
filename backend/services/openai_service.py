"""OpenAI Integration Service for text generation and evaluations."""

import json
import asyncio
from typing import Optional
from backend.config import settings
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI


class OpenAIService:
    """Service for generating text using OpenAI API."""
    
    def __init__(self):
        """Initialize the LLM based on configured provider."""
        self.llm = self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize LLM based on configured provider."""
        # Priority 1: Standard OpenAI (RECOMMENDED)
        if settings.use_openai:
            return ChatOpenAI(
                api_key=settings.openai_api_key,
                model="gpt-5.4-2026-03-05",  # Latest model for best quality
                temperature=0.7,
                max_tokens=2000,
            )
        # Priority 2: Google Gemini
        elif settings.use_gemini:
            return ChatGoogleGenerativeAI(
                google_api_key=settings.google_api_key,
                model="gemini-pro",
                temperature=0.7,
            )
        else:
            raise RuntimeError("No LLM provider configured")
    
    async def generate_text(self, prompt: str) -> str:
        """Generate text from a prompt."""
        try:
            response = await asyncio.to_thread(self._invoke_llm, prompt)
            return response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            print(f"Error generating text: {e}")
            raise

    def _invoke_llm(self, prompt: str):
        return self.llm.invoke(prompt)
    
    async def generate_json(self, prompt: str) -> dict:
        """Generate JSON response from a prompt."""
        try:
            response = await self.generate_text(prompt)
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise
    
    async def evaluate_answer(self, question: str, answer: str, ideal_answer: str) -> dict:
        """Evaluate an interview answer."""
        evaluation_prompt = f"""
        Evaluate this interview answer objectively and fairly.
        
        Question: {question}
        
        Ideal/Expected Answer: {ideal_answer}
        
        User's Answer: {answer}
        
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
            "strengths": [<list of 2-3 strengths>],
            "weaknesses": [<list of 2-3 weaknesses>],
            "missing_concepts": [<list of missing technical concepts>],
            "improvements": [<list of 3-4 specific improvements>],
            "ideal_answer_full": "<rewrite of an ideal answer>",
            "rewritten_answer": "<how to improve the user's answer>",
            "follow_up_questions": [<2-3 follow-up questions>]
        }}
        
        Be fair but constructive. Focus on helping them improve.
        """
        return await self.generate_json(evaluation_prompt)
    
    async def generate_interview_question(
        self,
        role: str,
        category: str,
        user_context: str,
        weak_areas: list = None,
    ) -> dict:
        """Generate a single interview question."""
        weak_areas_str = ", ".join(weak_areas) if weak_areas else "none identified"
        
        question_prompt = f"""
        Generate a {category} interview question for a {role} position.
        
        User Context:
        {user_context}
        
        User's Weak Areas: {weak_areas_str}
        
        Generate a specific, insightful question that would help assess their abilities for this role.
        
        Return ONLY a valid JSON object with these fields:
        {{
            "question_text": "<the interview question>",
            "context": "<why this question is important>",
            "why_asked": "<what specific skills/knowledge this tests>",
            "expected_traits": [<2-3 traits they should demonstrate>],
            "follow_up_questions": [<2-3 follow-up questions if they struggle>],
            "ai_hints": [<2-3 hints if they ask for help>],
            "ideal_answer": "<example of a strong answer>"
        }}
        """
        return await self.generate_json(question_prompt)
    
    async def generate_coding_hints(self, problem: str, user_code: str) -> dict:
        """Generate hints for a coding problem."""
        hints_prompt = f"""
        The user is working on this coding problem:
        
        {problem}
        
        Their current approach:
        {user_code}
        
        Provide helpful hints without giving away the solution.
        
        Return JSON:
        {{
            "observation": "<what you see in their approach>",
            "hints": [<3-4 hints to guide them>],
            "complexity_tips": "<advice on time/space complexity>",
            "edge_cases": [<2-3 edge cases to consider>]
        }}
        """
        return await self.generate_json(hints_prompt)
    
    async def generate_ai_insights(self, analytics: dict, sessions_count: int) -> list:
        """Generate personalized AI insights from analytics."""
        insights_prompt = f"""
        Based on this user's interview analytics:
        
        {json.dumps(analytics, indent=2)}
        
        Sessions Completed: {sessions_count}
        
        Generate 4-5 specific, actionable insights that would help them improve.
        Each insight should reference the actual data.
        
        Examples:
        - "You struggle with system design communication"
        - "Your coding accuracy improves in medium difficulty problems"
        - "Behavioral answers lack measurable impact metrics"
        
        Return JSON:
        {{
            "insights": [<list of 4-5 personalized insights>],
            "focus_areas": [<top 3 areas to focus on>],
            "strengths": [<2-3 confirmed strengths>]
        }}
        """
        return await self.generate_json(insights_prompt)
