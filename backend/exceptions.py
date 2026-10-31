"""
Custom exception hierarchy for NEXUS.

All domain exceptions inherit from NexusError so they can be caught
at a single place in the global exception handler registered in main.py.
"""

from __future__ import annotations


class NexusError(Exception):
    """Base exception for all NEXUS domain errors."""

    status_code: int = 500
    default_detail: str = "An internal error occurred."

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.default_detail
        super().__init__(self.detail)


# ---------------------------------------------------------------------------
# 400 — Bad Request
# ---------------------------------------------------------------------------


class InvalidInputError(NexusError):
    """Raised when request input fails domain validation."""

    status_code = 400
    default_detail = "Invalid input provided."


class EmptyFileError(NexusError):
    """Raised when an uploaded file is empty."""

    status_code = 400
    default_detail = "The uploaded file is empty."


class UnsupportedFileTypeError(NexusError):
    """Raised when an uploaded file has an unsupported extension."""

    status_code = 400
    default_detail = "Unsupported file type."


# ---------------------------------------------------------------------------
# 401 — Unauthorized
# ---------------------------------------------------------------------------


class UnauthorizedError(NexusError):
    """Raised when a request is not authenticated."""

    status_code = 401
    default_detail = "Not authenticated."


class TokenInvalidError(NexusError):
    """Raised when a JWT token is missing, malformed, or expired."""

    status_code = 401
    default_detail = "Token invalid or expired."


# ---------------------------------------------------------------------------
# 403 — Forbidden
# ---------------------------------------------------------------------------


class ForbiddenError(NexusError):
    """Raised when a user accesses a resource they do not own."""

    status_code = 403
    default_detail = "Access forbidden."


# ---------------------------------------------------------------------------
# 404 — Not Found
# ---------------------------------------------------------------------------


class NotFoundError(NexusError):
    """Raised when a requested resource does not exist."""

    status_code = 404
    default_detail = "Resource not found."


class SessionNotFoundError(NotFoundError):
    """Interview session not found or not owned by this user."""

    default_detail = "Interview session not found."


class QuestionNotFoundError(NotFoundError):
    """Interview question not found."""

    default_detail = "Question not found."


class ProblemNotFoundError(NotFoundError):
    """Coding problem not found."""

    default_detail = "Coding problem not found."


class ResumeNotFoundError(NotFoundError):
    """User resume not found."""

    default_detail = "Resume not found."


# ---------------------------------------------------------------------------
# 413 — Payload Too Large
# ---------------------------------------------------------------------------


class FileTooLargeError(NexusError):
    """Raised when an uploaded file exceeds the size limit."""

    status_code = 413
    default_detail = "File too large."


# ---------------------------------------------------------------------------
# 422 — Unprocessable Entity
# ---------------------------------------------------------------------------


class ParseError(NexusError):
    """Raised when a file cannot be parsed."""

    status_code = 422
    default_detail = "Failed to parse the uploaded file."


# ---------------------------------------------------------------------------
# 503 — Service Unavailable
# ---------------------------------------------------------------------------


class LLMUnavailableError(NexusError):
    """Raised when no LLM provider is configured or reachable."""

    status_code = 503
    default_detail = "AI service is currently unavailable. Please try again later."
