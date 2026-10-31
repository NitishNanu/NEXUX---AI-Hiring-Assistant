"""ATS scoring and job matching router."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from backend.exceptions import (
    EmptyFileError,
    FileTooLargeError,
    UnsupportedFileTypeError,
    ParseError,
)
from backend.logger import get_logger
from backend.services.resume_parser import parse_resume, extract_text
from backend.services.ats_engine import compute_jd_ats_score, compute_generic_ats_score

router = APIRouter(prefix="/api", tags=["ATS Scoring"])
log = get_logger(__name__)

_ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}
_MAX_BYTES = 10 * 1024 * 1024  # 10 MB


def _validate_upload(filename: str, content: bytes) -> None:
    """Raise typed exceptions for invalid uploads."""
    if not content:
        raise EmptyFileError()
    if len(content) > _MAX_BYTES:
        raise FileTooLargeError(f"File too large ({len(content)//1024} KB). Max 10 MB.")
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in _ALLOWED_EXTENSIONS:
        raise UnsupportedFileTypeError(
            f"Unsupported file type '.{ext}'. Allowed: {sorted(_ALLOWED_EXTENSIONS)}"
        )


@router.post("/ats_score")
async def ats_score(
    resume: UploadFile = File(...),
    jd_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None),
):
    """Compute ATS score for a resume against a job description.

    Provide either `jd_file` (PDF/DOCX) or `jd_text` (plain text).
    When no JD is provided, a generic ATS score is returned.
    """
    resume_bytes = await resume.read()
    _validate_upload(resume.filename or "resume.pdf", resume_bytes)

    try:
        parsed = parse_resume(resume_bytes, resume.filename or "resume.pdf")
    except Exception as exc:
        raise ParseError(f"Could not parse resume: {exc}")

    # Get JD text
    job_description = ""
    if jd_file and jd_file.filename:
        jd_bytes = await jd_file.read()
        _validate_upload(jd_file.filename, jd_bytes)
        job_description = extract_text(jd_bytes, jd_file.filename)
    elif jd_text:
        job_description = jd_text

    if not job_description.strip():
        ats = compute_generic_ats_score(parsed["raw_text"], parsed["skills"])
        log.info("Generic ATS computed", ats_score=ats.get("ats_score"))
        return {
            "mode": "generic",
            "ats": ats,
            "resume_skills": parsed["skills"],
        }

    result = compute_jd_ats_score(
        resume_text=parsed["raw_text"],
        resume_skills=parsed["skills"],
        resume_experience_years=parsed["experience_years"],
        jd_text=job_description,
    )
    log.info("JD ATS computed", ats_score=result.get("ats_score"))
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
    _validate_upload(resume.filename or "resume.pdf", resume_bytes)

    try:
        parsed = parse_resume(resume_bytes, resume.filename or "resume.pdf")
    except Exception as exc:
        raise ParseError(f"Could not parse resume: {exc}")

    job_description = ""
    if jd_file and jd_file.filename:
        jd_bytes = await jd_file.read()
        _validate_upload(jd_file.filename, jd_bytes)
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
