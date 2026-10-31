"""
Structured JSON logging for NEXUS.

Usage
-----
    from backend.logger import get_logger
    logger = get_logger(__name__)
    logger.info("Session started", session_id=sid, user_id=uid)

All output is written to stderr as newline-delimited JSON, making it
trivially parseable by log aggregators (Loki, CloudWatch, Datadog, etc.).

Design
------
``NexusLogger`` is a thin subclass of ``logging.Logger`` that adds
``**fields`` to every log method (info, warning, error, debug, critical).
Those fields are forwarded into the standard ``extra=`` parameter so
Pylance / pyright see a valid call signature while the ``_JSONFormatter``
picks them up and merges them into the JSON payload.
"""

from __future__ import annotations

import json
import logging
import sys
import time
from typing import Any


# ---------------------------------------------------------------------------
# JSON formatter
# ---------------------------------------------------------------------------

class _JSONFormatter(logging.Formatter):
    """Emit each log record as a single JSON line."""

    # Standard LogRecord attributes we never want to surface in the JSON output
    _SKIP: frozenset[str] = frozenset({
        "name", "msg", "args", "levelname", "levelno", "pathname",
        "filename", "module", "exc_info", "exc_text", "stack_info",
        "lineno", "funcName", "created", "msecs", "relativeCreated",
        "thread", "threadName", "processName", "process", "message",
        "taskName",
    })

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": time.strftime(
                "%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)
            ),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Merge any extra keys forwarded via extra={...}
        for key, value in record.__dict__.items():
            if key not in self._SKIP:
                payload[key] = value

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


# ---------------------------------------------------------------------------
# NexusLogger — adds **fields to every log method
# ---------------------------------------------------------------------------

class NexusLogger(logging.Logger):
    """
    Logger subclass that lets callers pass arbitrary keyword fields:

        log.info("user registered", user_id="abc", email="x@y.com")

    Fields are routed through ``extra={}`` so the type checker is satisfied
    and ``_JSONFormatter`` picks them up automatically.
    """

    def debug(self, msg: object, *args: Any, **fields: Any) -> None:  # type: ignore[override]
        if self.isEnabledFor(logging.DEBUG):
            self._log(logging.DEBUG, msg, args, extra=fields or None)

    def info(self, msg: object, *args: Any, **fields: Any) -> None:  # type: ignore[override]
        if self.isEnabledFor(logging.INFO):
            self._log(logging.INFO, msg, args, extra=fields or None)

    def warning(self, msg: object, *args: Any, **fields: Any) -> None:  # type: ignore[override]
        if self.isEnabledFor(logging.WARNING):
            self._log(logging.WARNING, msg, args, extra=fields or None)

    def error(self, msg: object, *args: Any, **fields: Any) -> None:  # type: ignore[override]
        if self.isEnabledFor(logging.ERROR):
            self._log(logging.ERROR, msg, args, extra=fields or None)

    def critical(self, msg: object, *args: Any, **fields: Any) -> None:  # type: ignore[override]
        if self.isEnabledFor(logging.CRITICAL):
            self._log(logging.CRITICAL, msg, args, extra=fields or None)

    # Convenience alias
    warn = warning  # type: ignore[assignment]


# ---------------------------------------------------------------------------
# Module-level setup
# ---------------------------------------------------------------------------

def _build_handler() -> logging.StreamHandler:  # type: ignore[type-arg]
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(_JSONFormatter())
    return handler


# Register NexusLogger so getLogger returns our subclass when we ask for it
logging.setLoggerClass(NexusLogger)

# Root NEXUS logger
_root: NexusLogger = logging.getLogger("nexus")  # type: ignore[assignment]
_root.setLevel(logging.DEBUG)
if not _root.handlers:          # Guard: don't add duplicate handlers on reload
    _root.addHandler(_build_handler())
_root.propagate = False         # Don't double-emit to the uvicorn root logger


def get_logger(name: str) -> NexusLogger:
    """Return a child ``NexusLogger`` namespaced under the nexus root."""
    # Shorten the name for cleaner log output:
    # "backend.services.rag_pipeline" → "nexus.rag_pipeline"
    short = name.split(".")[-1] if "." in name else name
    child = _root.getChild(short)
    # getChild returns logging.Logger; cast is safe because _root is NexusLogger
    return child  # type: ignore[return-value]
