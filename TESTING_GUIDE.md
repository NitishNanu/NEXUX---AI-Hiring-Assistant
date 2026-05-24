# NEXUS - Testing Guide

## Running Tests

### Backend Tests

**Prerequisites:**
```bash
cd backend
pip install pytest fastapi httpx
```

**Run all backend tests:**
```bash
pytest tests/ -v
```

**Run specific test file:**
```bash
pytest tests/test_endpoints.py -v
```

**Run specific test class:**
```bash
pytest tests/test_endpoints.py::TestResumeEndpoints -v
```

**Run with coverage:**
```bash
pytest tests/ --cov=backend --cov-report=html
```

**Test Results:**
- Auth endpoints: signup, login validation
- Resume endpoints: improvement, salary expectations
- Chat endpoints: conversation with context
- Error handling: validation and error responses

---

### Frontend Tests

**Prerequisites:**
```bash
cd frontend
npm install
npm install -D vitest @testing-library/react @testing-library/user-event
```

**Run all frontend tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

**Run specific test file:**
```bash
npm test -- components.test.tsx
```

**Run with coverage:**
```bash
npm test -- --coverage
```

**Test Coverage:**
- SalaryExpectations component rendering
- ResumeImprovement component rendering
- API integration
- Loading states
- Error handling
- User interactions (expanding, clicking)

---

## Test Structure

### Backend Tests (`backend/tests/test_endpoints.py`)

**TestAuthEndpoints**
- `test_signup_success()` - Successful user registration
- `test_signup_missing_email()` - Email validation
- `test_login_invalid_credentials()` - Login error handling

**TestResumeEndpoints**
- `test_improve_resume_success()` - Resume improvement API call
- `test_improve_resume_empty_text()` - Input validation
- `test_salary_expectations_success()` - Salary API with full info
- `test_salary_expectations_minimal()` - Salary API with minimal info

**TestChatEndpoints**
- `test_chat_success()` - Basic chat functionality
- `test_chat_with_resume_context()` - Chat with resume context

**TestInterviewQuestions**
- `test_interview_questions_generation()` - Question generation

### Frontend Tests (`frontend/src/__tests__/components.test.tsx`)

**SalaryExpectations Tests**
- Component rendering
- Input field presence
- API call verification
- Result display
- Error handling
- Loading states
- Parameter passing

**ResumeImprovement Tests**
- Component rendering
- Focus area input
- API integration
- Improvement display
- Expandable items
- Loading and error states
- Counter display

---

## Mock Data

### Resume Sample
```
Senior Software Engineer with 5 years experience in Python, React, and AWS.
Skills: Python, React, Node.js, AWS, PostgreSQL
Experience: 5 years
```

### Job Description Sample
```
Senior Software Engineer
Requirements: Python, React, AWS, Docker, Kubernetes
Experience: 5+ years
```

---

## Common Issues

### Backend Tests Fail
**Problem:** "Could not get auth token"
**Solution:** Ensure database is running (`mongodb://localhost:27017`)

**Problem:** "AI service unavailable"
**Solution:** Check OPENAI_API_KEY is set in `.env`

### Frontend Tests Fail
**Problem:** "Cannot find module '@testing-library/react'"
**Solution:** Run `npm install -D @testing-library/react @testing-library/user-event`

**Problem:** "Vitest not found"
**Solution:** Run `npm install -D vitest`

---

## Performance Testing

### Load Testing
To test with multiple concurrent requests:

```bash
# Backend load test
ab -n 100 -c 10 http://localhost:8000/api/health

# Frontend performance
npm run build
npm run preview
```

### Response Time Benchmarks
- Resume upload: 2-5s
- Resume improvement: 5-10s
- Salary expectations: 5-10s
- JD matching: 5-15s
- Chat response: 3-8s

---

## Continuous Integration

### GitHub Actions Setup
Create `.github/workflows/tests.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt pytest
      - run: pytest backend/tests/

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

---

## Test Coverage Goals

**Backend:**
- Endpoint coverage: 90%+
- Error handling: 100%
- Validation: 100%

**Frontend:**
- Component coverage: 85%+
- Integration: 80%+
- Error states: 100%

---

## Best Practices

1. **Run tests before committing**
   ```bash
   npm test  # Frontend
   pytest    # Backend
   ```

2. **Write tests for new features**
   - One test per functionality
   - Test error cases
   - Test edge cases

3. **Keep tests fast**
   - Mock external APIs
   - Use fixtures for setup
   - Avoid unnecessary delays

4. **Use descriptive test names**
   - `test_improve_resume_success()` ✅
   - `test_upload()` ❌

---

## Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-dependencies/)

---

**Last Updated:** May 24, 2026  
**Test Suite Version:** 1.0.0
