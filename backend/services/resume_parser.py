"""Resume parsing service — extracts text and structured sections from PDF/DOCX files."""

import re
import io
from typing import Optional
from PyPDF2 import PdfReader
from docx import Document


# ── Section header patterns ──────────────────────────────────────────
SECTION_PATTERNS = {
    "skills": re.compile(
        r"(?i)(?:technical\s+)?skills|competencies|technologies|tech\s+stack",
    ),
    "experience": re.compile(
        r"(?i)(?:work\s+)?experience|employment|professional\s+background|work\s+history",
    ),
    "education": re.compile(
        r"(?i)education|academic|qualification|degree",
    ),
    "projects": re.compile(
        r"(?i)projects|portfolio|personal\s+projects|academic\s+projects",
    ),
    "certifications": re.compile(
        r"(?i)certifications?|licenses?|accreditations?",
    ),
    "summary": re.compile(
        r"(?i)summary|objective|profile|about\s+me|professional\s+summary",
    ),
}

# ── Common technical skills for extraction ───────────────────────────
TECH_SKILLS = {
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby",
    "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "nosql", "html", "css",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask",
    "fastapi", "spring", "spring boot", ".net", "asp.net",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "ci/cd",
    "git", "github", "gitlab", "bitbucket",
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "cassandra",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
    "pytorch", "scikit-learn", "pandas", "numpy", "keras",
    "rest api", "graphql", "grpc", "microservices", "serverless",
    "agile", "scrum", "jira", "confluence",
    "linux", "unix", "bash", "powershell",
    "figma", "sketch", "adobe xd",
    "power bi", "tableau", "excel",
    "langchain", "openai", "llm", "rag", "vector database", "faiss", "pinecone",
    "hadoop", "spark", "kafka", "airflow", "databricks",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file."""
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Route to the correct parser based on file extension."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes)
    else:
        # Attempt plain text
        return file_bytes.decode("utf-8", errors="ignore")


def _identify_sections(text: str) -> dict[str, str]:
    """Split resume text into named sections."""
    lines = text.split("\n")
    sections: dict[str, list[str]] = {}
    current_section: Optional[str] = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        matched = False
        for section_name, pattern in SECTION_PATTERNS.items():
            if pattern.search(stripped) and len(stripped) < 60:
                current_section = section_name
                sections.setdefault(current_section, [])
                matched = True
                break

        if not matched and current_section:
            sections.setdefault(current_section, []).append(stripped)
        elif not matched and current_section is None:
            sections.setdefault("header", []).append(stripped)

    return {k: "\n".join(v) for k, v in sections.items()}


def extract_skills(text: str) -> list[str]:
    """Extract technical skills from resume text."""
    text_lower = text.lower()
    found: list[str] = []
    for skill in sorted(TECH_SKILLS):
        if skill in text_lower:
            found.append(skill)
    return found


def extract_experience_years(text: str) -> int:
    """Estimate total years of experience from text."""
    patterns = [
        re.compile(r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)", re.IGNORECASE),
        re.compile(r"(?:experience|exp)\s*(?:of\s+)?(\d+)\+?\s*(?:years?|yrs?)", re.IGNORECASE),
    ]
    years: list[int] = []
    for p in patterns:
        for m in p.finditer(text):
            years.append(int(m.group(1)))
    return max(years) if years else 0


def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """Full resume parse → structured data."""
    raw_text = extract_text(file_bytes, filename)
    sections = _identify_sections(raw_text)
    skills = extract_skills(raw_text)
    experience_years = extract_experience_years(raw_text)

    return {
        "raw_text": raw_text,
        "sections": sections,
        "skills": skills,
        "experience_years": experience_years,
        "education": sections.get("education", ""),
        "projects": sections.get("projects", ""),
        "summary": sections.get("summary", sections.get("header", "")),
    }
