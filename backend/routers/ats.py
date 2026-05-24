"""ATS scoring and job matching router."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from backend.services.resume_parser import parse_resume, extract_text
from backend.services.ats_engine import compute_jd_ats_score, compute_generic_ats_score

router = APIRouter(prefix="/api", tags=["ATS Scoring"])


@router.post("/ats_score")
async def ats_score(
    resume: UploadFile = File(...),
    jd_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None),
):
    """Compute ATS score for a resume against a job description.

    Provide either `jd_file` (PDF/DOCX) or `jd_text` (plain text).
    """
    # Parse resume
    resume_bytes = await resume.read()
    parsed = parse_resume(resume_bytes, resume.filename or "resume.pdf")

    # Get JD text
    job_description = ""
    if jd_file and jd_file.filename:
        jd_bytes = await jd_file.read()
        job_description = extract_text(jd_bytes, jd_file.filename)
    elif jd_text:
        job_description = jd_text

    if not job_description.strip():
        # Return generic ATS if no JD
        ats = compute_generic_ats_score(parsed["raw_text"], parsed["skills"])
        return {
            "mode": "generic",
            "ats": ats,
            "resume_skills": parsed["skills"],
        }

    # JD-specific scoring
    result = compute_jd_ats_score(
        resume_text=parsed["raw_text"],
        resume_skills=parsed["skills"],
        resume_experience_years=parsed["experience_years"],
        jd_text=job_description,
    )

    return {
        "mode": "jd_specific",
        "ats": result,
        "resume_skills": parsed["skills"],
        "resume_experience_years": parsed["experience_years"],
    }


@router.post("/job_match")
async def job_match(
    resume: UploadFile = File(...),
    jd_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None),
):
    """Quick job match summary — returns match percentage and key gaps."""
    resume_bytes = await resume.read()
    parsed = parse_resume(resume_bytes, resume.filename or "resume.pdf")

    job_description = ""
    if jd_file and jd_file.filename:
        jd_bytes = await jd_file.read()
        job_description = extract_text(jd_bytes, jd_file.filename)
    elif jd_text:
        job_description = jd_text

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required for matching.")

    result = compute_jd_ats_score(
        resume_text=parsed["raw_text"],
        resume_skills=parsed["skills"],
        resume_experience_years=parsed["experience_years"],
        jd_text=job_description,
    )

    return {
        "match_percentage": result["ats_score"],
        "match_level": result["match_level"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "suggestions": result["suggestions"],
    }
