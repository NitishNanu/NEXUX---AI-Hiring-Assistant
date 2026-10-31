# NEXUS — AI Hiring Intelligence Platform
## Product Requirements Document (PRD)
**Version:** 2.0 | **Status:** Active Development | **Updated:** October 2026

---

## 1. Executive Summary

**NEXUS** is an end-to-end AI-powered hiring intelligence platform that bridges the gap between job seekers and their dream roles. It combines advanced NLP, RAG (Retrieval-Augmented Generation), and multi-LLM support to deliver a personalized interview coaching system, ATS resume scoring engine, and intelligent HR assistant—all in a single, unified platform.

The product targets software engineers, product managers, and tech professionals who want data-driven, AI-powered preparation for technical and behavioral interviews.

---

## 2. Problem Statement

### 2.1 Current Challenges

| Challenge | Impact |
|---|---|
| Candidates lack personalized interview preparation | Poor interview performance |
| Resume ATS optimization is opaque and manual | High rejection rate before interviews |
| No unified platform combines resume analysis + interview coaching | Fragmented user experience |
| Generic question banks lack context about the individual candidate | Inefficient preparation |
| No objective scoring system for interview answers | Candidates do not know where they stand |
| Code practice is divorced from interview context | Technical skills not contextualized to roles |

### 2.2 Target Users

- **Primary**: Software engineers (junior to senior) preparing for technical interviews
- **Secondary**: Product managers, data scientists, ML engineers
- **Tertiary**: Career switchers re-entering the tech job market

---

## 3. Goals and Success Metrics

### 3.1 Business Goals
- Deliver a feature-complete AI hiring intelligence product
- Achieve cloud-agnostic, locally runnable architecture
- Support OpenAI and Google Gemini with graceful fallback between providers

### 3.2 Product Goals
- Reduce interview preparation time by 40% through AI-personalized guidance
- Give candidates quantitative, dimension-based scoring (not just pass/fail)
- Provide actionable resume improvements that directly improve ATS scores

### 3.3 Key Performance Indicators

| Metric | Target |
|---|---|
| Resume ATS score improvement after suggestions | +15 points average |
| Interview answer score accuracy vs human grader | >85% correlation |
| Time to first question in mock interview | <3 seconds |
| LLM response latency (P95) | <8 seconds |
| RAG retrieval relevance score | >0.75 average |
| Session completion rate | >70% |

---

## 4. Feature Specifications

### 4.1 Authentication and User Management

#### F-001: User Registration
- **Inputs**: Name, email, password
- **Validations**: Email uniqueness, Argon2 password hashing
- **Security**: JWT access tokens (24h expiry), rate limiting 20 req/min/IP
- **Output**: JWT token + user profile object

#### F-002: User Login
- **Security**: Constant-time password comparison prevents username enumeration
- **Output**: JWT token + user profile

#### F-003: User Profile
- Retrieve authenticated user profile via `GET /api/auth/me`

#### F-004: Persistent Resume Session
- Resume data persisted to MongoDB and auto-fetched on login or page refresh

---

### 4.2 Resume Intelligence Module

#### F-010: Resume Upload and Parsing
- **Supported Formats**: PDF, DOCX, DOC, TXT
- **File Size Limit**: 10 MB maximum
- **Extracted Data**: Raw text, section identification (skills/experience/education/projects/summary), 50+ tech skill detection, years of experience estimation
- **Security**: Extension + size validation before buffering

#### F-011: Generic ATS Scoring (No JD)
- **Scoring Factors**: Word count (400-800 optimal), skill density, section presence, action verbs (15+), quantifiable achievements
- **Output**: ATS score 0-100, match level Low/Medium/High, feedback list

#### F-012: JD-Specific ATS Scoring
- **Weighted Algorithm**:
  - Skill match: 40% (exact skill overlap)
  - Keyword frequency: 30% (TF-IDF based)
  - Experience match: 20% (years comparison)
  - Semantic similarity: 10% (cosine similarity)
- **Output**: Composite score, component breakdown, matched/missing skills, suggestions

#### F-013: AI Resume Improvement Suggestions
- LLM-generated, focus-area-aware tips (skills/achievements/formatting)
- Output: 5 concise actionable bullets

#### F-014: Salary Expectation Guidance
- AI-generated salary analysis from resume + optional role/location/experience context
- Output: Entry/Mid/Senior ranges, salary drivers, negotiation tip

#### F-015: Resume vs JD File Matching
- Upload both resume and JD files for full gap analysis
- Output: Match %, matched/missing skills, improvement suggestions

---

### 4.3 Mock Interview System

#### F-020: Interview Session Management
- **Types**: SDE, Frontend, Backend, Fullstack, ML/AI, Data Analyst, DevOps, Product-Based, Startup, FAANG Mode, System Design, DSA Intensive
- **Lifecycle**: `in_progress` → `completed`
- **Personalization**: Resume-aware (uses uploaded resume context)

#### F-021: AI Question Generation
- **Categories**: Behavioral, Technical, Coding, System Design, MCQ, HR, Rapid Fire, Resume Deep Dive
- Returns: `question_text`, `why_asked`, `expected_traits`, `follow_up_questions`, `ai_hints`, `ideal_answer`
- Graceful static fallback when LLM is unavailable

#### F-022: AI Answer Evaluation (8 Dimensions)
- **Scored 0-100 each**: Overall, Communication, Technical Depth, Confidence, Problem Solving, Leadership, Clarity, Correctness, STAR Format Adherence
- **Also returns**: Strengths, weaknesses, missing concepts, improvement tips, ideal answer, rewritten answer, follow-up questions

#### F-023: Interview Hints
- Progressive hints without revealing full answer
- Up to 3 hints + complexity guidance

#### F-024: Interview History
- Up to 20 most recent sessions with type, role, score, duration, date

#### F-025: Interview Analytics
- **Per-Session**: All dimension scores + readiness score
- **Aggregate**: Total interviews, all dimension averages, communication/coding trend arrays, topic weakness map (normalized 0-100), session history list

---

### 4.4 Coding Challenge Module

#### F-030: Coding Problem Bank
- MongoDB `coding_problems` collection
- Fields: title, description, difficulty, category, constraints, examples, test cases, hints, complexity

#### F-031: Secure Code Execution Engine
- **Languages**: Python 3 (fully supported), JavaScript/Node.js (fully supported)
- **Stub (planned)**: Java, C++, Go, Rust, TypeScript
- **Security**: subprocess isolation, 5s timeout per test case, stdin-based input (no shell injection), temp file cleanup in `finally`
- **Evaluation**: JSON-parsed comparison with string fallback

#### F-032: Static Code Quality Analysis
- Metrics: line count, comment presence, complexity estimate, style issues
- Language-specific: eval() detection, line length, brace depth

#### F-033: AI Code Evaluation
- Post-execution AI review: correctness, efficiency, code quality, readability, edge case handling
- Returns: strengths, weaknesses, actual complexity, optimal solution description

#### F-034: Coding Statistics
- Per-user: total solved, acceptance rate, avg score, by-difficulty, by-category, recent 5 submissions

#### F-035: Problem Recommendation Engine
- Input: weak topics from interview analytics
- Logic: MongoDB tag/category/topic matching against weak topics
- Fallback: medium-difficulty problems when no match

---

### 4.5 MCQ Assessment Module

#### F-040: MCQ Question Bank
- MongoDB `mcq_questions`: question text, 4 options, correct index, explanation, category, difficulty, topic

#### F-041: MCQ Submission and Evaluation
- Instant evaluation (correct option index comparison)
- Output: is_correct, explanation, score (100 or 0)
- Persists attempt to `mcq_attempts`

#### F-042: MCQ Statistics
- Total attempted, correct count, accuracy %, by topic, by difficulty

---

### 4.6 HR AI Assistant (RAG Chatbot)

#### F-050: RAG-Powered Chat
- FAISS vector store + LLM
- Context: top-5 retrieved chunks + user resume + last 10 conversation messages
- Auto-detects "interview question" intent → switches to question generation mode

#### F-051: Streaming Chat (SSE)
- `data: {"token": "word"}` per token, ends with `data: {"done": true}`
- Fallback: word-by-word simulation at ~60fps

#### F-052: Knowledge Base Ingestion
- Text splitting: 1000 chars, 200 overlap
- Embedding + FAISS index update + disk persistence

#### F-053: Interview Questions via Chat
- Input: resume text + optional JD + question count
- Output: numbered question list

---

### 4.7 LoRA Fine-Tuning Module

#### F-060: Training Data Export
- Exports interview Q&A pairs for LoRA fine-tuning of open-source LLMs
- Current status: stub implementation

---

## 5. Non-Functional Requirements

### 5.1 Performance
| Requirement | Target |
|---|---|
| API P50 response time | <2 seconds |
| API P95 (LLM-backed) | <8 seconds |
| File upload processing (10MB PDF) | <5 seconds |
| Code execution per test case | <5 seconds (enforced timeout) |
| FAISS similarity search | <500ms |

### 5.2 Security
- JWT HS256 authentication, configurable 24h expiry
- Argon2 password hashing (industry best practice)
- Rate limiting: 20 auth requests/min/IP
- File validation: extension + size before buffering
- LLM prompt injection prevention: input length limits
- Code sandbox: subprocess isolation, never eval/exec
- CORS: explicit allow-list only (wildcard blocked when credentials=true)
- Global 500 handler: no stack traces to clients

### 5.3 Scalability
- Stateless FastAPI (horizontal scale-ready)
- Motor async MongoDB driver (non-blocking)
- FAISS loaded in-memory at startup
- Async I/O throughout (asyncio, Motor)

### 5.4 Reliability
- LLM fallback: curated static questions/evaluations when AI unavailable
- Vector store: graceful degradation if FAISS not loaded
- Feature flags: `SKIP_VECTOR_STORE`, `SKIP_LORA_EXPORT`
- Global exception handler covers all unhandled errors

### 5.5 Maintainability
- Pydantic v2 request/response models
- Centralized settings via `pydantic-settings` + `.env`
- Service layer: `routers` → `services` → `database`
- All LLM calls through `OpenAIService` with JSON extraction helpers
- MongoDB indexes created idempotently at startup

---

## 6. Technical Constraints and Assumptions

### 6.1 Constraints
- Python 3.10+ required (union type hint syntax)
- MongoDB 6.0+ (Motor async driver)
- At least one LLM API key required (OpenAI or Google)
- Node.js required on host for JavaScript code execution

### 6.2 Assumptions
- Resume upload is optional but enhances interview personalization
- One resume per user (upserted on each upload)
- FAISS vector store starts empty; populated via `/api/ingest`
- LLM keys provided via `.env` file

---

## 7. Out of Scope (This Version)

- Real-time voice interview simulation
- Video analysis and recording
- Employer/recruiter portal
- Job board integrations (LinkedIn, Indeed)
- Payment or subscription system
- Email/push notifications
- Mobile native apps (iOS/Android)
- Deployment automation or cloud infrastructure

---

## 8. Feature Roadmap

### Phase 1 — Core MVP (Complete)
- [x] Auth system (register, login, JWT)
- [x] Resume upload + parsing (PDF, DOCX, TXT)
- [x] Generic + JD-specific ATS scoring
- [x] RAG HR chatbot
- [x] Basic mock interview (session + question + answer + save)

### Phase 2 — AI Enhancement (In Progress)
- [x] Multi-dimensional answer evaluation (8 dimensions)
- [x] AI coding evaluation + code execution engine
- [x] Analytics dashboard (session + aggregate)
- [x] MCQ assessment module
- [x] SSE streaming chat
- [x] Resume improvement AI
- [x] Salary guidance AI

### Phase 3 — Intelligence Layer (Planned)
- [ ] LoRA fine-tuning pipeline (full implementation)
- [ ] Voice interview mode (STT/TTS)
- [ ] Dynamic difficulty adaptation based on session performance
- [ ] Employer dashboard
- [ ] LLM provider auto-selection with cost optimization

### Phase 4 — Scale and Enterprise (Future)
- [ ] Multi-tenancy
- [ ] ATS system webhook integrations
- [ ] Batch resume scoring for recruiters
- [ ] Analytics export (CSV, PDF reports)
- [ ] External API access (API key management)

---

## 9. Full API Reference Table

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login + get JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| POST | `/api/auth/resume` | JWT | Upload + persist resume |
| GET | `/api/auth/resume` | JWT | Fetch stored resume |
| POST | `/api/upload_resume` | No | Parse resume (not persisted) |
| POST | `/api/analyze_resume` | No | Deep analysis + interview Qs |
| POST | `/api/improve_resume` | No | AI improvement suggestions |
| POST | `/api/salary_expectations` | No | AI salary guidance |
| POST | `/api/match_with_jd_file` | No | Resume vs JD file match |
| POST | `/api/ats_score` | No | ATS scoring (generic or JD) |
| POST | `/api/job_match` | No | Quick job match summary |
| POST | `/api/chat` | No | RAG HR chatbot |
| POST | `/api/chat/stream` | No | Streaming SSE chat |
| POST | `/api/interview_questions` | No | Generate question set |
| POST | `/api/mock-interview/start` | JWT | Start interview session |
| GET | `/api/mock-interview/resume-intelligence` | JWT | Resume intelligence scores |
| GET | `/api/mock-interview/question/{session_id}` | JWT | Get next question |
| POST | `/api/mock-interview/submit-answer` | JWT | Submit + evaluate answer |
| GET | `/api/mock-interview/analytics/{session_id}` | JWT | Session analytics |
| GET | `/api/mock-interview/user-analytics` | JWT | All-time user analytics |
| POST | `/api/mock-interview/end/{session_id}` | JWT | End + finalize session |
| GET | `/api/mock-interview/history` | JWT | Interview history |
| GET | `/api/mock-interview/hints/{session_id}/{question_id}` | JWT | Question hints |
| GET | `/api/coding/problem/{problem_id}` | JWT | Get coding problem |
| POST | `/api/coding/run` | JWT | Execute code against tests |
| POST | `/api/coding/submit` | JWT | Submit + AI-evaluate |
| POST | `/api/coding/hints/{problem_id}` | JWT | AI coding hints |
| GET | `/api/coding/problems/difficulty/{difficulty}` | JWT | Problems by difficulty |
| POST | `/api/coding/analyze` | JWT | Static code analysis |
| GET | `/api/coding/stats` | JWT | User coding statistics |
| POST | `/api/coding/recommend` | JWT | Recommended problems |
| GET | `/api/mcq/question/{question_id}` | JWT | Get MCQ question |
| POST | `/api/mcq/submit` | JWT | Submit MCQ answer |
| GET | `/api/mcq/batch/{topic}` | JWT | Batch by topic+difficulty |
| GET | `/api/mcq/topics` | JWT | Available topics |
| GET | `/api/mcq/stats` | JWT | User MCQ statistics |
| POST | `/api/ingest` | No | Ingest docs to knowledge base |
| GET | `/api/health` | No | System health check |
| GET | `/` | No | API root + docs link |

---

## 10. Acceptance Criteria

### Auth
- User registers with unique email and receives valid JWT
- Login returns identical 401 for wrong email or wrong password
- JWT validated on all protected endpoints; expired token returns 401
- Rate limiter blocks >20 auth requests/min from same IP

### Resume
- PDF and DOCX parse correctly into skills, experience, sections
- Files >10MB rejected with HTTP 413
- JD-ATS score shows component breakdown matching configured weights

### Interview
- Session personalized using resume context when resume exists
- Each answer submission returns all 8 dimension scores
- Session analytics aggregate correctly across all answers
- Fallback questions served when LLM unavailable

### Coding
- Python code executes against test cases with 5s timeout enforcement
- eval()/exec() flagged in static analysis
- All-tests-passed = 100% acceptance in stats calculation

### Chat
- RAG retrieves top-5 relevant chunks from FAISS
- Streaming endpoint emits valid SSE `data:` lines
- Resume context prepended when resume exists
