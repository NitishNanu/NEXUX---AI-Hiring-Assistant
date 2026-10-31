# NEXUS — AI Hiring Intelligence Platform
## High-Level Design (HLD) Document
**Version:** 2.0 | **Status:** Active Development | **Updated:** October 2026

---

## 1. System Overview

NEXUS is a full-stack, AI-powered hiring intelligence platform. It is built as a **decoupled monolith**: a FastAPI Python backend exposing a RESTful + SSE API, and a React + TypeScript + Vite frontend consuming that API. All AI intelligence flows through pluggable LLM providers (OpenAI, Google Gemini) with automatic fallback. Data is persisted in MongoDB and augmented by an in-memory FAISS vector store for RAG-based responses.

```
┌──────────────────────────────────────────────────┐
│               NEXUS SYSTEM OVERVIEW               │
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌─────────────────┐     ┌───────────────────┐  │
│   │  React Frontend │────▶│  FastAPI Backend   │  │
│   │  (Vite + TS)    │     │  (Python 3.10+)    │  │
│   └─────────────────┘     └────────┬──────────┘  │
│                                    │              │
│                     ┌──────────────┼──────────┐   │
│                     ▼              ▼          ▼   │
│              ┌──────────┐  ┌────────────┐  ┌───┐ │
│              │ MongoDB  │  │  FAISS     │  │LLM│ │
│              │ (Motor)  │  │ Vector DB  │  │API│ │
│              └──────────┘  └────────────┘  └───┘ │
└──────────────────────────────────────────────────┘
```

---

## 2. Architecture Principles

| Principle | Implementation |
|---|---|
| **Async-first** | All DB calls via Motor (async), code execution via asyncio subprocess |
| **Service Layer** | Routers → Services → Database (no business logic in routers) |
| **LLM Agnostic** | OpenAI and Gemini both via LangChain; provider selected at startup from env |
| **Fail-safe** | Static fallback data for all AI-dependent paths |
| **Stateless API** | JWT-based auth, no server-side sessions; horizontally scalable |
| **Config-driven** | All environment values from `.env` via pydantic-settings |
| **Secure by Default** | Argon2, JWT, rate limiting, input sanitization, subprocess sandbox |

---

## 3. System Components

### 3.1 Component Map

```
NEXUS Backend (FastAPI)
│
├── main.py                      # App factory, lifespan, middleware, router mounting
├── config.py                    # Settings (pydantic-settings + .env)
├── database.py                  # MongoDB Motor client + index initialization
│
├── routers/
│   ├── auth.py                  # /api/auth/* — register, login, me, resume CRUD
│   ├── resume.py                # /api/upload_resume, analyze, improve, salary, match
│   ├── ats.py                   # /api/ats_score, /api/job_match
│   ├── chat.py                  # /api/chat, /api/chat/stream, /api/interview_questions
│   ├── ingest.py                # /api/ingest — vector store knowledge ingestion
│   ├── mock_interview_enhanced.py # /api/mock-interview/* — session + question + eval
│   ├── coding.py                # /api/coding/* — problems, run, submit, analyze, stats
│   ├── mcq.py                   # /api/mcq/* — questions, submit, stats
│   └── lora.py                  # /api/lora/* — LoRA training data export (stub)
│
├── services/
│   ├── openai_service.py        # LLM singleton + text/JSON generation + answer eval
│   ├── interview_engine.py      # Question generation + answer evaluation orchestrator
│   ├── interview_repository.py  # MongoDB CRUD for sessions, questions, answers
│   ├── ats_engine.py            # ATS scoring algorithms (generic + JD-specific)
│   ├── resume_parser.py         # PDF/DOCX/TXT text extraction + section parsing
│   ├── coding_executor.py       # Subprocess code runner + static analyzer
│   ├── interview_generator.py   # Rule-based + AI interview question generation
│   ├── rag_pipeline.py          # FAISS vector store + embeddings + RAG chain
│   ├── lora_manager.py          # Training data export (stub)
│   └── auth_service.py          # JWT encode/decode, Argon2 hashing
│
└── models/
    ├── user.py                  # User, UserRegister, UserLogin, TokenResponse models
    └── interview.py             # Session, Question, Answer, Analytics Pydantic models
```

---

## 4. Backend Architecture

### 4.1 FastAPI Application Lifecycle

```
Startup (lifespan)
├── Create upload_dir and faiss_index_path directories
├── Initialize MongoDB indexes (idempotent)
├── Load FAISS vector store from disk (if exists)
└── Export LoRA training data (if configured)

Runtime
└── Uvicorn ASGI server handles concurrent async requests

Shutdown
└── Close Motor MongoDB connection
```

### 4.2 Middleware Stack

```
Request → [Rate Limiter (SlowAPI)] → [CORS Middleware] → Router → Handler
Response → [Global Exception Handler] → [CORS Headers] → Client
```

- **Rate Limiter**: Per-IP, 20 req/min on auth endpoints (configurable)
- **CORS**: Explicit origin allow-list (never wildcard with credentials)
- **Exception Handler**: Catches unhandled exceptions, returns generic 500 (no stack traces)

### 4.3 Authentication Flow

```
Client                    Backend                    MongoDB
  │                          │                          │
  │──POST /api/auth/login ──▶│                          │
  │                          │──find_one(email) ───────▶│
  │                          │◀── user doc ─────────────│
  │                          │                          │
  │                          │── verify_password()      │
  │                          │   (Argon2 constant-time) │
  │                          │                          │
  │                          │── create_access_token()  │
  │                          │   (JWT HS256, 24h)       │
  │◀──── {access_token} ────│                          │
```

### 4.4 Request Flow (Protected Endpoint)

```
Client → Bearer JWT Header
       → verify_token() dependency
           → decode_token() → extract user_id
           → (for full user) find_one(_id=ObjectId(user_id))
       → Handler logic
           → Service layer call
           → MongoDB / LLM / FAISS operation
       → JSONResponse
```

---

## 5. Data Architecture

### 5.1 MongoDB Collections

```
nexus (database)
├── users
│   ├── _id, name, email, password_hash, created_at
│   └── resume_intelligence { ats_score, resume_strength, interview_readiness, missing_skills, recommended_role }
│
├── resumes
│   ├── _id, user_id (unique index), filename
│   ├── raw_text, skills[], experience_years
│   ├── ats_score, ats_level, summary, education, projects
│   └── uploaded_at
│
├── interview_sessions
│   ├── _id, user_id, interview_type, selected_role, status
│   ├── questions[], answers[], overall_score, completed_questions
│   └── created_at, updated_at
│
├── interview_questions
│   ├── _id, session_id, category, difficulty
│   ├── question_text, why_asked, expected_traits[]
│   ├── follow_up_questions[], ai_hints[], ideal_answer
│   ├── description, constraints[], examples[]
│   ├── expected_time_complexity, expected_space_complexity
│   └── created_at
│
├── interview_answers
│   ├── _id, session_id, question_id, user_id
│   ├── answer_text, duration_seconds, score, overall_score
│   ├── feedback, strengths[], improvements[], missing_concepts[]
│   ├── communication, technical_depth, confidence, problem_solving
│   ├── leadership, clarity, correctness, star_format_adherence
│   └── created_at
│
├── coding_problems
│   ├── _id, title, description, difficulty, category, tags[]
│   ├── constraints[], examples[], test_cases[]
│   ├── expected_time_complexity, expected_space_complexity
│   ├── solution_template {language: code}, ai_hints[]
│   └── created_at
│
├── coding_submissions
│   ├── _id, session_id, problem_id, user_id
│   ├── code, language, duration_seconds
│   ├── test_results {}, evaluation {}
│   ├── passed_tests, total_tests, overall_score
│   └── created_at
│
├── mcq_questions
│   ├── _id, question, options[], correct_option_index
│   ├── explanation, category, difficulty, topic
│   └── created_at
│
├── mcq_attempts
│   ├── _id, session_id, question_id, user_id
│   ├── selected_option, correct_option, is_correct
│   ├── duration_seconds, explanation, topic, difficulty
│   └── created_at
│
├── interview_analytics          # Per-user aggregated analytics (unique on user_id)
└── interview_session_stats      # Per-session stats (time-series)
```

### 5.2 MongoDB Index Strategy

| Collection | Indexes |
|---|---|
| users | `email` (unique) |
| resumes | `user_id` (unique) |
| interview_sessions | `user_id`, `created_at`, `(user_id, created_at DESC)`, `status`, `interview_type` |
| interview_questions | `session_id`, `category`, `difficulty`, `(session_id, created_at DESC)` |
| interview_answers | `session_id`, `question_id`, `user_id`, `(session_id, created_at DESC)` |
| coding_submissions | `session_id`, `problem_id`, `user_id`, `(user_id, created_at DESC)` |
| mcq_questions | `category`, `difficulty`, `topic` |
| mcq_attempts | `session_id`, `question_id`, `(session_id, created_at DESC)` |
| coding_problems | `difficulty`, `category`, `tags` |
| interview_analytics | `user_id` (unique), `updated_at` |
| interview_session_stats | `user_id`, `(user_id, date DESC)` |

---

## 6. AI and ML Architecture

### 6.1 LLM Provider Strategy

```
Settings.llm_provider resolution (priority order):
1. OpenAI (if OPENAI_API_KEY set)
   └── Model: configurable via OPENAI_MODEL env var
2. Google Gemini (if GOOGLE_API_KEY set)
   └── Model: configurable via GEMINI_MODEL env var
3. None → RuntimeError (startup warning, non-fatal for non-AI endpoints)
```

Both providers are wrapped by LangChain, making them interchangeable.

### 6.2 OpenAI Service Architecture

```
OpenAIService
├── _get_llm_instance()         # Module-level LLM singleton
├── generate_text(prompt)       # asyncio.to_thread(llm.invoke) — non-blocking
├── generate_json(prompt)       # generate_text → JSON extraction with fence stripping
├── evaluate_answer(q, a, i)   # Multi-dimensional scoring prompt
├── generate_interview_question # Role + category + context + weak areas
├── generate_coding_hints       # Progressive hints without solutions
└── generate_ai_insights        # Personalized analytics insights
```

**JSON Extraction Pipeline** (handles LLM quirks):
1. Strip markdown code fences (```json...```)
2. Try direct `json.loads()`
3. Regex extract first `{...}` block
4. Raise `ValueError` if all attempts fail

### 6.3 Interview Engine Architecture

```
InterviewEngine
├── generate_behavioral_question(context, role, weak_topics)
├── generate_technical_question(context, role, weak_topics)
├── generate_coding_question(context, role, difficulty)
├── generate_system_design_question(context, role)
├── generate_mcq_question(context, topic, difficulty)
├── evaluate_answer(question, user_answer, type) → 8-dim scores
├── evaluate_coding_answer(problem, code, test_results)
└── Fallback static data for all question types (LLM unavailable)
```

### 6.4 ATS Scoring Engine

```
ATS Score Computation (JD-specific):
┌─────────────────────────────────────────────────┐
│  Skill Match (40%)  = matched_skills / jd_skills│
│  Keyword Match (30%)= TF-IDF top-30 overlap     │
│  Experience (20%)   = resume_yrs / jd_yrs       │
│  Semantic (10%)     = cosine(TF-IDF vectors)    │
│                                                 │
│  Composite = Σ(weight × component_score) × 100  │
└─────────────────────────────────────────────────┘

Generic ATS (no JD):
├── Word count scoring (length heuristic)
├── Skill count scoring
├── Section presence check (regex)
├── Action verb count
└── Quantification detection (numbers, %, $)
```

### 6.5 RAG Pipeline Architecture

```
Knowledge Ingestion:
Documents → RecursiveCharacterTextSplitter (1000/200)
         → Embedding Model (OpenAI/Gemini/HuggingFace)
         → FAISS.from_texts / add_texts
         → Saved to disk (./data/faiss_index/)

Query/Chat:
User Query → FAISS.similarity_search_with_score (top-5)
           → [Resume context prepended if available]
           → HR_SYSTEM_PROMPT.format(context, history, question)
           → LLM.invoke(prompt)
           → Response + retrieved sources + context_used count

Embedding Priority:
1. OpenAI text-embedding-3-small (if OPENAI_API_KEY)
2. Google Generative AI embedding-001 (if GOOGLE_API_KEY)
3. HuggingFace sentence-transformers/all-MiniLM-L6-v2 (local fallback)
```

### 6.6 Code Execution Engine Architecture

```
CodingExecutor.execute_code(code, language, test_cases)
│
├── Validate language (supported / unsupported / unknown)
├── Write user code to temp file (NamedTemporaryFile)
├── Write harness to temp file (Python or JS harness)
├── For each test_case:
│   ├── Serialize stdin: json.dumps({func, args, kwargs})
│   ├── asyncio.create_subprocess_exec(runner, harness, code_file)
│   ├── asyncio.wait_for(communicate(stdin), timeout=5s)
│   ├── On timeout: proc.kill()
│   └── Compare stdout to expected (JSON-parsed, then string)
└── finally: Path.unlink(missing_ok=True) for both temp files

Python Harness:
└── importlib.util.spec_from_file_location → exec_module
    → read stdin JSON → call function → print(json.dumps(result))

JS Harness:
└── require() + eval() in sandboxed closure
    → stdin data handler → call function → stdout JSON
```

---

## 7. Frontend Architecture

### 7.1 Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router DOM v6 |
| State Management | Zustand (auth store, nexus store) |
| UI Components | Custom components + Lucide React icons |
| Animations | Framer Motion, GSAP, Three.js/R3F |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| Charts | Recharts |
| HTTP Client | Axios |
| Styling | Tailwind CSS v3 |
| Forms | React Hook Form |
| Notifications | React Hot Toast |

### 7.2 Application Structure

```
frontend/src/
├── App.tsx                      # BrowserRouter, route definitions, auth event listener
├── main.tsx                     # React DOM root, StrictMode
├── index.css                    # Global styles, Tailwind base, custom tokens
│
├── pages/
│   ├── LoginPage.tsx            # Public: email/password login form
│   ├── SignupPage.tsx           # Public: registration form
│   ├── Dashboard.tsx            # Protected: main overview + quick actions
│   ├── ResumeLab.tsx            # Protected: resume upload + analysis
│   ├── AtsCheckerPage.tsx       # Protected: ATS scoring interface
│   ├── JobAnalyzerPage.tsx      # Protected: JD vs resume matching
│   ├── InterviewPrepEnhanced.tsx# Protected: interview setup + session config
│   ├── MockInterviewEnhanced.tsx# Protected: live mock interview UI (largest: 40KB)
│   ├── AnalyticsDashboard.tsx   # Protected: interview analytics + charts
│   ├── Workspace.tsx            # Protected: HR AI chatbot workspace
│   └── Settings.tsx             # Protected: user settings
│
├── components/
│   ├── auth/ProtectedRoute.tsx  # Route guard (checks auth store)
│   ├── background/NexusBackground.tsx # Three.js/particle background
│   ├── layout/NexusShell.tsx    # App shell: sidebar + header + main content area
│   ├── SplashScreen.tsx         # Initial loading animation
│   ├── ErrorBoundary.tsx        # React error boundary wrapper
│   ├── OnboardingChecklist.tsx  # New user onboarding guide
│   ├── interview/               # Interview session components
│   ├── resume/                  # Resume panel components
│   ├── chat/                    # Chat interface components
│   ├── jd/                      # Job description input components
│   ├── panels/                  # Feature panel components
│   └── ui/                      # Shared UI primitives
│
├── store/
│   ├── authStore.ts             # Zustand: user, token, login(), logout()
│   └── nexusStore.ts            # Zustand: resume data, global UI state
│
├── context/
│   └── AppContext.tsx           # React Context: shared app state (below auth)
│
├── api/                         # Axios API client instances
├── services/                    # Frontend service wrappers for backend API
└── hooks/                       # Custom React hooks
```

### 7.3 Routing Architecture

```
BrowserRouter
└── Root component
    ├── /login    → LoginPage    (public)
    ├── /signup   → SignupPage   (public)
    └── /*        → ProtectedRoute
                      └── AppProvider
                          └── NexusShell (sidebar + header)
                              └── ErrorBoundary
                                  └── Suspense (lazy loaded pages)
                                      ├── /              → Dashboard
                                      ├── /resume-parser → ResumeLab
                                      ├── /ats-checker   → AtsCheckerPage
                                      ├── /jd-matching   → JobAnalyzerPage
                                      ├── /interview-prep→ InterviewPrepEnhanced
                                      ├── /mock-interview→ MockInterviewEnhanced
                                      ├── /analytics     → AnalyticsDashboard
                                      ├── /hr-assistant  → Workspace
                                      └── /settings      → Settings
```

### 7.4 State Management

```
Auth State (Zustand - authStore)
├── user: UserOut | null
├── token: string | null
├── isAuthenticated: boolean
├── login(token, user)
└── logout()

App State (Zustand - nexusStore)
├── resumeData: ResumeData | null
├── setResumeData(data)
└── [other UI state flags]

Global Event: 'nexus:unauthorized'
└── Dispatched by Axios interceptor on 401
└── Listened in Root → triggers logout() + clearResumeData()
```

---

## 8. Security Architecture

### 8.1 Authentication and Authorization

```
Password Storage:    Argon2 hashing (not bcrypt — stronger against GPU attacks)
Token Format:        JWT HS256 with configurable secret (min 32 chars)
Token Expiry:        24 hours (configurable via JWT_EXPIRE_MINUTES)
Token Transmission:  Authorization: Bearer <token> header only
Anti-enumeration:    Login always returns same error message regardless of cause
Rate Limiting:       SlowAPI on /register and /login (20 req/min/IP)
```

### 8.2 File Upload Security

```
Resume Upload Validation:
1. Extension check → must be in {pdf, docx, doc, txt}
2. Size check → read max_upload_bytes+1; if len > limit → 413
3. Parse attempt → wrapped in try/except → 422 on failure
4. No server-side storage of raw bytes (only parsed text)
```

### 8.3 LLM Prompt Injection Prevention

```
_sanitize_prompt_input(text, max_chars=3000):
├── All user-supplied text length-capped before injection
├── Resume text: 2000 chars max in prompts
├── Question text: 500 chars max
└── Ideal answer: 1000 chars max
```

### 8.4 Code Execution Sandbox

```
Security Layers:
1. User code → temp file (never eval/exec in-process)
2. Subprocess runs with OS-level isolation
3. stdin-based test input → eliminates argument injection
4. Hard timeout (5s per test case) → no infinite loops
5. Temp files deleted in finally block → no persistence
6. eval()/exec() in user code flagged by static analyzer (warning)
```

### 8.5 CORS Configuration

```
CORS Policy:
├── allow_origins: explicit list from CORS_ORIGINS env var
├── allow_credentials: True (cookie + auth headers)
├── allow_methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
├── allow_headers: Authorization, Content-Type, Accept
└── expose_headers: X-Request-ID

Note: allow_origins CANNOT be ["*"] when allow_credentials=True
      (browser spec violation → browser blocks the response)
```

---

## 9. Data Flow Diagrams

### 9.1 Resume Upload and ATS Scoring Flow

```
Client                   Auth Router           Resume Parser    ATS Engine       MongoDB
  │                          │                      │               │               │
  │── POST /api/auth/resume ▶│                      │               │               │
  │   Bearer JWT + file      │                      │               │               │
  │                          │── verify_token() ───▶│               │               │
  │                          │── validate file      │               │               │
  │                          │── read(max+1 bytes)  │               │               │
  │                          │── parse_resume() ───▶│               │               │
  │                          │◀── parsed{} ─────────│               │               │
  │                          │── compute_generic ──────────────────▶│               │
  │                          │◀── ats{} ────────────────────────────│               │
  │                          │── resumes.update_one(upsert) ──────────────────────▶│
  │                          │◀── ok ──────────────────────────────────────────────│
  │◀── {message, parsed, ats}│
```

### 9.2 Mock Interview Question Flow

```
Client              Interview Router      Interview Engine    OpenAI Service    MongoDB
  │                        │                    │                  │               │
  │── GET /question/{id} ─▶│                    │                  │               │
  │                        │── get_session() ──────────────────────────────────── ▶│
  │                        │◀── session{} ──────────────────────────────────────── │
  │                        │── get resume ──────────────────────────────────────── ▶│
  │                        │◀── resume{} ───────────────────────────────────────── │
  │                        │                    │                  │               │
  │                        │── generate_*_question(ctx, role) ─── ▶│               │
  │                        │                    │── generate_json ▶│               │
  │                        │                    │◀── question{} ───│               │
  │                        │◀── question{} ─────│                  │               │
  │                        │── save_question() ─────────────────────────────────── ▶│
  │                        │◀── question_id ──────────────────────────────────────  │
  │◀── {id, questionText, hints, ...}
```

### 9.3 RAG Chat Flow

```
Client           Chat Router       RAG Pipeline          FAISS           LLM (OpenAI/Gemini)
  │                  │                  │                   │                    │
  │── POST /chat ───▶│                  │                   │                    │
  │   {message, history, resume_ctx}    │                   │                    │
  │                  │── chat_with_rag()▶│                   │                    │
  │                  │                  │── similarity_search(query, k=5) ──────▶│
  │                  │                  │◀── [(doc, score)] ─│                    │
  │                  │                  │── build prompt     │                    │
  │                  │                  │   (resume_ctx + retrieved + history)    │
  │                  │                  │── llm.invoke(prompt) ──────────────────▶│
  │                  │                  │◀── response ───────────────────────────│
  │                  │◀── {answer, sources, context_used}                        │
  │◀── JSON response │
```

---

## 10. Backend Improvement Plan (Next Level)

> The following improvements are prioritized to take the backend to production-grade quality.

### 10.1 Critical Improvements (High Priority)

#### 10.1.1 Response Model Standardization
**Problem**: Most routers return raw `dict` without Pydantic `response_model`. This means no schema validation on responses, no auto-generated OpenAPI response docs, and potential field leakage.

**Fix**: Add `response_model=` to all router endpoints. Create explicit response schemas in `models/`.

```python
# Before (current)
@router.post("/start")
async def start_interview(request: dict, ...):
    return {"session_id": ..., "status": ...}

# After (improved)
class StartInterviewResponse(BaseModel):
    session_id: str
    user_id: str
    interview_type: str
    selected_role: str
    has_resume: bool
    status: str
    created_at: str

@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(request: StartInterviewRequest, ...):
    ...
```

#### 10.1.2 Request Body Typing (Remove `dict` parameters)
**Problem**: Multiple endpoints accept `request: dict` instead of typed Pydantic models.

**Fix**: Replace all `request: dict` with explicit Pydantic request models.

```python
# Before
async def start_interview(request: dict, ...):
    interview_type = request.get("interview_type", "sde")

# After
class StartInterviewRequest(BaseModel):
    interview_type: InterviewType = InterviewType.SDE
    selected_role: str = "Software Engineer"

async def start_interview(request: StartInterviewRequest, ...):
    interview_type = request.interview_type
```

#### 10.1.3 Dependency Injection for DB
**Problem**: `get_db()` called inside handler bodies — hard to test and mock.

**Fix**: Use FastAPI `Depends(get_db)` pattern consistently.

```python
# After
async def get_next_question(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
):
```

#### 10.1.4 Centralized Error Handling
**Problem**: Exception handling is inconsistent (some bare `except Exception`, some typed).

**Fix**: Create custom exception hierarchy + centralized handlers.

```python
# New: backend/exceptions.py
class NexusError(Exception): ...
class SessionNotFoundError(NexusError): ...
class UnauthorizedError(NexusError): ...
class LLMUnavailableError(NexusError): ...

# In main.py
@app.exception_handler(SessionNotFoundError)
async def handle_not_found(request, exc):
    return JSONResponse(status_code=404, content={"detail": str(exc)})
```

#### 10.1.5 LLM Call Retry Logic
**Problem**: Single LLM call failure immediately serves fallback data.

**Fix**: Add exponential backoff retry (up to 3 attempts) before falling back.

```python
import tenacity

@tenacity.retry(
    stop=tenacity.stop_after_attempt(3),
    wait=tenacity.wait_exponential(min=1, max=8),
    reraise=False
)
async def generate_with_retry(self, prompt: str) -> str:
    return await self._ai.generate_text(prompt)
```

### 10.2 Architecture Improvements (Medium Priority)

#### 10.2.1 Background Task Queue for AI Operations
**Problem**: AI evaluation calls block the request thread for 3-8 seconds.

**Fix**: Use FastAPI `BackgroundTasks` or a Celery/ARQ queue for async evaluation.

```python
@router.post("/submit-answer")
async def submit_answer(
    request: SubmitAnswerRequest,
    background_tasks: BackgroundTasks,
    ...
):
    # Save answer immediately
    answer_id = await InterviewRepository.save_answer_pending(...)
    # Evaluate in background
    background_tasks.add_task(evaluate_and_update, answer_id, question, answer_text)
    return {"answer_id": answer_id, "status": "evaluating"}
```

#### 10.2.2 Caching Layer
**Problem**: No caching for frequently re-fetched data (user analytics, MCQ topics).

**Fix**: Add Redis-backed caching for analytics and static lookups.

```python
# backend/cache.py
import redis.asyncio as aioredis

async def get_cached_analytics(user_id: str) -> dict | None:
    val = await redis.get(f"analytics:{user_id}")
    return json.loads(val) if val else None

async def set_cached_analytics(user_id: str, data: dict, ttl: int = 300):
    await redis.setex(f"analytics:{user_id}", ttl, json.dumps(data))
```

#### 10.2.3 Structured Logging
**Problem**: All logging is `print()` — no log levels, no structured format, not parseable.

**Fix**: Replace with Python `logging` + structured JSON output.

```python
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "module": record.module,
            "message": record.getMessage(),
        })

# Usage in services
logger = logging.getLogger(__name__)
logger.info("Interview session started", extra={"session_id": sid, "user_id": uid})
```

#### 10.2.4 API Versioning
**Problem**: All endpoints are on `/api/*` with no versioning — breaking changes affect all clients.

**Fix**: Add version prefix: `/api/v1/*` and `/api/v2/*` for future migrations.

```python
# main.py
from fastapi import APIRouter
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(auth_router)
v1_router.include_router(interview_router)
app.include_router(v1_router)
```

#### 10.2.5 Pagination for All List Endpoints
**Problem**: Several endpoints fetch `.to_list(None)` — unbounded queries.

**Fix**: Add cursor-based pagination to all list endpoints.

```python
class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
    cursor: str | None = None

@router.get("/history", response_model=PaginatedResponse[SessionSummary])
async def get_history(pagination: PaginationParams = Depends(), ...):
    skip = (pagination.page - 1) * pagination.limit
    sessions = await db.interview_sessions.find(
        {"user_id": user_id}
    ).skip(skip).limit(pagination.limit).to_list(None)
    total = await db.interview_sessions.count_documents({"user_id": user_id})
    return PaginatedResponse(data=sessions, total=total, page=pagination.page)
```

### 10.3 Completeness Improvements (Medium Priority)

#### 10.3.1 Coding Problem Seed Data Script
**Problem**: `coding_problems` collection starts empty — no problems to solve.

**Fix**: Create `backend/scripts/seed_problems.py` with 50+ curated problems.

#### 10.3.2 MCQ Question Seed Data Script
**Problem**: `mcq_questions` collection starts empty — no questions to attempt.

**Fix**: Create `backend/scripts/seed_mcq.py` with 200+ questions across DSA, System Design, OS, DB, Networks.

#### 10.3.3 Knowledge Base Seed Content
**Problem**: FAISS vector store starts empty — RAG chatbot has no knowledge.

**Fix**: Create `backend/scripts/seed_knowledge_base.py` with curated HR/interview guides.

#### 10.3.4 Multi-Language Code Execution
**Problem**: Java, C++, Go, Rust are stubs — unsupported for execution.

**Fix**: Add container-based execution (Docker subprocess) for additional languages.

```python
# backend/services/container_executor.py
async def execute_in_docker(code: str, language: str, test_cases: list):
    """Run code in isolated Docker container with time + memory limits."""
    container_image = LANGUAGE_IMAGES[language]
    # docker run --memory=128m --cpus=0.5 --timeout=10 image stdin_payload
```

### 10.4 Testing Improvements (High Priority)

#### 10.4.1 Unit Test Coverage
**Current state**: `backend/tests/` directory exists but coverage is unclear.

**Target**: 80%+ coverage on:
- `ats_engine.py` (deterministic scoring algorithms — easy to test)
- `resume_parser.py` (text extraction + section parsing)
- `coding_executor.py` (test case evaluation logic)
- `auth_service.py` (JWT encode/decode, password hashing)
- `openai_service.py` (JSON extraction, prompt sanitization)

#### 10.4.2 Integration Tests
```python
# backend/tests/test_interview_flow.py
async def test_full_interview_flow(test_client, auth_token):
    # 1. Start session
    res = await test_client.post("/api/mock-interview/start", ...)
    session_id = res.json()["session_id"]

    # 2. Get question
    res = await test_client.get(f"/api/mock-interview/question/{session_id}", ...)
    question_id = res.json()["id"]

    # 3. Submit answer
    res = await test_client.post("/api/mock-interview/submit-answer", ...)
    assert res.json()["overall_score"] >= 0

    # 4. End session
    res = await test_client.post(f"/api/mock-interview/end/{session_id}", ...)
    assert res.json()["completed"] is True
```

---

## 11. Technology Stack Summary

### 11.1 Backend

| Component | Technology | Version |
|---|---|---|
| Web Framework | FastAPI | 0.110+ |
| ASGI Server | Uvicorn | 0.29+ |
| Data Validation | Pydantic v2 | 2.7+ |
| MongoDB Driver | Motor (async) | 3.4+ |
| LLM Framework | LangChain | 0.3+ |
| LLM Providers | OpenAI / Google Gemini | Latest |
| Vector Store | FAISS (faiss-cpu) | 1.7+ |
| Embeddings | OpenAI / Gemini / HuggingFace | Latest |
| Auth | python-jose + Argon2 | Latest |
| Rate Limiting | SlowAPI | 0.1.9+ |
| PDF Parsing | PyPDF2 | 3.0+ |
| DOCX Parsing | python-docx | 1.1+ |
| ML Utilities | scikit-learn, numpy | 1.5+, 1.26+ |
| Config | pydantic-settings + dotenv | 2.2+ |

### 11.2 Frontend

| Component | Technology | Version |
|---|---|---|
| Framework | React | 18.3 |
| Language | TypeScript | 5.7 |
| Build Tool | Vite | 5.4 |
| Routing | React Router DOM | 6.28 |
| State | Zustand | 5.0 |
| Animation | Framer Motion | 11.15 |
| 3D Graphics | Three.js + React Three Fiber | 0.163 / 8.17 |
| Code Editor | Monaco Editor | 4.6 |
| Charts | Recharts | 2.15 |
| HTTP | Axios | 1.7 |
| CSS | Tailwind CSS | 3.4 |
| Icons | Lucide React | 0.468 |

---

## 12. Configuration Reference

### 12.1 Environment Variables (`.env`)

```ini
# LLM Providers (at least one required)
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...

# Model selection (optional, uses defaults if not set)
OPENAI_MODEL=gpt-4o
GEMINI_MODEL=gemini-2.0-flash

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=nexus

# JWT
JWT_SECRET=your-minimum-32-character-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# File paths
FAISS_INDEX_PATH=./data/faiss_index
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_BYTES=10485760

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate limiting
AUTH_RATE_LIMIT=20/minute

# Feature flags
SKIP_VECTOR_STORE=false
SKIP_LORA_EXPORT=false
```

---

## 13. Known Issues and Technical Debt

| Issue | Severity | Area |
|---|---|---|
| Routers accept `request: dict` — no request body validation | High | All routers |
| No Pydantic `response_model` on most endpoints | High | All routers |
| `print()` used for all logging | Medium | All services |
| `get_db()` called inside handlers (not injected) | Medium | All routers |
| No retry logic for LLM calls | Medium | openai_service |
| Unbounded DB queries (`.to_list(None)`) | Medium | analytics, history |
| No pagination on list endpoints | Medium | history, problems |
| Coding problem bank is empty (no seed data) | High | coding module |
| MCQ question bank is empty (no seed data) | High | MCQ module |
| FAISS knowledge base empty (no seed content) | High | RAG pipeline |
| LoRA module is a stub | Low | lora router/manager |
| JavaScript code execution uses `eval()` in harness | Medium | coding_executor |
| No unit tests for most services | High | Tests |
| `ai_confidence: 72` hardcoded in resume-intelligence endpoint | Low | mock_interview router |
| Resume `one-per-user` constraint may not suit all use cases | Low | auth/resume router |
