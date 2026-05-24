# NEXUS API Documentation

## Overview

The NEXUS API provides AI-powered hiring intelligence features for resume analysis, job description matching, interview preparation, and salary guidance.

**Base URL:** `/api`  
**Authentication:** Bearer JWT Token in `Authorization` header  
**Timeout:** 180 seconds (3 minutes)

---

## Authentication

All endpoints require a valid JWT token obtained from the `/login` endpoint.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

**Token Storage:** Stored in `localStorage` as `nexus_token`

---

## Resume Endpoints

### 1. Upload Resume

**Endpoint:** `POST /upload_resume`

**Description:** Upload a resume file and receive parsed content with ATS scoring.

**Request:**
- **Type:** `multipart/form-data`
- **File Parameter:** `file` (PDF, DOCX, TXT)
- **Max Size:** No limit (tested up to 5MB)

**Response:**
```json
{
  "filename": "resume.pdf",
  "parsed": {
    "skills": ["Python", "React", "SQL"],
    "experience_years": 5,
    "education": [
      {
        "institution": "Stanford University",
        "degree": "BS Computer Science",
        "year": "2018"
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "description": "Project description"
      }
    ],
    "summary": "Professional summary extracted from resume",
    "sections": ["experience", "education", "skills"]
  },
  "ats": {
    "ats_score": 78,
    "match_level": "strong",
    "keyword_matches": 45,
    "gaps": ["Kubernetes", "Docker"]
  },
  "raw_text": "Full resume text content..."
}
```

**Error Codes:**
- `400` - No file uploaded, empty file, or unsupported file type
- `422` - Failed to parse resume

**Supported Formats:**
- `.pdf` - PDF documents
- `.docx` - Microsoft Word (2007+)
- `.doc` - Legacy Microsoft Word
- `.txt` - Plain text

---

### 2. Analyze Resume

**Endpoint:** `POST /analyze_resume`

**Description:** Deep analysis of resume with AI-generated interview questions.

**Request:**
- **Type:** `multipart/form-data`
- **File Parameter:** `file` (PDF, DOCX, TXT)

**Response:**
```json
{
  "filename": "resume.pdf",
  "parsed": {
    "skills": ["Python", "React", "SQL"],
    "experience_years": 5,
    "education": [...],
    "projects": [...],
    "summary": "Professional summary"
  },
  "ats": {
    "ats_score": 78,
    "match_level": "strong",
    "keyword_matches": 45,
    "gaps": ["Kubernetes"]
  },
  "interview_questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?",
    "Question 6?",
    "Question 7?",
    "Question 8?"
  ]
}
```

**Error Codes:**
- `400` - No file uploaded
- `422` - Failed to parse resume

---

### 3. Improve Resume

**Endpoint:** `POST /improve_resume`

**Description:** Generate AI-powered resume improvement suggestions.

**Request:**
```json
{
  "resume_text": "Full resume text content",
  "focus_area": "skills"  // Optional: "skills", "achievements", "formatting", "experience", "overall impact"
}
```

**Response:**
```json
{
  "improvements": "1. Use action verbs (increased, developed, led)\n2. Add quantifiable metrics...",
  "focus_area": "skills"
}
```

**Error Codes:**
- `400` - Resume text is required
- `500` - AI service failed
- `503` - AI service unavailable

**Response Time:** 5-10 seconds typical

---

### 4. Salary Expectations

**Endpoint:** `POST /salary_expectations`

**Description:** Generate realistic salary expectations based on resume profile.

**Request:**
```json
{
  "resume_text": "Full resume text content",
  "job_title": "Senior Software Engineer",    // Optional
  "experience_years": 5,                     // Optional
  "location": "San Francisco, CA"            // Optional
}
```

**Response:**
```json
{
  "salary_guidance": "Entry-level: $90K-$120K\nMid-level: $140K-$180K\nSenior: $200K-$280K\n\nKey drivers:\n- Python & React expertise\n- 5+ years experience\n- Leadership experience\n\nTip: Emphasize impact metrics in negotiations.",
  "job_context": "Senior Software Engineer"
}
```

**Error Codes:**
- `400` - Resume text is required
- `500` - AI service failed
- `503` - AI service unavailable

**Response Time:** 5-10 seconds typical

---

### 5. Match with JD File

**Endpoint:** `POST /match_with_jd_file`

**Description:** Match resume against job description file with detailed analysis.

**Request:**
- **Type:** `multipart/form-data`
- **Parameters:**
  - `resume` - Resume file (PDF, DOCX, TXT)
  - `jd_file` - Job description file (PDF, DOCX, TXT)

**Response:**
```json
{
  "match_percentage": 82,
  "match_level": "strong",
  "matched_skills": ["Python", "React", "AWS"],
  "missing_skills": ["Kubernetes", "Docker"],
  "suggestions": [
    "Add Kubernetes experience to increase match score",
    "Highlight AWS cloud architecture projects"
  ],
  "resume_file": "resume.pdf",
  "jd_file": "job_description.pdf"
}
```

**Error Codes:**
- `400` - Missing files, empty content, or parse failure
- `500` - Matching computation failed

**Response Time:** 5-15 seconds typical

---

## Chat Endpoints

### 6. Send Chat

**Endpoint:** `POST /chat`

**Description:** Send a message with optional resume context for RAG-powered responses.

**Request:**
```json
{
  "message": "What skills should I develop?",
  "history": [
    {"role": "user", "content": "Previous message"},
    {"role": "ai", "content": "Previous response"}
  ],
  "resume_context": "Full resume text or null"
}
```

**Response:**
```json
{
  "answer": "Based on your resume, I recommend...",
  "sources": ["resume_section1", "resume_section2"]
}
```

**Error Codes:**
- `400` - Message is required
- `422` - Invalid message format
- `500` - AI service failed

**Response Time:** 3-8 seconds typical

---

### 7. Interview Questions

**Endpoint:** `POST /interview_questions`

**Description:** Generate interview questions based on resume.

**Request:**
```json
{
  "resume_text": "Full resume text",
  "focus": "technical"  // Optional: "technical", "behavioral", "experience"
}
```

**Response:**
```json
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?"
  ]
}
```

**Error Codes:**
- `400` - Resume text is required
- `500` - Question generation failed

**Response Time:** 3-5 seconds typical

---

## Authentication Endpoints

### 8. Login

**Endpoint:** `POST /login`

**Description:** Authenticate user and obtain JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Codes:**
- `400` - Invalid credentials
- `401` - Unauthorized

---

### 9. Signup

**Endpoint:** `POST /signup`

**Description:** Create a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "newuser@example.com",
    "name": "User Name"
  }
}
```

**Error Codes:**
- `400` - Invalid input or email already exists
- `422` - Validation error

---

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request parameters and format |
| 401 | Unauthorized | Login again and get fresh token |
| 422 | Validation Error | Check data types and required fields |
| 500 | Server Error | Retry after a few seconds |
| 503 | Service Unavailable | AI service is down, try again later |

---

## Rate Limiting

Current implementation has no rate limiting. Production deployment should add:
- 100 requests per minute per user
- 10 concurrent requests per session

---

## Performance Guidelines

### Timeout Settings
- **Standard Endpoints:** 30 seconds
- **Long-running Operations:** 180 seconds (3 minutes)
  - Resume improvement
  - Salary expectations
  - JD matching with files
  - Interview question generation

### Typical Response Times
- Upload resume: 2-5 seconds
- Analyze resume: 3-8 seconds
- Improve resume: 5-10 seconds
- Salary expectations: 5-10 seconds
- JD matching: 5-15 seconds
- Chat: 3-8 seconds

---

## Configuration

### Environment Variables
```
OPENAI_API_KEY=sk-...                    # Required for AI features
AZURE_OPENAI_API_KEY=...                 # Optional, used as fallback
GOOGLE_API_KEY=...                       # Optional, used as fallback
MONGODB_URL=mongodb://localhost:27017    # Database URL
JWT_SECRET=your-secret-key               # Signing key for JWT tokens
```

### Model Configuration
- **Primary Model:** `gpt-5.4-2026-03-05` (OpenAI)
- **Embedding Model:** `text-embedding-3-small`
- **Provider Priority:** OpenAI → Azure OpenAI → Google Gemini → Fallback

---

## Examples

### Example: Full Resume Analysis Flow

1. **Upload resume:**
```bash
curl -X POST http://localhost:8000/api/upload_resume \
  -H "Authorization: Bearer <token>" \
  -F "file=@resume.pdf"
```

2. **Get improvements:**
```bash
curl -X POST http://localhost:8000/api/improve_resume \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "...",
    "focus_area": "skills"
  }'
```

3. **Get salary expectations:**
```bash
curl -X POST http://localhost:8000/api/salary_expectations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "...",
    "job_title": "Senior Engineer",
    "experience_years": 5,
    "location": "San Francisco, CA"
  }'
```

---

## Support

For issues or questions:
1. Check the error message in the response
2. Verify all required parameters are present
3. Ensure JWT token is valid and not expired
4. Check that AI service has valid API keys configured
5. For persistent issues, check server logs

---

**Last Updated:** May 24, 2026  
**Version:** 1.0.0
