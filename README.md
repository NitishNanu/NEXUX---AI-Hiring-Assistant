# NEXUS — AI Hiring & Interview Intelligence

An enterprise-grade AI hiring platform featuring personalized mock interviews, coding challenges with code execution & static analysis, comprehensive MCQ assessments, RAG-powered HR assistance, ATS resume scoring, and performance analytics.

For comprehensive architectural and product specifications, refer to:
- 📄 [**Product Requirements Document (PRD.md)**](PRD.md)
- 🏗️ [**High-Level Design Document (HLD.md)**](HLD.md)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm
- **MongoDB** (running locally or MongoDB Atlas connection URI)
- **OpenAI API Key** or **Google Gemini API Key**

---

### 1. Backend Setup

```bash
# 1. Create and activate a Python virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows (PowerShell / Command Prompt)
# source .venv/bin/activate  # macOS / Linux

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and supply your MONGODB_URL and OPENAI_API_KEY (or GOOGLE_API_KEY)

# 4. Seed database and knowledge base (run once)
python -m backend.scripts.seed_all

# 5. Start the FastAPI server
python -m uvicorn backend.main:app --reload --port 8000
```

FastAPI interactive documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Frontend Setup

```bash
cd frontend

# 1. Install frontend packages
npm install

# 2. Start the Vite development server
npm run dev
```

The frontend will run at **http://localhost:5173**.

---

## 📁 Repository Structure

```
Nexux---AI-hiring-Intelligence-main/
├── PRD.md                         # Complete Product Requirements Document
├── HLD.md                         # Complete High-Level Design & System Architecture
├── README.md                      # Project Overview & Local Development Guide
├── .env.example                   # Environment configuration template
│
├── backend/                       # FastAPI Backend
│   ├── main.py                    # Application entry point, CORS, middleware, exception handlers
│   ├── config.py                  # Pydantic Settings management
│   ├── database.py                # Async Motor MongoDB client & index initialization
│   ├── exceptions.py              # Centralized domain exception hierarchy
│   ├── logger.py                  # Structured JSON logger with standard extra parameter support
│   ├── requirements.txt           # Python package requirements
│   │
│   ├── models/                    # Pydantic data models & request/response schemas
│   │   ├── user.py                # User registration, login, and profile models
│   │   ├── interview.py           # Session, question, coding, and submission models
│   │   └── interview_api.py       # Strict request/response schemas for interview endpoints
│   │
│   ├── routers/                   # Modular API routers
│   │   ├── auth.py                # Authentication, JWT, and resume profile management
│   │   ├── mock_interview_enhanced.py # AI mock interview lifecycle & answer evaluation
│   │   ├── coding.py              # Coding challenges, test runner, analysis, pagination
│   │   ├── mcq.py                 # Multiple-choice assessments, batching, pagination
│   │   ├── ats.py                 # ATS resume scoring & JD matching
│   │   ├── chat.py                # RAG chatbot & question generation
│   │   ├── ingest.py              # Document ingestion to FAISS vector store
│   │   └── lora.py                # LoRA fine-tuning dataset management
│   │
│   ├── services/                  # Business logic & AI orchestration
│   │   ├── openai_service.py      # LLM integration (OpenAI/Gemini) with tenacity retries
│   │   ├── interview_engine.py    # Multi-dimensional interview evaluation engine
│   │   ├── interview_repository.py# Async database queries for interview sessions
│   │   ├── coding_executor.py     # Subprocess test case runner & static analysis
│   │   ├── ats_engine.py          # Weighted ATS scoring & semantic matching
│   │   ├── rag_pipeline.py        # FAISS vector store & retrieval augmented generation
│   │   └── resume_parser.py       # PDF/DOCX text & skill extraction
│   │
│   └── scripts/                   # Database seed scripts
│       ├── seed_all.py            # Master runner for all seed data
│       ├── seed_problems.py       # Coding problems (Easy to Expert)
│       ├── seed_mcq.py            # Technical & behavioral MCQ question bank
│       └── seed_knowledge_base.py # Curated HR knowledge documents for FAISS
│
└── frontend/                      # React + TypeScript + Vite Frontend
    ├── index.html                 # Single page application root
    ├── package.json               # Node.js dependencies & scripts
    ├── vite.config.ts             # Vite configuration with API proxy
    └── src/                       # Application source code
        ├── api/                   # API clients and HTTP endpoints
        ├── components/            # Reusable UI components & 3D canvases
        ├── context/               # Authentication & application context
        ├── pages/                 # Full-page route views
        └── store/                 # Zustand state management
```

---

## 🔑 Key API Modules

| Module | Prefix | Core Functionality |
|---|---|---|
| **Authentication** | `/api/auth` | User registration, login, token verification, resume storage |
| **Mock Interviews** | `/api/mock-interview` | Start sessions, resume intelligence, submit answers, session analytics |
| **Coding Engine** | `/api/coding` | Paginated problems list, code execution test harness, static analysis |
| **MCQ Assessments** | `/api/mcq` | Paginated questions, topic batching, submission evaluation, statistics |
| **ATS & Matching** | `/api` | Resume ATS scoring, JD gap analysis, skill breakdown |
| **RAG HR Chat** | `/api/chat` | Contextual conversational agent grounded in HR knowledge base |
| **Knowledge Ingestion** | `/api/ingest` | FAISS vector store document ingestion |

---

## 🧪 Testing

To run backend tests locally:
```bash
pytest backend/tests/ -v
```
