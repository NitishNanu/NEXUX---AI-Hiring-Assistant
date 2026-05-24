"""Auth router — register, login, me, resume upload & fetch."""

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile

from backend.database import get_db
from backend.models.user import (
    ResumeOut,
    TokenResponse,
    UserLogin,
    UserOut,
    UserRegister,
)
from backend.services.auth_service import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from backend.services.ats_engine import compute_generic_ats_score
from backend.services.resume_parser import parse_resume

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ── Token verification dependency ──────────────────────────────────────

async def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verify token and return decoded payload."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalid or expired")
    
    return {"sub": user_id}


# ── Auth dependency ───────────────────────────────────────────────────

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=401, detail="Token payload invalid")

    db = get_db()
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ── Register ─────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: UserRegister):
    db = get_db()

    if await db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=token, user=UserOut.from_mongo(doc))


# ── Login ─────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    db = get_db()

    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token, user=UserOut.from_mongo(user))


# ── Me ────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut.from_mongo(current_user)


# ── Resume upload (save / overwrite per user) ─────────────────────────

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.lower().rsplit(".", 1)[-1] if "." in file.filename else ""
    if ext not in ("pdf", "docx", "doc", "txt"):
        raise HTTPException(
            status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT."
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        parsed = parse_resume(contents, file.filename)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Parse error: {exc}")

    ats = compute_generic_ats_score(parsed["raw_text"], parsed["skills"])

    # education and projects come back as strings from parse_resume
    education = parsed.get("education", "")
    if isinstance(education, dict):
        education = str(education)

    projects = parsed.get("projects", "")
    if isinstance(projects, dict):
        projects = str(projects)

    summary = parsed.get("summary", "")
    if isinstance(summary, dict):
        summary = str(summary)

    resume_doc = {
        "user_id": str(current_user["_id"]),
        "filename": file.filename,
        "raw_text": parsed["raw_text"],
        "skills": parsed["skills"],
        "experience_years": parsed["experience_years"],
        "ats_score": ats["ats_score"],
        "ats_level": ats["match_level"],
        "summary": summary,
        "education": education,
        "projects": projects,
        "uploaded_at": datetime.utcnow(),
    }

    db = get_db()
    # upsert — one resume per user, always overwrite
    await db.resumes.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": resume_doc},
        upsert=True,
    )

    return {
        "message": "Resume saved",
        "filename": file.filename,
        "parsed": {
            "skills": parsed["skills"],
            "experience_years": parsed["experience_years"],
            "summary": summary,
            "education": education,
            "projects": projects,
        },
        "ats": ats,
        "raw_text": parsed["raw_text"],
    }


# ── Resume fetch (restore on login) ──────────────────────────────────

@router.get("/resume")
async def get_resume(current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.resumes.find_one({"user_id": str(current_user["_id"])})
    if not doc:
        return {"resume": None}
    doc["_id"] = str(doc["_id"])
    return {"resume": doc}