# NEXUS Platform - Production Deployment & Testing Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed  
- [ ] MongoDB 5.0+ running locally or MongoDB Atlas configured
- [ ] OpenAI API key obtained
- [ ] Git repository initialized and branches set up

### Backend Setup
- [ ] Create `.env` file with all required variables:
  ```
  OPENAI_API_KEY=sk-...
  MONGODB_URL=mongodb://localhost:27017
  MONGODB_DB_NAME=nexus
  JWT_SECRET=your-super-secret-key-change-in-production
  CORS_ORIGINS=http://localhost:5173,http://localhost:3000
  ```

- [ ] Create Python virtual environment:
  ```bash
  python -m venv .venv
  source .venv/bin/activate  # Windows: .venv\Scripts\activate
  ```

- [ ] Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

- [ ] Test backend startup:
  ```bash
  python -m uvicorn backend.main:app --reload --log-level debug
  ```
  
  Should output:
  ```
  NEXUS starting up…
  NEXUS ready ✅
  Uvicorn running on http://127.0.0.1:8000
  ```

### Frontend Setup
- [ ] Install dependencies:
  ```bash
  cd frontend
  npm install
  ```

- [ ] Check for build errors:
  ```bash
  npm run build
  ```

- [ ] Start development server:
  ```bash
  npm run dev
  ```
  
  Should be accessible at `http://localhost:5173`

### Database Setup
- [ ] Create MongoDB database and collections:
  ```javascript
  // Use MongoDB shell or Compass
  use nexus
  
  // Create collections (MongoDB creates them on first insert, but we can be explicit)
  db.createCollection("users")
  db.createCollection("resumes")
  db.createCollection("interview_sessions")
  db.createCollection("interview_questions")
  db.createCollection("interview_answers")
  db.createCollection("interview_analytics")
  db.createCollection("coding_problems")
  db.createCollection("coding_submissions")
  db.createCollection("mcq_questions")
  db.createCollection("mcq_answers")
  ```

- [ ] Create indexes for performance:
  ```javascript
  // Interview system indexes
  db.interview_sessions.createIndex({ user_id: 1, created_at: -1 })
  db.interview_sessions.createIndex({ session_id: 1 })
  db.interview_questions.createIndex({ session_id: 1 })
  db.interview_answers.createIndex({ user_id: 1, created_at: -1 })
  
  // Coding system indexes
  db.coding_problems.createIndex({ difficulty: 1 })
  db.coding_submissions.createIndex({ session_id: 1 })
  
  // MCQ system indexes
  db.mcq_questions.createIndex({ topic: 1, difficulty: 1 })
  db.mcq_answers.createIndex({ user_id: 1 })
  ```

---

## API Testing

### 1. Health Check
```bash
curl http://localhost:8000/api/health
# Expected: 200 OK
```

### 2. Authentication Flow
```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Response should contain access_token - save it for subsequent requests
```

### 3. Interview Endpoints
```bash
# Set TOKEN from login response
TOKEN="your-jwt-token-here"

# Start Interview
curl -X POST http://localhost:8000/api/mock-interview/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "interview_type": "sde",
    "selected_role": "Senior Software Engineer"
  }'

# Get Resume Intelligence
curl -X GET http://localhost:8000/api/mock-interview/resume-intelligence \
  -H "Authorization: Bearer $TOKEN"

# Get Next Question
curl -X GET http://localhost:8000/api/mock-interview/question/{session_id} \
  -H "Authorization: Bearer $TOKEN"

# Submit Answer
curl -X POST http://localhost:8000/api/mock-interview/submit-answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "interview_session_id": "session_id_here",
    "question_id": "question_id_here",
    "answer_text": "My detailed answer to the question",
    "duration_seconds": 180
  }'

# Get Analytics
curl -X GET http://localhost:8000/api/mock-interview/analytics/{session_id} \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Coding Endpoints
```bash
# Run Code
curl -X POST http://localhost:8000/api/coding/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "def solve(nums):\n    return sum(nums)",
    "language": "python",
    "test_cases": [
      {"input": "[1,2,3]", "output": "6"},
      {"input": "[]", "output": "0"}
    ]
  }'

# Submit Code Solution
curl -X POST http://localhost:8000/api/coding/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "def solve(nums):\n    return sum(nums)",
    "language": "python",
    "interview_session_id": "session_id",
    "question_id": "question_id",
    "duration_seconds": 600
  }'
```

### 5. MCQ Endpoints
```bash
# Submit MCQ Answer
curl -X POST http://localhost:8000/api/mcq/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "interview_session_id": "session_id",
    "question_id": "question_id",
    "selected_option": 2,
    "duration_seconds": 45
  }'

# Get Stats
curl -X GET http://localhost:8000/api/mcq/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Component Testing

### Mock Interview Page
```typescript
// Test in browser console
// 1. Verify step transitions
window.location.href = '/mock-interview'
// Should show role selection step

// 2. Click a role card
// Should transition to onboarding animation
// Progress should increment 25% every 2 seconds

// 3. After onboarding
// Should show interview step with question

// 4. Answer question and click Next
// Should show next question

// 5. Click Finish Interview
// Should show results dashboard with analytics
```

### Interview Prep Page
```typescript
// Test in browser console
window.location.href = '/interview-prep'
// Should show hero section with scores

// Click a category card
// Should load questions for that category

// Click Back button
// Should return to category selection

// Click Analytics tab
// Should show analytics dashboard
```

### Component State Tests
```javascript
// Open DevTools → React tab
// Check MockInterviewEnhanced component
// Verify step state: 'selection' → 'onboarding' → 'interview' → 'results'
// Verify onboardingProgress: 0 → 25 → 50 → 75 → 100
// Verify currentQuestionIndex increments

// Check InterviewPrepEnhanced component
// Verify selectedCategory changes on card click
// Verify showQuestions toggles
// Verify questions array populates from API
```

---

## Performance Testing

### Lighthouse Audit
```bash
# Frontend performance baseline
# In browser: DevTools → Lighthouse → Generate report
# Target scores:
#   Performance: 80+
#   Accessibility: 90+
#   Best Practices: 85+
#   SEO: 90+
```

### API Response Time Testing
```bash
# Use Apache Bench for load testing
ab -n 100 -c 10 http://localhost:8000/api/health

# Use for stress testing endpoints
ab -n 1000 -c 50 http://localhost:8000/api/mock-interview/resume-intelligence
```

### Database Performance
```javascript
// MongoDB profiling
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().pretty()

// Check index usage
db.interview_sessions.aggregate([
  { $match: { user_id: "some_user" } },
  { $explain: "executionStats" }
])
```

---

## Integration Testing Scenarios

### Complete Interview Session
1. Login with test account
2. Upload resume (if required)
3. Click "Start Mock Interview"
4. Select interview role (e.g., SDE)
5. Watch onboarding animation
6. Answer 3-5 questions (mix of text and coding)
7. Submit code for 1 coding question
8. Answer 1 MCQ question
9. Click Finish Interview
10. Verify final scores and analytics displayed
11. Check database for saved session data

### Coding Challenge Submission
1. Click run code button on coding question
2. Verify test results display (pass/fail per test)
3. Modify code to fail some tests
4. Verify failure feedback shown
5. Fix code and rerun
6. Submit solution
7. Verify AI evaluation and improvements shown
8. Check database for submission record

### Analytics Verification
1. Complete interview session
2. View results analytics
3. Verify all 7 metrics displayed (communication, technical, etc.)
4. Check that scores are within 0-100 range
5. Verify charts render without errors
6. Check user analytics page for historical trends

---

## Error Scenario Testing

### Test Cases
| Scenario | Expected Result |
|----------|-----------------|
| Network timeout during answer submission | Retry button appears with error message |
| Invalid JWT token | 401 Unauthorized, redirect to login |
| MongoDB connection lost | 503 Service Unavailable, graceful error |
| OpenAI API rate limited | Fallback question used, no blank response |
| Code execution timeout (>5s) | Timeout error shown, not system crash |
| Malformed JSON response | Error logged, user sees friendly error |
| Missing resume for interview | 400 Bad Request with helpful message |
| Duplicate answer submission | Idempotent - same result returned |

### Testing Commands
```bash
# Simulate network error (Linux/Mac)
# Disconnect network while request is in flight
# Expected: Catch error, show retry option

# Test with invalid token
curl -X GET http://localhost:8000/api/mock-interview/resume-intelligence \
  -H "Authorization: Bearer invalid-token-12345"
# Expected: 401 Unauthorized

# Test with malformed request
curl -X POST http://localhost:8000/api/mock-interview/submit-answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"invalid": "json"}'
# Expected: 422 Unprocessable Entity with validation errors
```

---

## Security Testing

### Authentication
- [ ] JWT tokens expire correctly
- [ ] Refresh token mechanism works
- [ ] Cannot access protected endpoints without token
- [ ] Cannot access other user's data with valid token
- [ ] Password hashing working (not stored in plain text)

### Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attacks prevented by React
- [ ] CSRF tokens validated
- [ ] File upload restricted to allowed types
- [ ] Request payload size limits enforced

### Data Protection
- [ ] Sensitive data not logged
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Rate limiting prevents abuse
- [ ] API keys not exposed in frontend code

### Testing Commands
```bash
# Test injection attack (should be safe)
curl -X POST http://localhost:8000/api/mock-interview/submit-answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "answer_text": "'; DROP TABLE interview_answers; --"
  }'
# Expected: Treated as normal text, no SQL executed

# Test XSS attempt
curl -X POST http://localhost:8000/api/mock-interview/submit-answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "answer_text": "<script>alert(\"xss\")</script>"
  }'
# Expected: Escaped/sanitized, rendered as text
```

---

## Production Deployment Steps

### AWS/Azure/GCP Deployment
1. Create compute instance (VM, App Service, Cloud Run)
2. Configure environment variables securely (use secrets manager)
3. Set up MongoDB Atlas (managed MongoDB service)
4. Build and deploy backend:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:8000 backend.main:app
   ```
5. Build and deploy frontend:
   ```bash
   npm run build
   # Serve dist/ folder via CDN/nginx
   ```
6. Set up reverse proxy (nginx) for API routing
7. Configure SSL certificates (Let's Encrypt)
8. Set up monitoring and alerting
9. Configure backups and disaster recovery
10. Run smoke tests on production

### Docker Deployment
```dockerfile
# Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile for frontend
FROM node:18 as build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: nexus
  
  backend:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URL: mongodb://mongodb:27017
      MONGODB_DB_NAME: nexus
      OPENAI_API_KEY: ${OPENAI_API_KEY}
  
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
```

---

## Monitoring & Logging

### Backend Logging
```python
import logging
logger = logging.getLogger(__name__)

logger.info("Interview started", extra={"session_id": session_id})
logger.warning("Slow query detected", extra={"duration_ms": 2000})
logger.error("AI API error", extra={"error": str(e)})
```

### Frontend Error Tracking
```typescript
// Add Sentry or similar
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});

// Or custom error logging
const logError = (error: Error, context: any) => {
  fetch('/api/logs/errors', {
    method: 'POST',
    body: JSON.stringify({ error: error.message, context })
  });
};
```

### Performance Monitoring
```typescript
// Monitor API call times
const startTime = performance.now();
const response = await interviewApi.startInterview(request);
const duration = performance.now() - startTime;
console.log(`Interview start took ${duration}ms`);

// Log slow operations
if (duration > 3000) {
  console.warn(`Slow operation detected: ${duration}ms`);
}
```

---

## Success Criteria

The platform is production-ready when:

✅ All API endpoints respond within 1 second  
✅ Frontend loads completely in <3 seconds  
✅ No unhandled JavaScript errors in console  
✅ All database queries use indexes (execution time <100ms)  
✅ Code execution properly handles timeouts  
✅ AI evaluation returns reasonable scores  
✅ Analytics calculations accurate and fast  
✅ Mobile responsive on all screen sizes  
✅ Authentication flow working end-to-end  
✅ CORS properly configured for production domains  
✅ Rate limiting prevents abuse  
✅ Error messages helpful to users  
✅ All tests passing  
✅ Code coverage >80%  
✅ Security audit passed  

---

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.10+

# Check all dependencies installed
pip list | grep -E "fastapi|motor|pydantic|openai"

# Check MongoDB connection
mongosh "mongodb://localhost:27017"

# Check for syntax errors
python -m py_compile backend/main.py
```

### Frontend build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Clear build cache
rm -rf dist .vite
npm run build
```

### Slow API responses
```bash
# Enable MongoDB profiling
db.setProfilingLevel(1, { slowms: 100 })

# Check slow queries
db.system.profile.find().sort({ millis: -1 }).limit(5).pretty()

# Verify indexes exist
db.interview_sessions.getIndexes()
```

### AI integration not working
- [ ] OpenAI API key valid in environment
- [ ] API key has sufficient quota
- [ ] Model name matches available models
- [ ] Check OpenAI API status page
- [ ] Test with curl to verify connectivity
- [ ] Check for rate limiting in logs

---

**Last Updated:** May 24, 2026  
**Version:** 2.1.0  
**Status:** Production Ready ✅
