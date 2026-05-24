"""Interview repository for database operations."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from bson.objectid import ObjectId

from backend.database import get_db


class InterviewRepository:
    """Repository for interview-related database operations."""

    @staticmethod
    async def create_session(
        user_id: str,
        interview_type: str,
        selected_role: str,
    ) -> str:
        """Create a new interview session."""
        db = get_db()
        session = {
            "user_id": user_id,
            "interview_type": interview_type,
            "selected_role": selected_role,
            "status": "in_progress",
            "questions": [],
            "answers": [],
            "overall_score": 0,
            "completed_questions": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = await db.interview_sessions.insert_one(session)
        return str(result.inserted_id)

    @staticmethod
    async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
        """Get interview session by ID."""
        db = get_db()
        session = await db.interview_sessions.find_one(
            {"_id": ObjectId(session_id)}
        )
        if session:
            session["id"] = str(session["_id"])
        return session

    @staticmethod
    async def save_question(
        session_id: str,
        category: str,
        difficulty: str,
        question_text: str,
        why_asked: str,
        expected_traits: List[str],
        follow_up_questions: List[str],
        ai_hints: List[str],
        ideal_answer: str,
        description: Optional[str] = None,
        constraints: Optional[List[str]] = None,
        examples: Optional[List[Dict[str, Any]]] = None,
        expected_time_complexity: Optional[str] = None,
        expected_space_complexity: Optional[str] = None,
    ) -> str:
        """Save a question to the database."""
        db = get_db()
        question = {
            "session_id": session_id,
            "category": category,
            "difficulty": difficulty,
            "question_text": question_text,
            "why_asked": why_asked,
            "expected_traits": expected_traits,
            "follow_up_questions": follow_up_questions,
            "ai_hints": ai_hints,
            "ideal_answer": ideal_answer,
            "created_at": datetime.utcnow(),
        }
        if description is not None:
            question["description"] = description
        if constraints is not None:
            question["constraints"] = constraints
        if examples is not None:
            question["examples"] = examples
        if expected_time_complexity is not None:
            question["expected_time_complexity"] = expected_time_complexity
        if expected_space_complexity is not None:
            question["expected_space_complexity"] = expected_space_complexity

        result = await db.interview_questions.insert_one(question)
        return str(result.inserted_id)

    @staticmethod
    async def save_answer(
        session_id: str,
        question_id: str,
        user_id: str,
        answer_text: str,
        duration_seconds: int,
        score: float,
        feedback: str,
        strengths: List[str],
        improvements: List[str],
    ) -> str:
        """Save user's answer and evaluation."""
        db = get_db()
        answer = {
            "session_id": session_id,
            "question_id": question_id,
            "user_id": user_id,
            "answer_text": answer_text,
            "duration_seconds": duration_seconds,
            "score": score,
            "feedback": feedback,
            "strengths": strengths,
            "improvements": improvements,
            "created_at": datetime.utcnow(),
        }
        result = await db.interview_answers.insert_one(answer)
        return str(result.inserted_id)

    @staticmethod
    async def update_session_score(session_id: str, score: float) -> None:
        """Update interview session overall score."""
        db = get_db()
        await db.interview_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "overall_score": score,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

    @staticmethod
    async def complete_session(session_id: str) -> None:
        """Mark session as completed."""
        db = get_db()
        await db.interview_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "status": "completed",
                    "updated_at": datetime.utcnow(),
                }
            },
        )

    @staticmethod
    async def get_session_answers(session_id: str) -> List[Dict[str, Any]]:
        """Get all answers for a session."""
        db = get_db()
        answers = await db.interview_answers.find(
            {"session_id": session_id}
        ).to_list(None)
        return answers

    @staticmethod
    async def get_session_questions(session_id: str) -> List[Dict[str, Any]]:
        """Get all questions for a session."""
        db = get_db()
        questions = await db.interview_questions.find(
            {"session_id": session_id}
        ).to_list(None)
        return questions

    @staticmethod
    async def get_user_sessions(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's interview sessions."""
        db = get_db()
        sessions = (
            await db.interview_sessions.find(
                {"user_id": user_id}
            )
            .sort("created_at", -1)
            .limit(limit)
            .to_list(None)
        )
        return sessions

    @staticmethod
    async def calculate_analytics(session_id: str) -> Dict[str, Any]:
        """Calculate analytics for a session."""
        db = get_db()

        # Get all answers for session
        answers = await db.interview_answers.find(
            {"session_id": session_id}
        ).to_list(None)

        if not answers:
            return {
                "communication": 0,
                "technical_depth": 0,
                "confidence": 0,
                "problem_solving": 0,
                "leadership": 0,
                "system_design": 0,
                "coding": 0,
                "readiness_score": 0,
            }

        # Aggregate scores
        scores = {
            "communication": [],
            "technical_depth": [],
            "confidence": [],
            "problem_solving": [],
            "leadership": [],
            "system_design": [],
            "coding": [],
        }

        for answer in answers:
            score = answer.get("score", 0)
            # Distribute score across metrics based on question type
            if answer.get("question_id"):
                # Get question to determine category
                question = await db.interview_questions.find_one(
                    {"_id": ObjectId(answer["question_id"])}
                )
                if question:
                    category = question.get("category", "behavioral")
                    if category == "behavioral":
                        scores["communication"].append(score)
                        scores["confidence"].append(score)
                        scores["leadership"].append(score)
                    elif category == "technical":
                        scores["technical_depth"].append(score)
                        scores["problem_solving"].append(score)
                    elif category == "system_design":
                        scores["system_design"].append(score)
                        scores["problem_solving"].append(score)
                    elif category == "coding":
                        scores["coding"].append(score)
                        scores["problem_solving"].append(score)

        # Calculate averages
        analytics = {}
        for metric, values in scores.items():
            analytics[metric] = (
                sum(values) / len(values) if values else 0
            )

        # Calculate overall readiness
        all_scores = [s for scores_list in scores.values() for s in scores_list]
        readiness = (
            sum(all_scores) / len(all_scores) if all_scores else 0
        )

        analytics["readiness_score"] = readiness
        return analytics

    @staticmethod
    async def save_resume_intelligence(
        user_id: str,
        ats_score: float,
        resume_strength: float,
        interview_readiness: float,
        missing_skills: List[str],
        recommended_role: str,
    ) -> None:
        """Save resume intelligence scores."""
        db = get_db()
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "resume_intelligence": {
                        "ats_score": ats_score,
                        "resume_strength": resume_strength,
                        "interview_readiness": interview_readiness,
                        "missing_skills": missing_skills,
                        "recommended_role": recommended_role,
                        "updated_at": datetime.utcnow(),
                    }
                }
            },
        )

    @staticmethod
    async def get_resume_intelligence(user_id: str) -> Dict[str, Any]:
        """Get user's resume intelligence scores."""
        db = get_db()
        user = await db.users.find_one(
            {"_id": ObjectId(user_id)}
        )
        if user and "resume_intelligence" in user:
            return user["resume_intelligence"]
        return {
            "ats_score": 0,
            "resume_strength": 0,
            "interview_readiness": 0,
            "missing_skills": [],
            "recommended_role": "Software Engineer",
        }
