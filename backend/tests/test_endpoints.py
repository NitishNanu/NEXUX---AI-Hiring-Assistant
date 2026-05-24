"""
Tests for NEXUS API endpoints.
Run with: pytest backend/tests/test_endpoints.py -v
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
import json

client = TestClient(app)


class TestAuthEndpoints:
    """Authentication endpoint tests."""

    def test_signup_success(self):
        """Test successful user signup."""
        response = client.post(
            "/api/signup",
            json={
                "email": f"test_{hash('signup')}@example.com",
                "password": "SecurePassword123!",
                "name": "Test User"
            }
        )
        assert response.status_code in (200, 201)
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"]

    def test_signup_missing_email(self):
        """Test signup with missing email."""
        response = client.post(
            "/api/signup",
            json={"password": "SecurePassword123!", "name": "Test User"}
        )
        assert response.status_code == 422

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        response = client.post(
            "/api/login",
            json={"email": "nonexistent@example.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401


class TestResumeEndpoints:
    """Resume analysis endpoint tests."""

    @pytest.fixture
    def auth_token(self):
        """Get authentication token for tests."""
        response = client.post(
            "/api/signup",
            json={
                "email": f"test_{hash('token')}@example.com",
                "password": "TestPassword123!",
                "name": "Test User"
            }
        )
        if response.status_code in (200, 201):
            return response.json()["access_token"]
        return None

    def test_improve_resume_success(self, auth_token):
        """Test resume improvement endpoint."""
        if not auth_token:
            pytest.skip("Could not get auth token")

        response = client.post(
            "/api/improve_resume",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "resume_text": "Senior Software Engineer with 5 years experience. Proficient in Python and React.",
                "focus_area": "skills"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "improvements" in data
        assert isinstance(data["improvements"], str)
        assert len(data["improvements"]) > 0

    def test_improve_resume_empty_text(self, auth_token):
        """Test resume improvement with empty text."""
        if not auth_token:
            pytest.skip("Could not get auth token")

        response = client.post(
            "/api/improve_resume",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "resume_text": "",
                "focus_area": "skills"
            }
        )
        assert response.status_code == 400

    def test_salary_expectations_success(self, auth_token):
        """Test salary expectations endpoint."""
        if not auth_token:
            pytest.skip("Could not get auth token")

        response = client.post(
            "/api/salary_expectations",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "resume_text": "Senior Software Engineer with 5 years experience. Proficient in Python, React, AWS.",
                "job_title": "Senior Software Engineer",
                "experience_years": 5,
                "location": "San Francisco, CA"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "salary_guidance" in data
        assert isinstance(data["salary_guidance"], str)

    def test_salary_expectations_minimal(self, auth_token):
        """Test salary expectations with minimal info."""
        if not auth_token:
            pytest.skip("Could not get auth token")

        response = client.post(
            "/api/salary_expectations",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "resume_text": "Software developer with 3 years experience."
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "salary_guidance" in data


class TestChatEndpoints:
    """Chat and conversation endpoint tests."""

    @pytest.fixture
    def auth_token(self):
        """Get authentication token for tests."""
        response = client.post(
            "/api/signup",
            json={
                "email": f"test_{hash('chat')}@example.com",
                "password": "TestPassword123!",
                "name": "Test User"
            }
        )
        if response.status_code in (200, 201):
            return response.json()["access_token"]
        return None

    def test_chat_success(self, auth_token):
        """Test basic chat endpoint."""
        if not auth_token:
            pytest.skip("Could not get auth token")

        response = client.post(
            "/api/chat",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "message": "What are good practices for a resume?",
                "history": [],
                "resume_context": None
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert isinstance(data["answer"], str)

    def test_chat_with_resume_context(self, auth_token):
        """Test chat with resume context."""
        if not auth_token:
            pytest.skip("Could not get auth token")

        response = client.post(
            "/api/chat",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "message": "Based on my resume, what are my strongest skills?",
                "history": [],
                "resume_context": "Senior Engineer with Python, React, and AWS expertise."
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data


class TestInterviewQuestions:
    """Interview question generation tests."""

    @pytest.fixture
    def auth_token(self):
        """Get authentication token for tests."""
        response = client.post(
            "/api/signup",
            json={
                "email": f"test_{hash('interview')}@example.com",
                "password": "TestPassword123!",
                "name": "Test User"
            }
        )
        if response.status_code in (200, 201):
            return response.json()["access_token"]
        return None

    def test_interview_questions_generation(self, auth_token):
        """Test interview question generation."""
        if not auth_token:
            pytest.skip("Could not get auth token")

        response = client.post(
            "/api/interview_questions",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "resume_text": "Senior Software Engineer with 5 years experience in Python and React."
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert isinstance(data["questions"], list)
        assert len(data["questions"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
