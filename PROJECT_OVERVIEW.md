# 🤖 AI Hiring Assistant - Complete Project Overview

**A comprehensive AI-powered HR platform for intelligent resume analysis, job matching, and candidate assessment.**

---

## 📋 Executive Summary

The **AI Hiring Assistant** is a full-stack web application that combines artificial intelligence, machine learning, and retrieval-augmented generation (RAG) to automate and enhance the recruitment process. It empowers HR professionals, recruiters, and candidates with intelligent tools for resume screening, job matching, interview preparation, and candidate assessment.

**Key Value Proposition:**
- ⚡ **Speed**: Analyze resumes in seconds instead of minutes
- 🎯 **Accuracy**: AI-powered deep analysis vs. keyword matching
- 🧠 **Intelligence**: Context-aware recommendations using LLMs
- 📊 **Transparency**: Detailed scoring breakdowns and explanations
- 🔧 **Customizable**: Works with multiple LLM providers (OpenAI, Azure, Google)

---

## 🎯 Core Features

### 1. **Smart Resume Analysis**
- **File Format Support**: PDF, DOCX, TXT
- **Data Extraction**: 
  - Technical skills identification (80+ common technologies)
  - Years of experience estimation
  - Education and certifications
  - Projects and achievements
  - Summary and professional profile
- **Quick ATS Score**: Heuristics-based scoring (generic)
- **Feedback & Suggestions**: Actionable recommendations for improvement

### 2. **ATS Scoring & Job Matching**
- **Generic ATS**: Heuristic-based scoring using word count, skills presence, section completeness
- **JD-Specific ATS**: Sophisticated 4-component weighted scoring:
  - **Skill Match** (40%): Direct skill overlap between resume and job description
  - **Keyword Match** (30%): TF-IDF-based keyword frequency analysis
  - **Experience Match** (20%): Years of experience alignment
  - **Semantic Similarity** (10%): Advanced NLP-based document similarity
- **Detailed Breakdown**: Component scores, matched/missing skills, optimization suggestions
- **Match Levels**: Not Qualified, Partially Qualified, Well Qualified, Overqualified

### 3. **RAG-Powered HR Chatbot**
- **Context Awareness**: Understands resume context and job requirements
- **Document Ingestion**: Upload company HR policies, interview guides, training materials
- **Vector Search**: FAISS-based semantic search across ingested documents
- **Citation Support**: Sources and references for chatbot answers
- **Conversation History**: Multi-turn conversations with message management
- **Smart Intent Detection**: Automatically routes interview questions or HR queries

### 4. **Automated Interview Question Generation**
- **Two-Layer Approach**:
  - **LLM-Powered**: High-quality, contextual questions using GPT-5.4-2026-03-05/Gemini
  - **Rule-Based Fallback**: Ensures questions even if LLM unavailable
- **Question Types**:
  - Technical questions (based on resume skills)
  - Behavioral questions (STAR method)
  - Situational questions (scenario-based)
  - Culture-fit questions
- **Assessment Guidelines**: Follow-up questions and evaluation criteria

### 5. **LoRA Fine-Tuning Framework**
- **Pre-built Training Data**: 5 HR-specific instruction-output pairs
- **Configuration Templates**: Recommended hyperparameters (r=16, lora_alpha=32)
- **Training Scripts**: Ready-to-run Python scripts for local GPU fine-tuning
- **Target Model**: Llama-2-7b with HR specialization
- **Data Export**: JSONL format for custom training

### 6. **Analytics & Visualization**
- **ATS Ring Chart**: Circular progress indicator with score breakdown
- **Skill Pills**: Visual representation of matched/missing skills
- **Match Analysis**: Gap identification and improvement roadmap
- **Real-time Processing**: Immediate feedback on uploads

---

## 🏗️ Architecture Overview

### **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (React + Vite)                        │
│  - Landing Page (Marketing)                                 │
│  - Workspace Dashboard (Multi-panel responsive layout)      │
│  - Resume Upload & Analysis                                 │
│  - Job Description Input                                    │
│  - Chat Interface                                           │
│  - Interview Question Display                               │
│  - Analytics & Visualizations                               │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST APIs
                         │ JSON Payloads
                         ↓
┌─────────────────────────────────────────────────────────────┐
│        Backend (FastAPI + Python)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Route Handlers (Routers)                            │  │
│  │  - resume.py: Upload, parse, analyze                 │  │
│  │  - ats.py: Score and match algorithms                │  │
│  │  - chat.py: RAG chatbot & interviews                 │  │
│  │  - ingest.py: Document ingestion                     │  │
│  │  - lora.py: Fine-tuning configuration                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Service Layer (Business Logic)                      │  │
│  │  - resume_parser.py: Text extraction & parsing       │  │
│  │  - ats_engine.py: Scoring algorithms                 │  │
│  │  - rag_pipeline.py: Vector DB & retrieval            │  │
│  │  - interview_generator.py: Q&A generation            │  │
│  │  - lora_manager.py: Training data & scripts          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   LLM APIs   │  │  Vector DB   │  │   Storage    │
│              │  │              │  │              │
│ • OpenAI     │  │ • FAISS      │  │ • Local FS   │
│ • Azure      │  │   (Local)    │  │   uploads/   │
│ • Google     │  │   CPU        │  │ • indexes/   │
│              │  │              │  │ • training/  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### **Frontend Directory Structure**

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx         # Marketing landing page
│   │   ├── Workspace.jsx       # Main dashboard (responsive multi-panel)
│   │   └── AiWorkspace.jsx     # Alternative workspace variant
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx    # Grid-based responsive layout
│   │   │   └── Sidebar.jsx     # Navigation menu
│   │   ├── chat/
│   │   │   ├── ChatCore.jsx    # Message display & input handling
│   │   │   ├── ChatShell.jsx   # Chat container
│   │   │   ├── MessageBubble.jsx # Individual message rendering
│   │   │   └── QuickActions.jsx # Suggested prompts
│   │   ├── resume/
│   │   │   ├── DropZone.jsx    # Drag-drop upload area
│   │   │   ├── ResumePanel.jsx # Results display
│   │   │   ├── AtsScoreRing.jsx# Circular score visualization
│   │   │   └── SkillPill.jsx   # Skill badge component
│   │   ├── jd/
│   │   │   └── JdAnalyzer.jsx  # Job description input & analysis
│   │   ├── ui/
│   │   │   ├── GlassCard.jsx   # Reusable card component
│   │   │   ├── Badge.jsx       # Status/skill badge
│   │   │   ├── CollapsibleSection.jsx # Expandable sections
│   │   │   └── Spinner.jsx     # Loading indicator
│   │   ├── ModernHeader.jsx    # App header
│   │   ├── FloatingDock.jsx    # Floating action menu
│   │   ├── FileUpload.jsx      # Upload handler
│   │   ├── SmartInsights.jsx   # Insights dashboard
│   │   └── BackgroundMesh.jsx  # Animated background
│   ├── context/
│   │   └── AppContext.jsx      # Global state management
│   ├── hooks/
│   │   ├── useChat.js          # Chat logic hook
│   │   └── useResume.js        # Resume upload hook
│   ├── services/
│   │   ├── api.js              # API exports
│   │   ├── client.js           # Axios configuration
│   │   ├── chat.js             # Chat endpoints
│   │   └── resume.js           # Resume endpoints
│   ├── App.jsx                 # Root component
│   └── main.jsx                # Entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.cjs
```

### **Backend Directory Structure**

```
backend/
├── main.py                     # FastAPI app setup, CORS, middleware
├── config.py                   # Environment config, LLM selection
├── routers/
│   ├── __init__.py
│   ├── resume.py              # POST /upload_resume, /analyze_resume
│   ├── ats.py                 # POST /ats_score, /job_match
│   ├── chat.py                # POST /chat, /interview_questions
│   ├── ingest.py              # POST /ingest, /ingest_text
│   └── lora.py                # GET /lora/*, POST /lora/export
├── services/
│   ├── __init__.py
│   ├── resume_parser.py       # Extract text, identify sections, extract skills
│   ├── ats_engine.py          # Scoring algorithm (generic + JD-specific)
│   ├── rag_pipeline.py        # Vector store, embedding, retrieval
│   ├── interview_generator.py # Generate interview questions
│   └── lora_manager.py        # Training data, config, scripts
├── requirements.txt           # Python dependencies
└── __init__.py
```

### **Global State Management (Frontend)**

```javascript
AppContext Stores:
- resumeData: {file, parsed, ats, raw_text, timestamp}
- messages: [{role, content, sources, type}]
- jdResult: {score, breakdown, suggestions}
- isLoadingChat: boolean
- isLoadingResume: boolean
- skillsMatched: []
- skillsMissing: []

Dispatch Actions:
- SET_RESUME_DATA
- ADD_MESSAGE
- SET_LOADING_CHAT
- SET_LOADING_RESUME
- RESET_RESUME
- SET_JD_RESULT
```

---

## 📡 API Endpoints

### **Resume Management**

| Method | Endpoint | Input | Output | Purpose |
|--------|----------|-------|--------|---------|
| POST | `/api/upload_resume` | File (PDF/DOCX/TXT) | Parsed data + ATS | Quick analysis |
| POST | `/api/analyze_resume` | File + optional JD | Parsed + ATS + Interview Qs | Deep analysis |

### **ATS Scoring**

| Method | Endpoint | Input | Output | Purpose |
|--------|----------|-------|--------|---------|
| POST | `/api/ats_score` | Resume file + JD | Score breakdown (4 components) | Detailed matching |
| POST | `/api/job_match` | Resume file + JD | Match %, level, gaps | Quick assessment |

### **Chat & Interview**

| Method | Endpoint | Input | Output | Purpose |
|--------|----------|-------|--------|---------|
| POST | `/api/chat` | {message, history, context} | {answer, sources} | RAG conversation |
| POST | `/api/interview_questions` | {resume_text, jd_text, count} | Interview questions | Prep questions |

### **Document Ingestion**

| Method | Endpoint | Input | Output | Purpose |
|--------|----------|-------|--------|---------|
| POST | `/api/ingest` | Files | {documents, chunks} | Add to vector DB |
| POST | `/api/ingest_text` | {texts, source} | Chunk count | Ingest raw text |

### **LoRA Fine-Tuning**

| Method | Endpoint | Output | Purpose |
|--------|----------|--------|---------|
| GET | `/api/lora/training_data` | 5 HR training examples | View sample data |
| GET | `/api/lora/config` | {r, alpha, target_modules} | Hyperparameters |
| GET | `/api/lora/training_script` | Python script | Download training code |
| POST | `/api/lora/export_training_data` | JSONL file | Export for training |

### **Health & Meta**

| Method | Endpoint | Output | Purpose |
|--------|----------|--------|---------|
| GET | `/api/health` | {status, llm_provider, version} | Service status |

---

## 🔄 Data Flow Examples

### **Flow 1: Resume Upload & Analysis**
```
1. User selects PDF file via frontend
2. Frontend uploads via POST /api/upload_resume
3. Backend extracts text (PyPDF2)
4. Identifies sections: skills, experience, education, projects, summary
5. Counts skills against TECH_SKILLS database (80+ technologies)
6. Estimates years from regex patterns
7. Computes generic ATS score (heuristics: word count, section presence, action verbs)
8. Returns structured data + score breakdown
9. Frontend stores in AppContext
10. Components re-render with ResumePanel, AtsScoreRing, SkillPill visualizations
```

### **Flow 2: ATS Scoring Against Job Description**
```
1. User provides resume (already uploaded) + job description
2. Frontend POST /api/ats_score with both
3. Backend extracts JD text (if file) or uses provided text
4. Extracts JD skills and required experience
5. Calculates 4 component scores:
   - Skill Match: intersection / jd_skills count
   - Keyword Match: TF-IDF based overlap
   - Experience Match: resume_years / jd_years ratio
   - Semantic Similarity: cosine similarity of TF-IDF vectors
6. Weighted composite: 0.4×skill + 0.3×keyword + 0.2×exp + 0.1×semantic
7. Generates matched/missing skills list
8. Returns detailed breakdown with suggestions
9. Frontend displays in ATS card with component breakdown
```

### **Flow 3: RAG Chat with Context**
```
1. User sends message (e.g., "What interview questions should I prepare for?")
2. Frontend sends to POST /api/chat with message + history + resume context
3. Backend receives message and conversation history
4. Checks if message matches interview question pattern
5. If yes: calls generate_interview_questions()
6. If no: proceeds with RAG chat:
   a. Retrieves top-5 relevant documents from FAISS using message
   b. Builds system prompt with HR persona + retrieved context
   c. Constructs full prompt with history
   d. Calls LLM (OpenAI/Azure/Gemini)
   e. Captures sources and metadata
7. Returns answer + source citations
8. Frontend adds to message history and displays with sources
```

### **Flow 4: Document Ingestion for Knowledge Base**
```
1. User uploads HR documents (interview guides, company policies, etc.)
2. Frontend POST /api/ingest with files
3. Backend:
   a. Extracts text from each file
   b. Chunks using RecursiveCharacterTextSplitter (1000 chars, 200 overlap)
   c. Generates embeddings (Azure/OpenAI/HuggingFace)
   d. Stores chunks + metadata in FAISS vector store
   e. Saves index to disk
4. Future chat queries now retrieve from these documents
5. Citations include document source and page reference
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.6
- **Styling**: Tailwind CSS 3.4.17
- **UI Animations**: Framer Motion 11.15.0
- **HTTP Client**: Axios 1.7.9
- **Icons**: Lucide React 0.468.0
- **Notifications**: React Hot Toast 2.4.1
- **Code Quality**: ESLint 9.17.0

### **Backend**
- **Framework**: FastAPI 0.110+
- **Server**: Uvicorn (ASGI)
- **Config**: Pydantic, python-dotenv
- **LLM Integration**: LangChain 0.3+, OpenAI SDK
- **Document Processing**: PyPDF2, python-docx, txt
- **Vector Database**: FAISS (local CPU)
- **Embeddings**: Sentence-Transformers, Azure/OpenAI/Google/HF
- **Data Processing**: NumPy, Scikit-learn

### **Deployment**
- **Containerization**: Docker (multi-stage build)
- **Orchestration**: Docker Compose
- **Production**: Azure (documented in azure-deploy/)

### **LLM Providers (Pluggable)**
- OpenAI (GPT-5.4-2026-03-05, GPT-3.5-Turbo)
- Azure OpenAI (GPT-5.4-2026-03-05, custom deployments)
- Google Gemini 2.0 Flash
- HuggingFace (fallback for embeddings)

---

## ⚙️ Configuration & Environment

### **Environment Variables**

```bash
# LLM Provider Selection
LLM_PROVIDER=azure  # Options: openai, azure, gemini

# Azure OpenAI
AZURE_OPENAI_API_KEY=<key>
AZURE_OPENAI_ENDPOINT=<endpoint>
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_CHAT_MODEL=gpt-5.4-2026-03-05
AZURE_OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# OpenAI (if not using Azure)
OPENAI_API_KEY=<key>

# Google Gemini (optional)
GOOGLE_API_KEY=<key>

# Server
HOST=0.0.0.0
PORT=8000

# Frontend
VITE_API_BASE=http://localhost:8000/api
```

### **Key Configuration Options**

```python
# backend/config.py
TECH_SKILLS = {80+ common technologies}  # For skill extraction
SAMPLE_HR_DOCS_PATH = "./backend/data/sample_hr_docs/"
FAISS_INDEX_PATH = "./data/faiss_index/"
UPLOADS_PATH = "./data/uploads/"
LORA_TRAINING_PATH = "./data/lora_training/"

# Chunk settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# ATS Weights
ATS_WEIGHTS = {
    skill_match: 0.4,
    keyword_match: 0.3,
    experience_match: 0.2,
    semantic_similarity: 0.1
}
```

---

## 🚀 Getting Started

### **Prerequisites**
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- API keys for at least one LLM provider (OpenAI, Azure, or Google)

### **Local Development**

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### **Docker Deployment**

```bash
docker-compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

### **Azure Deployment**

See `azure-deploy/DEPLOYMENT.md` for step-by-step instructions.

---

## 📊 Key Algorithms & Processes

### **Resume Parsing Algorithm**
1. Extract text from PDF/DOCX using PyPDF2 or python-docx
2. Identify sections using regex patterns (Education, Experience, Skills, Projects)
3. Extract skills by matching against TECH_SKILLS set (case-insensitive, fuzzy)
4. Estimate years of experience by regex pattern matching ("X years", "since YYYY")
5. Return structured: {skills[], education[], experience_years, projects[], summary}

### **ATS Scoring Algorithm**

**Generic Score (40-100):**
- Base: 40 points minimum
- +20 if has skills section
- +15 if has experience section
- +15 if has education section
- +10 if >250 words (substantial content)

**JD-Specific Score (0-100):**
```
score = (
    0.4 * skill_match_score +
    0.3 * keyword_match_score +
    0.2 * experience_match_score +
    0.1 * semantic_similarity_score
) * 100
```

Where:
- **skill_match_score** = matched_skills / total_jd_skills
- **keyword_match_score** = TF-IDF cosine similarity between resume and JD keywords
- **experience_match_score** = min(resume_years / required_jd_years, 1.0)
- **semantic_similarity_score** = TF-IDF document similarity

### **RAG Retrieval Process**
1. Embed user query using configured embedding model
2. Query FAISS index with embedding (k=5 results)
3. Retrieve chunks with highest similarity scores
4. Include metadata (source, page, section)
5. Format as context for LLM prompt
6. Return both answer and source citations

### **Interview Question Generation**
1. **LLM Approach:**
   - Format INTERVIEW_PROMPT with resume + JD sections
   - Pass to LLM with system prompt (HR interviewer persona)
   - Extract and structure questions from response

2. **Rule-Based Fallback:**
   - Technical: Generate from extracted skills (3-5 questions)
   - Behavioral: Stock STAR method questions (3 questions)
   - Situational: Common scenarios (2 questions)
   - Format as markdown with categories and follow-up guidance

---

## 📈 Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Resume Upload & Parse | 1-3s | Depends on file size |
| ATS Score (Generic) | <1s | Heuristic-based |
| ATS Score (JD-Specific) | 2-5s | Includes LLM call |
| RAG Chat Response | 3-10s | Includes FAISS + LLM call |
| Interview Questions | 5-15s | LLM-powered generation |
| Document Ingestion | 2-10s | Per document, depends on LLM |

---

## 🔐 Security Considerations

- **API Keys**: Store in environment variables, never commit
- **File Uploads**: Validate file types (PDF, DOCX, TXT only)
- **CORS**: Configured to allow frontend-backend communication
- **Data Privacy**: No persistent storage of user uploads by default
- **Rate Limiting**: Can be added via FastAPI middleware
- **Input Validation**: Pydantic models validate all incoming data

---

## 🧪 Testing & Validation

**Sample Test Data:**
- `test_resume.txt` - Sample resume for testing
- Backend data samples: `backend/data/sample_hr_docs/` - Interview guides, best practices
- Training examples: `data/lora_training/hr_training.jsonl` - Pre-built training pairs

**Validation Steps:**
1. Upload test resume via frontend
2. Verify parsing in console
3. Test ATS scoring with sample JD
4. Test chat with ingested documents
5. Check interview question generation
6. Validate LoRA training data export

---

## 📚 File Reference Guide

| File/Directory | Purpose |
|---|---|
| `README.md` | Project overview and getting started |
| `requirements.txt` | Python dependencies |
| `docker-compose.yml` | Docker Compose orchestration |
| `Dockerfile` | Backend container definition |
| `.env.example` | Example environment variables |
| `backend/main.py` | FastAPI application entry point |
| `backend/config.py` | Configuration and LLM setup |
| `frontend/src/App.jsx` | React root component |
| `frontend/src/context/AppContext.jsx` | Global state management |
| `azure-deploy/DEPLOYMENT.md` | Azure deployment guide |
| `data/lora_training/hr_training.jsonl` | LoRA training data |

---

## 🎯 Use Cases

### **For HR Departments:**
- Automatically screen resumes against job descriptions
- Identify top candidates based on skill matching
- Generate interview questions aligned to job requirements
- Reduce time-to-hire and improve candidate quality

### **For Recruiters:**
- Quick resume assessment and fit scoring
- Instant interview preparation materials
- Smart recommendations for candidate follow-up
- Data-driven candidate comparison

### **For Candidates:**
- Resume feedback and optimization tips
- Practice interview questions
- Understand job-resume alignment
- Improve application materials

### **For Organizations:**
- Standardized hiring process
- Reduced bias through algorithmic scoring
- Knowledge base of company-specific interview practices
- Custom fine-tuned models for specific domain

---

## 🔄 Workflow Example

### **Complete Hiring Assistant Workflow**

```
Recruiter starts screening → Uses AI Hiring Assistant:

1. Upload candidate resume
   ✓ Gets instant ATS score
   ✓ Sees skill breakdown

2. Paste job description
   ✓ Gets JD-specific ATS score
   ✓ Sees matched/missing skills
   ✓ Gets improvement suggestions

3. Chat to understand candidate fit
   ✓ Asks contextual questions
   ✓ Gets answers based on resume
   ✓ References HR policies from knowledge base

4. Generate interview questions
   ✓ Gets 10 targeted questions
   ✓ Questions aligned to job + resume
   ✓ Mix of technical, behavioral, situational

5. Schedule interview
   ✓ Has complete candidate profile
   ✓ Interview questions ready
   ✓ Knows key areas to probe

6. Post-interview (future enhancement)
   ✓ Candidate assessment
   ✓ Comparison with other candidates
   ✓ Decision recommendations
```

---

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Resume formatting suggestions with visual editor
- [ ] Bulk resume screening
- [ ] Interview feedback and scoring
- [ ] Candidate pipeline dashboard
- [ ] Scheduling integration (Calendly, Outlook)
- [ ] Email automation
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Video interview analysis
- [ ] Integration with ATS systems (Workday, Greenhouse)

---

## 📞 Support & Documentation

- **Backend Docs**: Available at http://localhost:8000/docs (Swagger UI)
- **Deployment**: See `azure-deploy/DEPLOYMENT.md`
- **Configuration**: See `backend/config.py`
- **Training**: See `data/lora_training/` for fine-tuning examples

---

## 📄 License & Credits

**Project**: AI Hiring Assistant  
**Version**: 1.0  
**Build Date**: 2024  
**Technologies**: React, FastAPI, Python, LangChain, FAISS, Azure AI

---

**This comprehensive document serves as the complete system specification for the AI Hiring Assistant project.**
