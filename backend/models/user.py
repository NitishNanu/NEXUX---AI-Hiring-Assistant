"""Pydantic schemas for users and resume storage."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict) -> "UserOut":
        return cls(
            id=str(doc["_id"]),
            name=doc["name"],
            email=doc["email"],
            created_at=doc.get("created_at", datetime.utcnow()),
        )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ResumeOut(BaseModel):
    """What the frontend receives after uploading / fetching a resume."""
    user_id: str
    filename: str
    raw_text: str
    skills: list[str]
    experience_years: int
    ats_score: float
    ats_level: str
    summary: str
    education: str
    projects: str
    uploaded_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict) -> "ResumeOut":
        doc = dict(doc)
        doc.pop("_id", None)
        return cls(**doc)