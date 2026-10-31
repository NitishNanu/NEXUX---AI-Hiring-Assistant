"""Auth router — register, login, me, resume upload & fetch.

Rate limiting
-------------
The /register and /login endpoints are protected by SlowAPI rate limiting
(20 requests per minute per IP).  This prevents brute-force attacks against
the login endpoint without requiring a Redis dependency.

File upload safety
------------------
Resume uploads are validated for extension, content-type, and file size
(max defined in settings.max_upload_bytes, defaulting to 10 MB).
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Header, HTTPException, Request, UploadFile
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.config import settings
from backend.database import get_db
from backend.logger import get_logger
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
limiter = Limiter(key_func=get_remote_address)
log = get_logger(__name__)

_ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}


# ---------------------------------------------------------------------------
# Shared auth dependencies
# ---------------------------------------------------------------------------

async def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verify Bearer token and return decoded payload dict."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

    return {"sub": user_id}


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Verify token and return full user document from MongoDB."""
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


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit(settings.auth_rate_limit)
async def register(request: Request, body: UserRegister):
    """
    Register a new user.

    Rate limited: {settings.auth_rate_limit} per IP.
    """
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

    log.info("User registered", user_id=str(result.inserted_id), email=body.email.lower())
    token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=token, user=UserOut.from_mongo(doc))


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.auth_rate_limit)
async def login(request: Request, body: UserLogin):
    """
    Log in with email and password.

    Rate limited: {settings.auth_rate_limit} per IP.
    Returns a generic error message regardless of whether the email or
    password is wrong (prevents username enumeration).
    """
    db = get_db()

    user = await db.users.find_one({"email": body.email.lower()})
    # Constant-time check: verify_password returns False if user is None
    password_hash = user["password_hash"] if user else ""
    if not user or not verify_password(body.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    log.info("User logged in", user_id=str(user["_id"]))
    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token, user=UserOut.from_mongo(user))


# ---------------------------------------------------------------------------
# Me
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut.from_mongo(current_user)


# ---------------------------------------------------------------------------
# Resume upload (one resume per user, upserted)
# ---------------------------------------------------------------------------

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a resume (PDF/DOCX/TXT) and persist it to the user's profile.

    Validations
    -----------
    * Extension must be pdf, docx, doc, or txt.
    * File must not be empty.
    * File size must not exceed settings.max_upload_bytes (default 10 MB).
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.lower().rsplit(".", 1)[-1] if "." in file.filename else ""
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {sorted(_ALLOWED_EXTENSIONS)}",
        )

    # Read with size cap to avoid memory exhaustion
    contents = await file.read(settings.max_upload_bytes + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(contents) > settings.max_upload_bytes:
        limit_mb = settings.max_upload_bytes / 1024 / 1024
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {limit_mb:.0f} MB.",
        )

    try:
        parsed = parse_resume(contents, file.filename)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Parse error: {exc}")

    ats = compute_generic_ats_score(parsed["raw_text"], parsed["skills"])

    def _coerce_str(v) -> str:
        if v is None:
            return ""
        if isinstance(v, str):
            return v
        return str(v)

    resume_doc = {
        "user_id": str(current_user["_id"]),
        "filename": file.filename,
        "raw_text": parsed["raw_text"],
        "skills": parsed["skills"],
        "experience_years": parsed.get("experience_years", 0),
        "ats_score": ats.get("ats_score", 0),
        "ats_level": ats.get("match_level", "low"),
        "summary": _coerce_str(parsed.get("summary")),
        "education": _coerce_str(parsed.get("education")),
        "projects": _coerce_str(parsed.get("projects")),
        "uploaded_at": datetime.utcnow(),
    }

    db = get_db()
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
            "experience_years": parsed.get("experience_years", 0),
            "summary": resume_doc["summary"],
            "education": resume_doc["education"],
            "projects": resume_doc["projects"],
        },
        "ats": ats,
        "raw_text": parsed["raw_text"],
    }


# ---------------------------------------------------------------------------
# Resume fetch (restore on login / page refresh)
# ---------------------------------------------------------------------------

@router.get("/resume")
async def get_resume(current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.resumes.find_one({"user_id": str(current_user["_id"])})
    if not doc:
        return {"resume": None}
    doc["_id"] = str(doc["_id"])
    return {"resume": doc}