# NEXUS Platform - Quick Reference Card

## Core Commands

### Start Development Environment
```bash
# Terminal 1: Backend
cd d:\PROJECTS\Nexux---AI-hiring-Intelligence-main
.venv\Scripts\activate  # Windows
python -m uvicorn backend.main:app --reload

# Terminal 2: Frontend  
cd frontend
npm run dev

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Database Operations
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/nexus

# View collections
show collections

# Check indexes
db.interview_sessions.getIndexes()

# Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ millis: -1 }).limit(5)
```

---

## Key Files by Feature

### Interview System
| Component | File | Purpose |
|-----------|------|---------|
| AI Generation | `backend/services/interview_engine.py` | Generate questions via AI |
| Storage | `backend/services/interview_repository.py` | DB operations |
| Routes | `backend/routers/mock_interview_enhanced.py` | API endpoints |
| Frontend Page | `frontend/src/pages/MockInterviewEnhanced.tsx` | Interview UI |
| API Service | `frontend/src/api/interviewApi.ts` | Frontend API calls |

### Coding System
| Component | File | Purpose |
|-----------|------|---------|
| Execution | `backend/services/coding_executor.py` | Run & test code |
| Routes | `backend/routers/coding.py` | Code endpoints |
| Editor | `frontend/src/components/interview/InterviewCodingEditor.tsx` | Code input UI |
| API Service | `frontend/src/api/codingApi.ts` | Code API calls |

### MCQ System
| Component | File | Purpose |
|-----------|------|---------|
| Routes | `backend/routers/mcq.py` | MCQ endpoints |
| Frontend | `frontend/src/pages/MockInterviewEnhanced.tsx` | MCQ display |
| API Service | `frontend/src/api/mcqApi.ts` | MCQ API calls |

---

## Common Tasks

### Add a New Interview Question Type
```python
# 1. Add to interview_engine.py
async def generate_behavioral_variant_question(self, ...):
    prompt = f"Generate a {variant} question..."
    return await self._generate_from_ai(prompt)

# 2. Add to routes (mock_interview_enhanced.py)
elif interview_type == "behavioral_variant":
    question_data = await engine.generate_behavioral_variant_question(...)

# 3. Update frontend (MockInterviewEnhanced.tsx)
const interviewRoles = [
    ...,
    { id: 'behavioral_variant', title: 'Behavioral Variant', ... }
]
```

### Add Coding Problem to Database
```javascript
// MongoDB
db.coding_problems.insertOne({
  title: "Two Sum",
  description: "Find two numbers that add to target",
  difficulty: "easy",
  category: "arrays",
  constraints: ["O(n) time", "O(n) space"],
  examples: [
    { input: "[2,7,11]", output: "[0,1]", explanation: "..." }
  ],
  expected_time_complexity: "O(n)",
  expected_space_complexity: "O(n)",
  test_cases: [
    { input: "[2,7,11]", expected: "[0,1]" },
    { input: "[3,2,4]", expected: "[1,2]" }
  ],
  ai_hints: ["Use hash map", "Two pass approach"]
})
```

### Deploy to Production
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Set environment variables
export OPENAI_API_KEY="sk-..."
export MONGODB_URL="mongodb+srv://..."
export JWT_SECRET="your-secret"

# 3. Start backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# 4. Serve frontend
# Copy dist/ to web server or use: python -m http.server
cd dist && python -m http.server 3000
```

---

## API Endpoints Quick Ref

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/mock-interview/start` | Initialize session |
| GET | `/api/mock-interview/question/{id}` | Get next question |
| POST | `/api/mock-interview/submit-answer` | Evaluate answer |
| GET | `/api/mock-interview/analytics/{id}` | Session scores |
| POST | `/api/coding/run` | Execute code tests |
| POST | `/api/coding/submit` | Submit solution |
| POST | `/api/mcq/submit` | MCQ answer |
| GET | `/api/mcq/stats` | User MCQ stats |

---

## Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=nexus
JWT_SECRET=change-this-in-production

# Optional
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
CODE_EXECUTION_TIMEOUT=5
MAX_REQUEST_SIZE=10485760  # 10MB
```

---

## Debugging Tips

### Network Issues
```bash
# Check API is running
curl http://localhost:8000/api/health

# Test specific endpoint
curl -X POST http://localhost:8000/api/mock-interview/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Issues
```bash
# Verify connection
mongosh "mongodb://localhost:27017/nexus"

# Check collection size
db.interview_sessions.countDocuments()

# View recent records
db.interview_sessions.find().sort({ created_at: -1 }).limit(1).pretty()
```

### Frontend Issues
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm run dev

# Check console for errors
# DevTools → Console tab

# Inspect React components
# DevTools → React Components tab
```

### AI Issues
```bash
# Test OpenAI connection
python -c "from backend.services.openai_service import OpenAIService; print('Connected')"

# Check API key validity
# Visit https://platform.openai.com/account/api-keys
```

---

## Performance Checklist

Before committing code:
- [ ] No console errors
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] API responses <1s
- [ ] Database queries use indexes
- [ ] Components memoized if complex
- [ ] Images optimized
- [ ] No memory leaks in timers

---

## Component Hierarchy

```
App
├── MockInterviewEnhanced
│   ├── Hero (role selection)
│   ├── Onboarding (progress animation)
│   ├── Interview (question + answer)
│   │   ├── InterviewCodingEditor (if coding)
│   │   └── Textarea (if text)
│   └── Results
│       └── InterviewAnalyticsDashboard
│
├── InterviewPrepEnhanced
│   ├── InterviewHeroSection
│   ├── PremiumInterviewCard[] (category grid)
│   ├── EnhancedQuestionCard[] (questions list)
│   └── InterviewAnalyticsDashboard
│
└── Common
    ├── NexusToast (notifications)
    ├── GlassCard (containers)
    └── Badge (labels)
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/interview-enhancement

# Make changes
git add .
git commit -m "feat: add new interview type"

# Push and create PR
git push origin feature/interview-enhancement

# After review, merge to main
git checkout main
git merge feature/interview-enhancement
git push origin main
```

---

## Testing Pyramid

```
         /\
        /E2E\           Complete user flows
       /------\         (1-2 critical paths)
      /--------\
     / Integr. \        API + Database
    /----------\        (5-10 scenarios)
   /            \
  / Unit Tests   \      Functions + Components
 /________________\     (50+ tests)
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `IMPLEMENTATION_SUMMARY.md` | What was built |
| `DEVELOPER_GUIDE.md` | How to use components |
| `INTEGRATION_GUIDE.md` | How systems connect |
| `PRODUCTION_GUIDE.md` | Deployment & testing |
| `QUICK_REFERENCE.md` | This file! |

---

## Important Dates & Versions

- **Last Updated:** May 24, 2026
- **Current Version:** 2.1.0 (Production Ready)
- **Next Planned:** 2.2.0 (Advanced features - voice, leaderboard)

---

## Support & Contacts

- **Issues:** Check GitHub Issues or create new one
- **Documentation:** See INTEGRATION_GUIDE.md
- **API Docs:** http://localhost:8000/docs (SwaggerUI)
- **Database:** MongoDB Compass for UI

---

## Code Style

- **Python:** PEP 8, type hints required, docstrings for functions
- **TypeScript:** ESLint rules enforced, strict mode enabled
- **Components:** Functional with hooks, memoized if needed
- **Naming:** camelCase for JS/TS, snake_case for Python

---

**Last Updated:** May 24, 2026  
**Maintained By:** NEXUS Development Team
