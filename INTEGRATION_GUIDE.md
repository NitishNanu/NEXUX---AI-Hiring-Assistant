# NEXUS Platform - Complete Integration Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + TypeScript)               │
├─────────────────────────────────────────────────────────────────┤
│  Pages: MockInterviewEnhanced, InterviewPrepEnhanced            │
│  Components: HeroSection, Cards, Editor, Analytics, Questions   │
│  API Services: interviewApi, codingApi, mcqApi                  │
│  State: Zustand (useNexusStore)                                 │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI + Python)                     │
├─────────────────────────────────────────────────────────────────┤
│ Routes:                                                          │
│  • /api/mock-interview/*  (InterviewEngine integration)         │
│  • /api/coding/*          (CodingExecutor integration)          │
│  • /api/mcq/*             (MCQ evaluation)                      │
│                                                                  │
│ Services:                                                        │
│  • InterviewEngine         (AI question generation & evaluation) │
│  • CodingExecutor          (Code execution & testing)           │
│  • InterviewRepository     (Database operations)                │
│  • OpenAIService           (GPT-5.4 API integration)            │
│                                                                  │
│ Models:                                                          │
│  • Pydantic schemas for all request/response types             │
│  • Type-safe validation                                         │
└────────────────────────────┬──────────────────────────────────────┘
                             │ Async I/O
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               DATABASE (MongoDB + Motor)                         │
├─────────────────────────────────────────────────────────────────┤
│ Collections:                                                     │
│  • users                   (User profiles & settings)           │
│  • resumes                 (Resume data with parsed content)    │
│  • interview_sessions      (Active/completed interviews)        │
│  • interview_questions     (Generated questions per session)    │
│  • interview_answers       (User answers & evaluations)         │
│  • interview_analytics     (Performance metrics & trends)       │
│  • coding_problems         (Problem bank)                       │
│  • coding_submissions      (Code solutions & results)           │
│  • mcq_questions           (MCQ question bank)                  │
│  • mcq_answers             (MCQ responses)                      │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Interview Session Initialization Flow

```
User Clicks "Start Interview"
        ↓
Frontend: MockInterviewEnhanced.tsx handleRoleSelect()
        ↓
Calls: interviewApi.startInterview({ interview_type, selected_role })
        ↓
Backend: POST /api/mock-interview/start
        ├─ Get user's resume (for context)
        ├─ Create interview_session in MongoDB
        ├─ Save resume_intelligence scores
        └─ Return session_id
        ↓
Frontend: Stores session_id in component state
        ↓
Displays onboarding animation (2-4 stages with progress)
        ↓
After onboarding: GET /api/mock-interview/question/{session_id}
        ├─ InterviewEngine.generate_*_question() called
        ├─ Question saved to interview_questions collection
        └─ Return full question data
        ↓
Display question in interview view
        ↓
User submits answer → POST /api/mock-interview/submit-answer
        ├─ InterviewEngine.evaluate_answer()
        ├─ Evaluation saved to interview_answers
        └─ Return score + feedback
        ↓
Progress indicator updates
        ↓
Repeat for each question
        ↓
User clicks "Finish" → POST /api/mock-interview/end/{session_id}
        ├─ Calculate final analytics
        ├─ Mark session as completed
        └─ Return overall score
        ↓
Display results with InterviewAnalyticsDashboard
```

### Coding Challenge Flow

```
Question with category='coding' is displayed
        ↓
Frontend: InterviewCodingEditor.tsx renders Monaco editor
        ↓
User writes code & clicks "Run Code"
        ↓
POST /api/coding/run { code, language, test_cases }
        ├─ CodingExecutor.execute_code()
        ├─ Async subprocess execution
        ├─ Test results aggregated
        └─ Return { passed, total, test_results }
        ↓
Display test results in editor
        ↓
User clicks "Submit"
        ↓
POST /api/coding/submit { code, language, interview_session_id, question_id }
        ├─ CodingExecutor.execute_code() (again)
        ├─ InterviewEngine.evaluate_coding_answer()
        ├─ Submission saved to coding_submissions
        └─ Return { score, strengths, improvements }
        ↓
Display evaluation feedback
        ↓
Move to next question
```

### MCQ Flow

```
Question with category='mcq' is displayed
        ↓
Frontend: Shows 4 options (rendered as buttons/radio)
        ↓
User selects answer & clicks "Submit"
        ↓
POST /api/mcq/submit { selected_option, question_id, session_id }
        ├─ Check correctness in MCQ question doc
        ├─ Save answer to mcq_answers
        ├─ Calculate score (100 if correct, 0 otherwise)
        └─ Return { is_correct, explanation, score }
        ↓
Display result with explanation
        ↓
Move to next question
```

## API Reference

### Interview Management

#### Start Interview
```
POST /api/mock-interview/start
Request:
{
  "interview_type": "sde|frontend|backend|ml|pm",
  "selected_role": "Software Engineer"
}
Response:
{
  "session_id": "sess_123abc",
  "user_id": "user_456",
  "interview_type": "sde",
  "status": "in_progress",
  "created_at": "2026-05-24T10:30:00Z"
}
```

#### Get Next Question
```
GET /api/mock-interview/question/{session_id}
Response:
{
  "id": "q_123",
  "category": "behavioral|technical|coding|system_design|mcq",
  "difficulty": "easy|medium|hard|expert",
  "questionText": "Tell me about...",
  "whyAsked": "Tests your...",
  "expectedTraits": ["Communication", "Leadership"],
  "followUpQuestions": ["Can you elaborate?"],
  "aiHints": ["Use STAR method"],
  "idealAnswer": "Example answer structure..."
}
```

#### Submit Answer
```
POST /api/mock-interview/submit-answer
Request:
{
  "interview_session_id": "sess_123",
  "question_id": "q_123",
  "answer_text": "User's written answer",
  "duration_seconds": 180
}
Response:
{
  "answer_id": "ans_123",
  "score": 82,
  "feedback": "Strong answer with good structure...",
  "strengths": ["Clear structure", "Good examples"],
  "improvements": ["Could add metrics", "More specific"],
  "followUpQuestions": ["How did you measure success?"],
  "readinessScore": 78
}
```

#### Get Session Analytics
```
GET /api/mock-interview/analytics/{session_id}
Response:
{
  "communication": 78,
  "technical_depth": 82,
  "confidence": 75,
  "problem_solving": 80,
  "leadership": 68,
  "system_design": 72,
  "coding": 85,
  "readiness_score": 76
}
```

### Coding Challenges

#### Run Code
```
POST /api/coding/run
Request:
{
  "code": "def solve(nums): return sum(nums)",
  "language": "python|javascript|java|cpp",
  "test_cases": [
    { "input": "[1,2,3]", "output": "6" }
  ]
}
Response:
{
  "success": true,
  "passed": 3,
  "total": 3,
  "test_results": [
    {
      "input": "[1,2,3]",
      "expected_output": "6",
      "actual_output": "6",
      "passed": true
    }
  ],
  "execution_time_ms": 25
}
```

#### Submit Coding Solution
```
POST /api/coding/submit
Request:
{
  "code": "def solve(nums): return sum(nums)",
  "language": "python",
  "interview_session_id": "sess_123",
  "question_id": "q_456",
  "duration_seconds": 600
}
Response:
{
  "submission_id": "sub_789",
  "overall_score": 85,
  "passed_tests": 8,
  "total_tests": 10,
  "strengths": ["Clean code", "Efficient algorithm"],
  "weaknesses": ["Missing error handling"],
  "improvements": ["Add input validation"]
}
```

### MCQ Management

#### Submit MCQ Answer
```
POST /api/mcq/submit
Request:
{
  "interview_session_id": "sess_123",
  "question_id": "q_789",
  "selected_option": 2,
  "duration_seconds": 45
}
Response:
{
  "answer_id": "ans_999",
  "is_correct": true,
  "correct_option": 2,
  "selected_option": 2,
  "explanation": "This is the correct answer because...",
  "score": 100
}
```

#### Get MCQ Stats
```
GET /api/mcq/stats
Response:
{
  "total_attempted": 45,
  "correct": 36,
  "accuracy": 80,
  "by_topic": {
    "algorithms": {
      "attempted": 15,
      "correct": 12,
      "accuracy": 80
    }
  },
  "by_difficulty": {
    "medium": {
      "attempted": 25,
      "correct": 20,
      "accuracy": 80
    }
  }
}
```

## Frontend Integration Examples

### Starting an Interview
```typescript
import { interviewApi } from '@/api/interviewApi';

// In component
const handleStartInterview = async (roleId: string) => {
  try {
    const session = await interviewApi.startInterview({
      interview_type: roleId,
      selected_role: 'Senior Software Engineer'
    });
    
    // Store session ID
    setSessionId(session.session_id);
    setStep('onboarding');
    
  } catch (error) {
    nexusToast.error('Failed to start interview');
  }
};
```

### Loading a Question
```typescript
const loadQuestion = async () => {
  try {
    const question = await interviewApi.getNextQuestion(sessionId);
    setCurrentQuestion(question);
    setShowHints(false);
  } catch (error) {
    nexusToast.error('Failed to load question');
  }
};
```

### Submitting an Answer
```typescript
const handleSubmitAnswer = async (answer: string) => {
  try {
    const evaluation = await interviewApi.submitAnswer({
      interview_session_id: sessionId,
      question_id: currentQuestion.id,
      answer_text: answer,
      duration_seconds: elapsed
    });
    
    // Show feedback
    setFeedback(evaluation);
    nexusToast.success('Answer evaluated!');
    
  } catch (error) {
    nexusToast.error('Failed to submit answer');
  }
};
```

### Running Code
```typescript
import { codingApi } from '@/api/codingApi';

const handleRunCode = async (code: string, language: string) => {
  try {
    const results = await codingApi.runCode({
      interview_session_id: sessionId,
      question_id: problemId,
      code: code,
      language: language,
      duration_seconds: elapsed
    });
    
    setTestResults(results.test_results);
    nexusToast.info(`${results.passed}/${results.total} tests passed`);
    
  } catch (error) {
    nexusToast.error('Failed to execute code');
  }
};
```

### Submitting Code Solution
```typescript
const handleSubmitCode = async (code: string, language: string) => {
  try {
    const evaluation = await codingApi.submitSolution({
      interview_session_id: sessionId,
      question_id: problemId,
      code: code,
      language: language,
      duration_seconds: elapsed
    });
    
    // Show detailed feedback
    setEvaluation(evaluation);
    nexusToast.success(`Score: ${evaluation.overall_score}/100`);
    
  } catch (error) {
    nexusToast.error('Failed to submit code');
  }
};
```

## Database Indexes

For optimal performance, create the following indexes:

```javascript
// interview_sessions
db.interview_sessions.createIndex({ user_id: 1, created_at: -1 })
db.interview_sessions.createIndex({ session_id: 1 })
db.interview_sessions.createIndex({ status: 1 })

// interview_questions
db.interview_questions.createIndex({ session_id: 1 })
db.interview_questions.createIndex({ category: 1 })

// interview_answers
db.interview_answers.createIndex({ session_id: 1 })
db.interview_answers.createIndex({ user_id: 1 })
db.interview_answers.createIndex({ created_at: -1 })

// coding_submissions
db.coding_submissions.createIndex({ session_id: 1 })
db.coding_submissions.createIndex({ user_id: 1 })

// mcq_answers
db.mcq_answers.createIndex({ session_id: 1 })
db.mcq_answers.createIndex({ user_id: 1 })
db.mcq_answers.createIndex({ topic: 1 })
```

## Error Handling

All endpoints implement comprehensive error handling:

```typescript
try {
  const response = await nexusClient.post(url, data);
  return response.data;
} catch (error) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 404) {
      // Handle not found
    } else if (error.response?.status === 401) {
      // Handle unauthorized
    } else if (error.response?.status === 400) {
      // Handle validation error
    }
  }
  console.error(error);
  throw error;
}
```

## Deployment Checklist

- [ ] MongoDB indexes created
- [ ] Environment variables configured
- [ ] OpenAI API key set
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Database backups scheduled
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] API endpoints respond correctly
- [ ] Authentication working
- [ ] File uploads working
- [ ] AI integration tested
- [ ] Code execution tested with timeout
- [ ] MCQ evaluation verified
- [ ] Analytics calculation verified
- [ ] Performance tested under load

---

**Last Updated:** May 24, 2026
**Version:** 2.1.0
