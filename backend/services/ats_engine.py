"""ATS Scoring Engine — computes weighted ATS scores for resumes against job descriptions."""

import re
from collections import Counter
from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from .resume_parser import extract_skills, extract_experience_years, TECH_SKILLS


# ── Weight distribution ──────────────────────────────────────────────
WEIGHTS = {
    "skill_match": 0.40,
    "keyword_match": 0.30,
    "experience_match": 0.20,
    "semantic_similarity": 0.10,
}


def _extract_jd_required_skills(jd_text: str) -> list[str]:
    """Extract skills that appear in the JD."""
    return extract_skills(jd_text)


def _extract_jd_experience(jd_text: str) -> int:
    """Extract required experience from JD."""
    return extract_experience_years(jd_text)


def _skill_match_score(resume_skills: list[str], jd_skills: list[str]) -> tuple[float, list[str], list[str]]:
    """Compute skill overlap score.  Returns (score, matched, missing)."""
    if not jd_skills:
        return 1.0, resume_skills, []

    resume_set = {s.lower() for s in resume_skills}
    jd_set = {s.lower() for s in jd_skills}
    matched = sorted(resume_set & jd_set)
    missing = sorted(jd_set - resume_set)

    score = len(matched) / len(jd_set) if jd_set else 1.0
    return min(score, 1.0), matched, missing


def _keyword_match_score(resume_text: str, jd_text: str) -> float:
    """Keyword frequency overlap between resume and JD using TF-IDF."""
    if not jd_text.strip() or not resume_text.strip():
        return 0.0

    # Extract important keywords from JD (nouns/terms that appear often)
    jd_words = re.findall(r"\b[a-zA-Z]{3,}\b", jd_text.lower())
    resume_words = re.findall(r"\b[a-zA-Z]{3,}\b", resume_text.lower())

    # Filter stop words
    stop_words = {
        "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
        "was", "one", "our", "out", "has", "have", "had", "this", "that", "with",
        "will", "from", "they", "been", "said", "each", "which", "their", "time",
        "would", "there", "about", "other", "were", "into", "more", "some",
        "than", "its", "over", "such", "also", "back", "should", "could",
        "must", "ability", "strong", "work", "working", "experience", "required",
        "preferred", "including", "etc", "role", "position", "job", "team",
    }

    jd_counter = Counter(w for w in jd_words if w not in stop_words)
    resume_counter = Counter(w for w in resume_words if w not in stop_words)

    if not jd_counter:
        return 0.0

    top_jd_keywords = {kw for kw, _ in jd_counter.most_common(30)}
    resume_keyword_set = set(resume_counter.keys())

    overlap = top_jd_keywords & resume_keyword_set
    return len(overlap) / len(top_jd_keywords) if top_jd_keywords else 0.0


def _experience_match_score(resume_years: int, jd_years: int) -> float:
    """Score experience fit."""
    if jd_years == 0:
        return 1.0
    if resume_years >= jd_years:
        return 1.0
    return resume_years / jd_years


def _semantic_similarity_score(resume_text: str, jd_text: str) -> float:
    """TF-IDF cosine similarity between resume and JD."""
    if not resume_text.strip() or not jd_text.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
        tfidf = vectorizer.fit_transform([resume_text, jd_text])
        sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return float(sim)
    except Exception:
        return 0.0


def _match_level(score: float) -> str:
    if score >= 75:
        return "High"
    elif score >= 50:
        return "Medium"
    else:
        return "Low"


def compute_generic_ats_score(resume_text: str, skills: list[str]) -> dict:
    """Compute a generic ATS score (no JD) based on resume quality heuristics."""
    score = 0.0
    feedback: list[str] = []

    # --- Length check ---
    word_count = len(resume_text.split())
    if word_count < 100:
        feedback.append("Resume is very short. Add more detail about experience and projects.")
    elif word_count < 300:
        score += 10
        feedback.append("Resume could use more detail. Aim for 400-800 words.")
    elif word_count <= 1000:
        score += 20
        feedback.append("Good resume length.")
    else:
        score += 15
        feedback.append("Resume may be too long. Keep it concise (1-2 pages).")

    # --- Skills ---
    if len(skills) >= 10:
        score += 25
    elif len(skills) >= 5:
        score += 15
        feedback.append("Add more relevant technical skills.")
    else:
        score += 5
        feedback.append("Very few technical skills detected. List your technologies.")

    # --- Sections check ---
    has_experience = bool(re.search(r"(?i)experience|employment", resume_text))
    has_education = bool(re.search(r"(?i)education|degree|university", resume_text))
    has_projects = bool(re.search(r"(?i)projects?", resume_text))

    if has_experience:
        score += 15
    else:
        feedback.append("No experience section found. Add work experience.")
    if has_education:
        score += 10
    else:
        feedback.append("No education section found.")
    if has_projects:
        score += 10
    else:
        feedback.append("Consider adding a projects section.")

    # --- Action verbs ---
    action_verbs = [
        "developed", "managed", "designed", "implemented", "led", "built",
        "created", "improved", "optimized", "deployed", "architected",
        "analyzed", "delivered", "coordinated", "mentored",
    ]
    found_verbs = [v for v in action_verbs if v in resume_text.lower()]
    if len(found_verbs) >= 5:
        score += 15
    elif len(found_verbs) >= 2:
        score += 8
        feedback.append("Use more action verbs (developed, implemented, managed, etc.).")
    else:
        feedback.append("Use strong action verbs to describe your achievements.")

    # --- Quantifiable results ---
    if re.search(r"\d+%|\$\d+|\d+\s*(users|clients|projects|team)", resume_text):
        score += 5
    else:
        feedback.append("Add quantifiable achievements (e.g., 'increased sales by 30%').")

    score = min(round(score), 100)

    return {
        "ats_score": score,
        "match_level": _match_level(score),
        "feedback": feedback,
        "word_count": word_count,
        "skills_found": len(skills),
    }


def compute_jd_ats_score(
    resume_text: str,
    resume_skills: list[str],
    resume_experience_years: int,
    jd_text: str,
) -> dict:
    """Compute a JD-specific ATS score with the weighted formula."""

    jd_skills = _extract_jd_required_skills(jd_text)
    jd_experience = _extract_jd_experience(jd_text)

    # Components
    skill_score, matched_skills, missing_skills = _skill_match_score(resume_skills, jd_skills)
    keyword_score = _keyword_match_score(resume_text, jd_text)
    experience_score = _experience_match_score(resume_experience_years, jd_experience)
    semantic_score = _semantic_similarity_score(resume_text, jd_text)

    # Weighted composite
    composite = (
        WEIGHTS["skill_match"] * skill_score
        + WEIGHTS["keyword_match"] * keyword_score
        + WEIGHTS["experience_match"] * experience_score
        + WEIGHTS["semantic_similarity"] * semantic_score
    )
    ats_percent = round(composite * 100, 1)

    # Suggestions
    suggestions: list[str] = []
    if missing_skills:
        suggestions.append(f"Add these missing skills to your resume: {', '.join(missing_skills[:10])}")
    if keyword_score < 0.5:
        suggestions.append("Mirror more keywords from the job description in your resume.")
    if experience_score < 1.0:
        suggestions.append(
            f"The JD requires ~{jd_experience} years experience. Highlight relevant experience."
        )
    if semantic_score < 0.3:
        suggestions.append("Your resume content is not closely aligned with the JD. Tailor it more.")

    return {
        "ats_score": ats_percent,
        "match_level": _match_level(ats_percent),
        "breakdown": {
            "skill_match": round(skill_score * 100, 1),
            "keyword_match": round(keyword_score * 100, 1),
            "experience_match": round(experience_score * 100, 1),
            "semantic_similarity": round(semantic_score * 100, 1),
        },
        "weights": WEIGHTS,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "jd_required_skills": jd_skills,
        "jd_required_experience": jd_experience,
    }
