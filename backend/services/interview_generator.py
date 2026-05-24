"""Interview Question Generator — creates role-specific questions from resume + JD context."""


INTERVIEW_PROMPT = """You are a Senior HR Interviewer preparing interview questions.

Based on the candidate's resume and job description, generate {num_questions} concise interview questions.

Candidate Resume:
{resume_text}

Job Description:
{jd_text}

Generate questions in these categories:
1. Technical Questions (based on skills and job requirements)
2. Behavioral Questions (using STAR method)
3. Situational Questions (role-relevant scenarios)
4. Culture Fit Questions (team dynamics)

IMPORTANT: Keep each question SHORT and DIRECT. No lengthy explanations.

Format:
- Question: [one line question only]
- Category: [Technical/Behavioral/Situational/Culture Fit]
- Why it matters: [one line explanation]

Generate {num_questions} questions total."""


def generate_interview_questions(
    resume_text: str,
    jd_text: str = "",
    num_questions: int = 10,
    skills: list[str] | None = None,
) -> dict:
    """Generate interview questions. Uses LLM if available, otherwise rule-based."""

    # Rule-based fallback questions (always available)
    rule_based = _generate_rule_based(resume_text, jd_text, skills or [])

    # Try LLM-powered generation
    try:
        from backend.services.rag_pipeline import _get_llm

        llm = _get_llm()
        prompt = INTERVIEW_PROMPT.format(
            resume_text=resume_text[:2000],
            jd_text=jd_text[:1500] if jd_text else "No specific job description provided.",
            num_questions=min(num_questions, 8),
        )
        response = llm.invoke(prompt)
        llm_answer = response.content if hasattr(response, "content") else str(response)

        return {
            "questions": llm_answer,
            "rule_based_questions": rule_based,
            "source": "llm",
            "count": num_questions,
        }
    except Exception:
        return {
            "questions": _format_rule_based(rule_based),
            "rule_based_questions": rule_based,
            "source": "rule_based",
            "count": len(rule_based),
        }


def _generate_rule_based(resume_text: str, jd_text: str, skills: list[str]) -> list[dict]:
    """Generate rule-based interview questions (concise version)."""
    questions = []

    # Technical questions based on skills
    if skills:
        for skill in skills[:3]:
            questions.append({
                "question": f"Tell us about your experience with {skill}.",
                "category": "Technical",
                "assesses": f"Practical knowledge of {skill}",
            })

    # Behavioral questions
    behavioral = [
        {
            "question": "Describe a time you worked on a challenging technical project. What was your role?",
            "category": "Behavioral",
            "assesses": "Problem-solving and ownership",
        },
        {
            "question": "How do you approach learning a new technology or framework?",
            "category": "Behavioral",
            "assesses": "Learning agility and self-motivation",
        },
        {
            "question": "Tell us about a time you had to work with unclear requirements. How did you handle it?",
            "category": "Behavioral",
            "assesses": "Communication and adaptability",
        },
    ]
    questions.extend(behavioral[:3])

    # Situational questions
    situational = [
        {
            "question": "If a colleague disagreed with your technical approach, how would you handle it?",
            "category": "Situational",
            "assesses": "Teamwork and communication",
        },
        {
            "question": "How would you prioritize multiple bugs and feature requests?",
            "category": "Situational",
            "assesses": "Prioritization and project management",
        },
    ]
    questions.extend(situational[:2])

    return questions


def _format_rule_based(questions: list[dict]) -> str:
    """Format rule-based questions as concise readable text."""
    lines = []
    for i, q in enumerate(questions, 1):
        lines.append(f"{i}. {q['question']}")
        lines.append(f"   Category: {q['category']} | Assesses: {q['assesses']}")
        lines.append("")
    return "\n".join(lines)
