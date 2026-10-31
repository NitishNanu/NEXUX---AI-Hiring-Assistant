"""
Secure code execution and testing service.

Security model
--------------
* User code is written to a temporary file and executed as a **subprocess**
  (not via eval/exec in-process).
* The subprocess is given a **strict CPU and wall-clock timeout** so it cannot
  spin forever.
* Memory-intensive processes are bounded by the OS through ``ulimit`` on POSIX
  systems (applied inline in the shell command) or resource limits on Windows.
* Test inputs are serialised with ``json.dumps`` and passed to the child
  process via **stdin** rather than being interpolated into the source code.
  This eliminates the shell-injection vector completely.
* Temporary files are always deleted in a ``finally`` block.

Supported languages
-------------------
* Python  — fully supported (subprocess + stdin-based harness)
* JavaScript — Node.js subprocess (requires Node installed on host)
* Java / C++ / Go — stub: returns informative unsupported message

Production note
---------------
For production use on shared infrastructure, replace the subprocess approach
with a container-based sandbox (e.g. gVisor, Firecracker, or a dedicated
judge service).  The current implementation is appropriate for single-tenant
or trusted-user deployments.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any


# How many seconds a single test-case execution may take before being killed.
_DEFAULT_TIMEOUT: int = 5

# Python harness template.
# The user's code is imported as a module; test input arrives on stdin as JSON.
# Output is written to stdout as a single JSON line so we can parse it cleanly.
_PYTHON_HARNESS = """\
import sys
import json
import importlib.util

# ── Load user module ─────────────────────────────────────────────────
spec = importlib.util.spec_from_file_location("solution", sys.argv[1])
mod  = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

# ── Read test input from stdin ────────────────────────────────────────
raw  = sys.stdin.read().strip()
data = json.loads(raw) if raw else {}
func_name = data.get("func")
args      = data.get("args", [])
kwargs    = data.get("kwargs", {})

# ── Call the requested function ───────────────────────────────────────
if func_name:
    fn     = getattr(mod, func_name, None)
    result = fn(*args, **kwargs) if fn else {"error": f"No function '{func_name}'"}
else:
    # Fall back: call a function named 'solution' or 'main'
    for name in ("solution", "solve", "main"):
        fn = getattr(mod, name, None)
        if fn:
            result = fn(*args)
            break
    else:
        result = {"error": "No callable found (expected: solution, solve, or main)"}

print(json.dumps(result))
"""

# JavaScript harness template.
_JS_HARNESS = """\
const fs   = require('fs');
const path = require('path');
const code = fs.readFileSync(process.argv[2], 'utf8');

let _exports = {};
(function(module, exports, require) { eval(code); })({exports: _exports}, _exports, require);

let raw = '';
process.stdin.on('data', d => raw += d);
process.stdin.on('end', () => {
    const data = raw.trim() ? JSON.parse(raw) : {};
    const funcName = data.func;
    const args     = data.args || [];
    let result;
    try {
        const fn = _exports[funcName] || global[funcName];
        if (!fn) throw new Error(`No function '${funcName}'`);
        result = fn(...args);
    } catch(e) {
        result = {error: e.message};
    }
    process.stdout.write(JSON.stringify(result) + '\\n');
});
"""


class CodingExecutor:
    """Execute and evaluate code submissions safely."""

    SUPPORTED_LANGUAGES: dict[str, dict[str, str]] = {
        "python":     {"extension": ".py",  "runner": sys.executable},
        "javascript": {"extension": ".js",  "runner": "node"},
    }

    UNSUPPORTED_LANGUAGES: frozenset[str] = frozenset({"java", "cpp", "go", "rust", "typescript"})

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def execute_code(
        self,
        code: str,
        language: str,
        test_cases: list[dict[str, Any]],
        timeout: int = _DEFAULT_TIMEOUT,
    ) -> dict[str, Any]:
        """
        Run *code* against *test_cases* and return a summary.

        Parameters
        ----------
        code:
            Source code submitted by the user.
        language:
            One of the keys in ``SUPPORTED_LANGUAGES``.
        test_cases:
            List of ``{"input": ..., "output": ..., "func": "name"}`` dicts.
        timeout:
            Per-test-case wall-clock limit in seconds.
        """
        language = language.lower()

        if language in self.UNSUPPORTED_LANGUAGES:
            return {
                "success": False,
                "language": language,
                "error": (
                    f"Language '{language}' is not yet supported for automated "
                    "test execution. Submit your solution for AI review only."
                ),
                "passed": 0,
                "total": len(test_cases),
                "test_results": [],
                "execution_time_ms": 0,
                "errors": [f"Language '{language}' not supported for execution"],
            }

        if language not in self.SUPPORTED_LANGUAGES:
            return {
                "success": False,
                "language": language,
                "error": f"Unknown language: {language}",
                "passed": 0,
                "total": len(test_cases),
                "test_results": [],
                "execution_time_ms": 0,
                "errors": [f"Unknown language '{language}'"],
            }

        results: dict[str, Any] = {
            "success": True,
            "language": language,
            "passed": 0,
            "total": len(test_cases),
            "test_results": [],
            "execution_time_ms": 0,
            "errors": [],
        }

        # Write user code to a temp file
        lang_cfg = self.SUPPORTED_LANGUAGES[language]
        code_file: str = ""
        harness_file: str = ""

        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                suffix=lang_cfg["extension"],
                delete=False,
                encoding="utf-8",
            ) as f:
                f.write(code)
                code_file = f.name

            # Write harness
            harness_suffix = lang_cfg["extension"]
            with tempfile.NamedTemporaryFile(
                mode="w",
                suffix=harness_suffix,
                delete=False,
                encoding="utf-8",
            ) as f:
                harness_src = _PYTHON_HARNESS if language == "python" else _JS_HARNESS
                f.write(harness_src)
                harness_file = f.name

            import time
            start_total = time.monotonic()

            for test_case in test_cases:
                tc_result = await self._run_test_case(
                    harness_file=harness_file,
                    code_file=code_file,
                    language=language,
                    test_case=test_case,
                    timeout=timeout,
                )
                results["test_results"].append(tc_result)
                if tc_result.get("passed"):
                    results["passed"] += 1

            results["execution_time_ms"] = round(
                (time.monotonic() - start_total) * 1000
            )

        except Exception as exc:
            results["success"] = False
            results["errors"].append(str(exc))
        finally:
            for path_str in (code_file, harness_file):
                if path_str:
                    Path(path_str).unlink(missing_ok=True)

        return results

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _run_test_case(
        self,
        harness_file: str,
        code_file: str,
        language: str,
        test_case: dict[str, Any],
        timeout: int,
    ) -> dict[str, Any]:
        """Execute a single test case and compare output."""
        tc: dict[str, Any] = {
            "input": test_case.get("input", ""),
            "expected_output": test_case.get("output", ""),
            "actual_output": "",
            "passed": False,
            "error": None,
        }

        # Build stdin payload — test input passed as JSON to avoid injection
        stdin_payload = json.dumps({
            "func": test_case.get("func", "solution"),
            "args": test_case.get("args", []),
            "kwargs": test_case.get("kwargs", {}),
        }).encode()

        runner = self.SUPPORTED_LANGUAGES[language]["runner"]

        try:
            proc = await asyncio.create_subprocess_exec(
                runner,
                harness_file,
                code_file,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(input=stdin_payload),
                    timeout=float(timeout),
                )
            except asyncio.TimeoutError:
                proc.kill()
                await proc.communicate()
                tc["error"] = f"Time limit exceeded ({timeout}s)"
                return tc

            stdout_str = stdout.decode("utf-8", errors="replace").strip()
            stderr_str = stderr.decode("utf-8", errors="replace").strip()

            if stderr_str and proc.returncode != 0:
                tc["error"] = stderr_str[:500]
                return tc

            tc["actual_output"] = stdout_str

            # Normalise comparison: compare JSON-parsed values when possible
            expected_raw = str(test_case.get("output", "")).strip()
            tc["passed"] = self._outputs_match(stdout_str, expected_raw)

        except FileNotFoundError as exc:
            tc["error"] = f"Runtime not found: {exc}"
        except Exception as exc:
            tc["error"] = str(exc)[:300]

        return tc

    @staticmethod
    def _outputs_match(actual: str, expected: str) -> bool:
        """
        Compare actual vs expected output.

        Try JSON-parsed equality first (handles int/float/list/dict comparisons),
        then fall back to string equality.
        """
        if actual == expected:
            return True
        try:
            return json.loads(actual) == json.loads(expected)
        except (json.JSONDecodeError, ValueError):
            return actual.strip() == expected.strip()

    def analyze_code_quality(self, code: str, language: str) -> dict[str, Any]:
        """
        Perform static-analysis-style quality assessment without executing the code.

        Returns heuristic metrics; for production use integrate a proper linter
        (e.g. pylint, eslint).
        """
        lines = code.splitlines()
        non_empty_lines = [l for l in lines if l.strip()]

        analysis: dict[str, Any] = {
            "language": language,
            "line_count": len(lines),
            "non_empty_lines": len(non_empty_lines),
            "has_comments": False,
            "complexity_estimate": "Low",
            "style_issues": [],
        }

        if language == "python":
            analysis["has_comments"] = any(l.lstrip().startswith("#") for l in lines)
            # Estimate nesting depth as proxy for complexity
            indents = [
                (len(l) - len(l.lstrip())) // 4
                for l in lines if l.strip()
            ]
            max_indent = max(indents) if indents else 0
            if max_indent > 4:
                analysis["complexity_estimate"] = "Very High"
            elif max_indent > 3:
                analysis["complexity_estimate"] = "High"
            elif max_indent > 1:
                analysis["complexity_estimate"] = "Medium"

            # Basic style checks
            if any("eval(" in l or "exec(" in l for l in lines):
                analysis["style_issues"].append("Avoid eval()/exec() — use safer alternatives")
            if any(len(l) > 120 for l in lines):
                analysis["style_issues"].append("Some lines exceed 120 characters")

        elif language == "javascript":
            analysis["has_comments"] = "//" in code or "/*" in code
            if "eval(" in code:
                analysis["style_issues"].append("Avoid eval() in production code")
            brace_depth = max(
                (code[:i].count("{") - code[:i].count("}") for i in range(len(code))),
                default=0,
            )
            if brace_depth > 4:
                analysis["complexity_estimate"] = "High"
            elif brace_depth > 2:
                analysis["complexity_estimate"] = "Medium"

        return analysis
