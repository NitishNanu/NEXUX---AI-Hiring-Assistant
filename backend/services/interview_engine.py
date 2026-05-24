"""Interview question generation and AI evaluation engine."""

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from backend.config import settings
from backend.services.openai_service import OpenAIService


class InterviewEngine:
    """Generate interview questions and evaluate answers."""

    def __init__(self):
        self.openai = OpenAIService()

    async def generate_behavioral_question(
        self,
        user_context: str,
        role: str,
        weak_topics: List[str] = None,
    ) -> Dict[str, Any]:
        """Generate a behavioral interview question."""
        prompt = f"""
        Generate a behavioral interview question for a {role} position.
        
        User Context:
        {user_context}
        
        Focus Areas (if applicable):
        {weak_topics or 'General competencies'}
        
        Return a VALID JSON object (no code blocks):
        {{
            "question_text": "The specific behavioral question",
            "why_asked": "Why this question is important",
            "expected_traits": ["trait1", "trait2", "trait3"],
            "follow_up_questions": ["How did you handle conflict?", "What would you do differently?"],
            "ai_hints": ["Use STAR method", "Quantify impact", "Show learning"],
            "ideal_answer": "What an excellent answer includes..."
        }}
        """
        return await self._generate_with_fallback(prompt, "behavioral")

    async def generate_technical_question(
        self,
        user_context: str,
        role: str,
        weak_topics: List[str] = None,
    ) -> Dict[str, Any]:
        """Generate a technical interview question."""
        prompt = f"""
        Generate a technical interview question for a {role} position.
        
        User Context:
        {user_context}
        
        Weak Areas to Test:
        {weak_topics or 'General technical knowledge'}
        
        Return a VALID JSON object (no code blocks):
        {{
            "question_text": "The technical question",
            "why_asked": "What this tests",
            "expected_traits": ["deep_knowledge", "problem_solving", "clarity"],
            "follow_up_questions": ["Can you explain the tradeoffs?", "How would you optimize this?"],
            "ai_hints": ["Think about scalability", "Consider edge cases", "Discuss complexity"],
            "ideal_answer": "Expected answer structure..."
        }}
        """
        return await self._generate_with_fallback(prompt, "technical")

    async def generate_coding_question(
        self,
        user_context: str,
        role: str,
        difficulty: str = "medium",
    ) -> Dict[str, Any]:
        """Generate a coding problem."""
        prompt = f"""
        Generate a {difficulty} level coding problem for a {role} position.
        
        User Context:
        {user_context}
        
        Return a VALID JSON object (no code blocks):
        {{
            "question_text": "Clear problem statement",
            "description": "Detailed problem description with examples",
            "constraints": ["Time limit: O(n)", "Space limit: O(1)", "1 <= n <= 10^6"],
            "examples": [
                {{"input": "nums = [1,2,3]", "output": "6", "explanation": "Sum of elements"}},
                {{"input": "nums = []", "output": "0", "explanation": "Empty array"}}
            ],
            "expected_time_complexity": "O(n)",
            "expected_space_complexity": "O(1)",
            "ai_hints": ["Think about two pointers", "Consider prefix sums", "Optimize with sorting"],
            "follow_up_questions": ["How would you optimize for space?", "Can you solve in one pass?"],
            "ideal_answer": "Here's an optimal solution with explanation..."
        }}
        """
        return await self._generate_with_fallback(prompt, "coding")

    async def generate_system_design_question(
        self,
        user_context: str,
        role: str,
    ) -> Dict[str, Any]:
        """Generate a system design question."""
        prompt = f"""
        Generate a system design interview question for a {role} position.
        
        User Context:
        {user_context}
        
        Return a VALID JSON object (no code blocks):
        {{
            "question_text": "Design a system for...",
            "why_asked": "Tests scalability and architecture thinking",
            "expected_traits": ["scalability", "reliability", "design_patterns"],
            "follow_up_questions": [
                "How would you handle 1M requests per second?",
                "What about consistency vs availability?",
                "How would you design the database schema?"
            ],
            "ai_hints": ["Consider CAP theorem", "Think about load balancing", "Discuss caching strategies"],
            "ideal_answer": "A strong answer would include: Requirements analysis, High-level architecture, Deep dive into specific components..."
        }}
        """
        return await self._generate_with_fallback(prompt, "system_design")

    async def generate_mcq_question(
        self,
        user_context: str,
        topic: str,
        difficulty: str = "medium",
    ) -> Dict[str, Any]:
        """Generate an MCQ question."""
        prompt = f"""
        Generate a {difficulty} level MCQ question about {topic}.
        
        User Context:
        {user_context}
        
        Return a VALID JSON object (no code blocks):
        {{
            "question_text": "The MCQ question",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_option": 0,
            "explanation": "Detailed explanation of why this is correct and why others are wrong",
            "topic": "{topic}",
            "concepts": ["concept1", "concept2"]
        }}
        """
        return await self._generate_with_fallback(prompt, "mcq")

    async def evaluate_answer(
        self,
        question: Dict[str, Any],
        user_answer: str,
        question_type: str = "behavioral",
    ) -> Dict[str, Any]:
        """Evaluate a user's answer using AI."""
        prompt = f"""
        Evaluate this interview answer:
        
        Question: {question.get('question_text', '')}
        Expected Traits: {question.get('expected_traits', [])}
        Ideal Answer: {question.get('ideal_answer', '')}
        
        User's Answer:
        {user_answer}
        
        Return a VALID JSON object (no code blocks):
        {{
            "overall_score": 75,
            "communication": 80,
            "technical_depth": 70,
            "confidence": 75,
            "problem_solving": 70,
            "leadership": 65,
            "clarity": 80,
            "correctness": 75,
            "star_format_adherence": 75,
            "strengths": ["Good structure", "Clear explanation"],
            "weaknesses": ["Missing specific metrics", "Could quantify impact more"],
            "missing_concepts": ["ROI calculation"],
            "improvements": [
                "Quantify the impact with specific numbers",
                "Include a specific challenge and how you overcame it"
            ],
            "ideal_answer_full": "A better answer would be: ...",
            "rewritten_answer": "Here's how you could have answered: ...",
            "follow_up_questions": ["Tell me more about the technical challenges"]
        }}
        """
        return await self._evaluate_with_fallback(prompt, "answer_evaluation")

    async def evaluate_coding_answer(
        self,
        problem: Dict[str, Any],
        code: str,
        test_results: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Evaluate a coding solution."""
        prompt = f"""
        Evaluate this coding solution:
        
        Problem: {problem.get('question_text', '')}
        Expected Complexity: Time {problem.get('expected_time_complexity')} Space {problem.get('expected_space_complexity')}
        
        Code:
        {code}
        
        Test Results:
        {json.dumps(test_results)}
        
        Return a VALID JSON object (no code blocks):
        {{
            "overall_score": 80,
            "correctness": 90,
            "efficiency": 75,
            "code_quality": 85,
            "readability": 80,
            "edge_case_handling": 70,
            "strengths": ["Correct logic", "Good variable names"],
            "weaknesses": ["Could optimize space", "Missing edge case"],
            "missing_concepts": ["Dynamic programming"],
            "time_complexity_actual": "O(n^2)",
            "space_complexity_actual": "O(n)",
            "passed_tests": 8,
            "total_tests": 10,
            "improvements": [
                "Use a hash map to reduce time complexity",
                "Handle null/empty inputs"
            ],
            "optimal_solution": "Here's the optimal approach: ...",
            "follow_up": "Can you solve this in O(n) time?"
        }}
        """
        return await self._evaluate_with_fallback(prompt, "coding_evaluation")

    async def _generate_with_fallback(
        self,
        prompt: str,
        question_type: str,
    ) -> Dict[str, Any]:
        """Generate question with fallback data."""
        try:
            response = await self.openai.generate_text(prompt)
            # Clean JSON response (remove markdown code blocks if present)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            data = json.loads(response)
            return data
        except Exception as e:
            print(f"Error generating {question_type}: {e}")
            return self._get_fallback_question(question_type)

    async def _evaluate_with_fallback(
        self,
        prompt: str,
        eval_type: str,
    ) -> Dict[str, Any]:
        """Evaluate with fallback data."""
        try:
            response = await self.openai.generate_text(prompt)
            # Clean JSON response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            data = json.loads(response)
            return data
        except Exception as e:
            print(f"Error evaluating {eval_type}: {e}")
            return self._get_fallback_evaluation()

    @staticmethod
    def _get_fallback_question(question_type: str) -> Dict[str, Any]:
        """Return fallback question data."""
        fallbacks = {
            "behavioral": {
                "question_text": "Tell me about a time when you had to overcome a significant challenge at work.",
                "why_asked": "Tests problem-solving skills and resilience",
                "expected_traits": ["problem_solving", "resilience", "communication"],
                "follow_up_questions": ["What did you learn?", "How did you apply that learning?"],
                "ai_hints": ["Use STAR method", "Show impact", "Quantify results"],
                "ideal_answer": "Structure your answer using STAR: Situation, Task, Action, Result",
            },
            "technical": {
                "question_text": "Explain the difference between SQL and NoSQL databases.",
                "why_asked": "Tests fundamental database knowledge",
                "expected_traits": ["technical_knowledge", "clarity", "critical_thinking"],
                "follow_up_questions": ["When would you use each?", "What are tradeoffs?"],
                "ai_hints": ["Consider ACID properties", "Think about scalability", "Discuss consistency"],
                "ideal_answer": "SQL provides ACID guarantees with fixed schema; NoSQL offers flexibility and horizontal scaling",
            },
            "coding": {
                "question_text": "Write a function to find the two sum of an array.",
                "description": "Given an array of integers and a target sum, find two numbers that add up to the target.",
                "constraints": ["Array length: 2 <= n <= 10^4", "Values: -10^9 <= val <= 10^9"],
                "examples": [
                    {"input": "[2,7,11,15], target=9", "output": "[0,1]", "explanation": "2+7=9"}
                ],
                "expected_time_complexity": "O(n)",
                "expected_space_complexity": "O(n)",
                "ai_hints": ["Use a hash map", "Single pass solution", "O(n) is possible"],
                "follow_up_questions": ["Can you do it with less space?"],
                "ideal_answer": "Use a hash map to track seen numbers",
            },
            "system_design": {
                "question_text": "Design a URL shortener like bit.ly",
                "why_asked": "Tests system design and scalability thinking",
                "expected_traits": ["scalability", "design_patterns", "problem_solving"],
                "follow_up_questions": ["How to handle 1M URLs daily?", "Database design?"],
                "ai_hints": ["Consider distributed systems", "Think about consistency", "Database sharding"],
                "ideal_answer": "Design with: API layer, encoding service, database (short_url -> long_url), caching layer",
            },
            "mcq": {
                "question_text": "What is the time complexity of binary search?",
                "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
                "correct_option": 2,
                "explanation": "Binary search divides the problem in half each time, resulting in O(log n)",
                "topic": "algorithms",
                "concepts": ["binary_search", "logarithmic_time"],
            },
        }
        return fallbacks.get(question_type, {})

    @staticmethod
    def _get_fallback_evaluation() -> Dict[str, Any]:
        """Return fallback evaluation data."""
        return {
            "overall_score": 75,
            "communication": 80,
            "technical_depth": 70,
            "confidence": 75,
            "problem_solving": 70,
            "leadership": 65,
            "clarity": 80,
            "correctness": 75,
            "star_format_adherence": 75,
            "strengths": ["Clear structure", "Good communication"],
            "weaknesses": ["Could add more specific examples"],
            "missing_concepts": ["Quantified metrics"],
            "improvements": ["Add specific numbers and metrics", "Include learnings"],
            "ideal_answer_full": "A stronger answer would include: specific metrics, timeframe, impact",
            "rewritten_answer": "Rephrase your answer with: specific numbers, measurable impact, clear outcome",
            "follow_up_questions": ["Can you give a specific metric?"],
        }
