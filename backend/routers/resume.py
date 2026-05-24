"""Resume upload and analysis router."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.services.resume_parser import parse_resume, extract_skills, extract_text
from backend.services.ats_engine import compute_generic_ats_score, compute_jd_ats_score
from backend.services.interview_generator import generate_interview_questions
from backend.services.rag_pipeline import _get_llm

router = APIRouter(prefix="/api", tags=["Resume"])


class ResumeImprovementRequest(BaseModel):
    resume_text: str
    focus_area: Optional[str] = None  # "skills", "achievements", "formatting", etc.


class SalaryExpectationsRequest(BaseModel):
    resume_text: str
    job_title: Optional[str] = None
    experience_years: Optional[int] = None
    location: Optional[str] = None


@router.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload a resume (PDF/DOCX) and get structured analysis + generic ATS score."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    ext = file.filename.lower().rsplit(".", 1)[-1] if "." in file.filename else ""
    if ext not in ("pdf", "docx", "doc", "txt"):
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    try:
        parsed = parse_resume(contents, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {str(e)}")

    ats_result = compute_generic_ats_score(parsed["raw_text"], parsed["skills"])

    return {
        "filename": file.filename,
        "parsed": {
            "skills": parsed["skills"],
            "experience_years": parsed["experience_years"],
            "education": parsed["education"],
            "projects": parsed["projects"],
            "summary": parsed["summary"],
            "sections": list(parsed["sections"].keys()),
        },
        "ats": ats_result,
        "raw_text": parsed["raw_text"],
    }


@router.post("/analyze_resume")
async def analyze_resume(file: UploadFile = File(...)):
    """Deep analysis of a resume with interview questions."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    contents = await file.read()
    parsed = parse_resume(contents, file.filename)
    ats_result = compute_generic_ats_score(parsed["raw_text"], parsed["skills"])
    interview_qs = generate_interview_questions(
        resume_text=parsed["raw_text"],
        skills=parsed["skills"],
    )

    return {
        "filename": file.filename,
        "parsed": {
            "skills": parsed["skills"],
            "experience_years": parsed["experience_years"],
            "education": parsed["education"],
            "projects": parsed["projects"],
            "summary": parsed["summary"],
        },
        "ats": ats_result,
        "interview_questions": interview_qs,
    }


@router.post("/improve_resume")
async def improve_resume(request: ResumeImprovementRequest):
    """Generate actionable improvements for a resume using AI."""
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required")

    focus = request.focus_area or "overall impact"
    
    prompt = f"""You are an expert resume coach. Analyze this resume and provide QUICK, HIGH-IMPACT improvements.

RESUME:
{request.resume_text[:2000]}

Focus area: {focus}

IMPORTANT: Be CONCISE. Provide exactly 5 improvements in this format:
1. [Specific improvement with example]
2. [Specific improvement with example]
3. [Specific improvement with example]
4. [Specific improvement with example]
5. [Specific improvement with example]

Keep each improvement to 1-2 lines. No lengthy explanations."""

    try:
        llm = _get_llm()
        if not llm:
            raise HTTPException(status_code=503, detail="AI service unavailable. Please try again later.")
        response = llm.invoke(prompt)
        if not response or not response.content:
            raise HTTPException(status_code=500, detail="AI returned empty response. Please try again.")
        return {
            "improvements": response.content,
            "focus_area": focus
        }
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f"Resume improvement failed: {str(e)[:100]}"
        raise HTTPException(status_code=500, detail=error_detail)


@router.post("/salary_expectations")
async def salary_expectations(request: SalaryExpectationsRequest):
    """Generate realistic salary expectations based on resume profile."""
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required")

    job_context = ""
    if request.job_title:
        job_context += f"Role: {request.job_title}\n"
    if request.experience_years:
        job_context += f"Experience: {request.experience_years} years\n"
    if request.location:
        job_context += f"Location: {request.location}\n"

    prompt = f"""Based on this professional profile, provide realistic salary expectations.

{job_context}

RESUME (summary):
{request.resume_text[:1500]}

IMPORTANT: Be CONCISE and SPECIFIC. Provide:
1. Entry-level range (if applicable)
2. Mid-level range (if applicable)
3. Senior range (if applicable)
4. Key salary drivers (2-3 most important)
5. One negotiation tip

Keep response to 8-10 lines maximum. No lengthy discussions."""

    try:
        llm = _get_llm()
        if not llm:
            raise HTTPException(status_code=503, detail="AI service unavailable. Please try again later.")
        response = llm.invoke(prompt)
        if not response or not response.content:
            raise HTTPException(status_code=500, detail="AI returned empty response. Please try again.")
        return {
            "salary_guidance": response.content,
            "job_context": request.job_title or "General Tech"
        }
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f"Salary expectations failed: {str(e)[:100]}"
        raise HTTPException(status_code=500, detail=error_detail)


@router.post("/match_with_jd_file")
async def match_with_jd_file(
    resume: UploadFile = File(...),
    jd_file: UploadFile = File(...),
):
    """Match resume against a JD file with detailed analysis."""
    if not resume.filename:
        raise HTTPException(status_code=400, detail="Resume file required")
    if not jd_file.filename:
        raise HTTPException(status_code=400, detail="Job description file required")

    # Parse resume
    try:
        resume_bytes = await resume.read()
        parsed = parse_resume(resume_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {str(e)}")

    # Extract JD text
    try:
        jd_bytes = await jd_file.read()
        job_description = extract_text(jd_bytes, jd_file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read job description: {str(e)}")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is empty")

    # Compute matching
    try:
        if not parsed["raw_text"].strip():
            raise HTTPException(status_code=400, detail="Resume content is empty")
        
        result = compute_jd_ats_score(
            resume_text=parsed["raw_text"],
            resume_skills=parsed["skills"],
            resume_experience_years=parsed["experience_years"],
            jd_text=job_description,
        )
        
        if not result:
            raise HTTPException(status_code=500, detail="Could not compute match score")
        
        return {
            "match_percentage": result.get("ats_score", 0),
            "match_level": result.get("match_level", "low"),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "suggestions": result.get("suggestions", []),
            "resume_file": resume.filename,
            "jd_file": jd_file.filename,
        }
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f"Matching failed: {str(e)[:100]}"
        raise HTTPException(status_code=500, detail=error_detail)
