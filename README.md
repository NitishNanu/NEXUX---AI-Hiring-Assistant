# AI Hiring Assistant

Intelligent HR assistant with RAG-powered chatbot, resume analysis, ATS scoring, and LoRA fine-tuning support.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key or Google Gemini API key

### 1. Setup Environment

```bash
# Clone and enter project
cd "AI Hiring Assistant"

# Copy env template and fill in your API keys
cp .env.example .env
# Edit .env with your OpenAI or Google Gemini credentials
```

### 2. Start Backend

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** for the UI and **http://localhost:8000/docs** for API docs.

## 📁 Project Structure

```
AI Hiring Assistant/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Configuration (env vars)
│   ├── routers/
│   │   ├── resume.py              # /api/upload_resume, /api/analyze_resume
│   │   ├── ats.py                 # /api/ats_score, /api/job_match
│   │   ├── chat.py                # /api/chat, /api/interview_questions
│   │   ├── ingest.py              # /api/ingest, /api/ingest_text
│   │   └── lora.py                # /api/lora/* endpoints
│   ├── services/
│   │   ├── resume_parser.py       # PDF/DOCX parsing, skill extraction
│   │   ├── ats_engine.py          # Weighted ATS scoring engine
│   │   ├── rag_pipeline.py        # FAISS + LangChain RAG pipeline
│   │   ├── interview_generator.py # Interview question generation
│   │   └── lora_manager.py        # LoRA fine-tuning scaffold
│   └── data/
│       ├── sample_hr_docs/        # RAG knowledge base
│       └── lora_training/         # LoRA training data
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Landing, Chat, Dashboard
│   │   ├── components/            # Header, FileUpload
│   │   └── services/api.js        # API client
│   └── index.html
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Local dev compose
├── requirements.txt               # Python dependencies
└── azure-deploy/                  # Azure deployment guide
```

## 🧠 Architecture

```
User → React Frontend → FastAPI Backend
                              ↓
                    ┌─────────┼─────────┐
                    ↓         ↓         ↓
              Resume Parser  ATS Engine  RAG Pipeline
                              ↓         ↓
                         FAISS Vector DB → LLM (Azure/OpenAI)
                              ↓
                    LoRA Fine-Tuned Adapter (optional)
```

## 🔑 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload_resume` | POST | Upload & analyze resume |
| `/api/ats_score` | POST | Compute ATS score (generic/JD-based) |
| `/api/job_match` | POST | Quick job match summary |
| `/api/chat` | POST | RAG-powered chat |
| `/api/ingest` | POST | Ingest documents to vector DB |
| `/api/lora/config` | GET | LoRA fine-tuning config |
| `/api/health` | GET | Health check |

## ☁️ Azure Deployment

See [azure-deploy/DEPLOYMENT.md](azure-deploy/DEPLOYMENT.md) for step-by-step instructions.
