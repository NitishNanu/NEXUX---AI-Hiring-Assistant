"""Code execution and testing service."""

import json
import asyncio
import tempfile
import subprocess
from typing import Dict, Any, Optional, List
from pathlib import Path


class CodingExecutor:
    """Execute and test code submissions."""

    SUPPORTED_LANGUAGES = {
        "python": {"extension": ".py", "runner": "python"},
        "javascript": {"extension": ".js", "runner": "node"},
        "java": {"extension": ".java", "runner": "java"},
        "cpp": {"extension": ".cpp", "runner": "g++"},
        "go": {"extension": ".go", "runner": "go"},
    }

    async def execute_code(
        self,
        code: str,
        language: str,
        test_cases: List[Dict[str, Any]],
        timeout: int = 5,
    ) -> Dict[str, Any]:
        """Execute code against test cases."""
        if language not in self.SUPPORTED_LANGUAGES:
            return {
                "success": False,
                "error": f"Language {language} not supported",
                "passed": 0,
                "total": len(test_cases),
            }

        results = {
            "success": True,
            "language": language,
            "passed": 0,
            "total": len(test_cases),
            "test_results": [],
            "execution_time_ms": 0,
            "errors": [],
        }

        try:
            # Create temporary file
            lang_config = self.SUPPORTED_LANGUAGES[language]
            with tempfile.NamedTemporaryFile(
                mode="w",
                suffix=lang_config["extension"],
                delete=False,
            ) as f:
                f.write(code)
                temp_file = f.name

            try:
                # Execute for each test case
                for i, test_case in enumerate(test_cases):
                    test_result = await self._run_test(
                        temp_file,
                        language,
                        test_case,
                        timeout,
                    )
                    results["test_results"].append(test_result)
                    if test_result.get("passed"):
                        results["passed"] += 1

            finally:
                Path(temp_file).unlink(missing_ok=True)

        except Exception as e:
            results["success"] = False
            results["errors"].append(str(e))

        return results

    async def _run_test(
        self,
        file_path: str,
        language: str,
        test_case: Dict[str, Any],
        timeout: int,
    ) -> Dict[str, Any]:
        """Run a single test case."""
        result = {
            "input": test_case.get("input", ""),
            "expected_output": test_case.get("output", ""),
            "actual_output": "",
            "passed": False,
            "error": None,
        }

        try:
            # For simplicity, implement Python testing
            if language == "python":
                result = await self._run_python_test(file_path, test_case, timeout)
            else:
                # Placeholder for other languages
                result["error"] = f"Testing for {language} not yet implemented"

        except Exception as e:
            result["error"] = str(e)

        return result

    async def _run_python_test(
        self,
        file_path: str,
        test_case: Dict[str, Any],
        timeout: int,
    ) -> Dict[str, Any]:
        """Run Python test case."""
        result = {
            "input": test_case.get("input", ""),
            "expected_output": test_case.get("output", ""),
            "actual_output": "",
            "passed": False,
            "error": None,
        }

        try:
            # Create test script
            test_code = f"""
import sys
sys.path.insert(0, '{Path(file_path).parent}')

# Import the solution
from {Path(file_path).stem} import *

# Run test
input_str = {repr(test_case.get('input', ''))}
expected = {repr(test_case.get('output', ''))}

try:
    # Parse input and call function
    # This is simplified; real implementation would be more sophisticated
    result = eval(input_str)
    print(result)
except Exception as e:
    print(f"Error: {{e}}")
"""

            with tempfile.NamedTemporaryFile(
                mode="w",
                suffix=".py",
                delete=False,
            ) as f:
                f.write(test_code)
                test_file = f.name

            try:
                # Run test
                proc = await asyncio.create_subprocess_shell(
                    f"python {test_file}",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )

                try:
                    stdout, stderr = await asyncio.wait_for(
                        proc.communicate(),
                        timeout=timeout,
                    )
                    output = stdout.decode().strip()
                    error = stderr.decode().strip()

                    result["actual_output"] = output
                    if error:
                        result["error"] = error
                    else:
                        result["passed"] = str(output) == str(test_case.get("output", ""))

                except asyncio.TimeoutError:
                    result["error"] = f"Timeout after {timeout}s"

            finally:
                Path(test_file).unlink(missing_ok=True)

        except Exception as e:
            result["error"] = str(e)

        return result

    def analyze_code_quality(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code quality (complexity, style, etc)."""
        analysis = {
            "language": language,
            "line_count": len(code.split("\n")),
            "has_comments": "//" in code or "#" in code,
            "complexity_estimate": "Unknown",
            "style_issues": [],
        }

        # Simple heuristic-based analysis
        if language == "python":
            # Count indentation for function nesting
            lines = code.split("\n")
            max_indent = max(
                (len(line) - len(line.lstrip())) // 4 for line in lines if line.strip()
            )
            if max_indent > 3:
                analysis["complexity_estimate"] = "High"
            elif max_indent > 1:
                analysis["complexity_estimate"] = "Medium"
            else:
                analysis["complexity_estimate"] = "Low"

        return analysis
