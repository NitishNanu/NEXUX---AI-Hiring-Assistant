"""RAG Pipeline — FAISS vector store, document chunking, embedding, and retrieval."""

import os
import pickle
from typing import Optional

from backend.config import settings


def _get_text_splitter() -> "RecursiveCharacterTextSplitter":
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    return RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )


def _get_faiss_class():
    try:
        from langchain_community.vectorstores import FAISS
    except ImportError as exc:
        raise ImportError(
            "FAISS support is not installed. Install `langchain-community` and `faiss-cpu` "
            "to enable vector store features."
        ) from exc

    return FAISS

# ── Globals ──────────────────────────────────────────────────────────
_vector_store: Optional[object] = None
_embeddings = None

HR_SYSTEM_PROMPT = """You are an AI Senior HR Recruiter, Career Coach, and Resume Expert.
You provide professional, insightful, and actionable guidance.

Your capabilities:
- Analyze resumes and provide detailed feedback
- Calculate ATS compatibility scores
- Match resumes with job descriptions
- Identify skill gaps and recommend improvements
- Generate targeted interview questions
- Provide career coaching advice

Guidelines:
- Be specific, not generic. Reference actual content from the user's resume when available.
- Provide actionable suggestions with concrete examples.
- Use professional but approachable tone.
- When discussing skills gaps, prioritize by industry relevance.
- Always explain your reasoning.

Context from knowledge base:
{context}

Conversation so far:
{chat_history}

User Question: {question}

Provide a thorough, well-structured response:"""


def _get_embeddings():
    """Initialize the embedding model (OpenAI RECOMMENDED > Gemini > HuggingFace fallback)."""
    global _embeddings
    if _embeddings is not None:
        return _embeddings

    # Priority 1: Standard OpenAI (RECOMMENDED - better performance & cost)
    if settings.use_openai:
        from langchain_openai import OpenAIEmbeddings
        _embeddings = OpenAIEmbeddings(
            api_key=settings.openai_api_key,
            model="text-embedding-3-small",  # Latest embedding model
        )
    # Priority 2: Google Gemini
    elif settings.use_gemini:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        _embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=settings.google_api_key,
        )
    # Fallback: HuggingFace (local, no API key needed)
    else:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
        )

    return _embeddings


def _get_llm():
    """Initialize the LLM (OpenAI RECOMMENDED > Gemini)."""
    # Priority 1: Standard OpenAI GPT (RECOMMENDED - best quality & fastest)
    if settings.use_openai:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            api_key=settings.openai_api_key,
            model="gpt-5.4-2026-03-05",  # Latest GPT model
            temperature=0.7,
            max_tokens=2048,
        )
    # Priority 2: Google Gemini
    elif settings.use_gemini:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.google_api_key,
            temperature=0.7,
            max_output_tokens=2048,
        )
    else:
        raise RuntimeError(
            "❌ No LLM API key configured.\n"
            "   RECOMMENDED: Set OPENAI_API_KEY in .env\n"
            "   ALTERNATIVES:\n"
            "     - GOOGLE_API_KEY (free option)"
        )


def get_text_splitter() -> object:
    return _get_text_splitter()


def load_vector_store() -> Optional[object]:
    """Load existing FAISS index from disk."""
    global _vector_store
    index_path = settings.faiss_index_path

    if os.path.exists(index_path):
        try:
            FAISS = _get_faiss_class()
            embeddings = _get_embeddings()
            _vector_store = FAISS.load_local(
                index_path, embeddings, allow_dangerous_deserialization=True
            )
            print(f"✅ FAISS index loaded from {index_path}")
            return _vector_store
        except Exception as e:
            print(f"⚠️ Could not load FAISS index: {e}")
    else:
        print("ℹ️ No existing FAISS index found. Will create on first ingest.")

    return None


def save_vector_store():
    """Persist the FAISS index to disk."""
    global _vector_store
    if _vector_store is None:
        return

    os.makedirs(settings.faiss_index_path, exist_ok=True)
    _vector_store.save_local(settings.faiss_index_path)
    print(f"💾 FAISS index saved to {settings.faiss_index_path}")


def ingest_texts(texts: list[str], metadatas: list[dict] | None = None):
    """Chunk text documents, embed them, and add to the FAISS vector store."""
    global _vector_store

    splitter = get_text_splitter()
    all_chunks: list[str] = []
    all_metas: list[dict] = []

    for i, text in enumerate(texts):
        chunks = splitter.split_text(text)
        meta = metadatas[i] if metadatas and i < len(metadatas) else {}
        all_chunks.extend(chunks)
        all_metas.extend([{**meta, "chunk_index": j} for j in range(len(chunks))])

    embeddings = _get_embeddings()

    FAISS = _get_faiss_class()
    if _vector_store is None:
        _vector_store = FAISS.from_texts(all_chunks, embeddings, metadatas=all_metas)
    else:
        _vector_store.add_texts(all_chunks, metadatas=all_metas)

    save_vector_store()
    return len(all_chunks)


def retrieve_context(query: str, k: int = 5) -> list[dict]:
    """Retrieve the top-k relevant chunks for a query."""
    if _vector_store is None:
        return []

    docs = _vector_store.similarity_search_with_score(query, k=k)
    results = []
    for doc, score in docs:
        results.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "relevance_score": round(float(1 - score), 4),
        })
    return results


def chat_with_rag(
    question: str,
    chat_history: str = "",
    resume_context: str = "",
) -> dict:
    """Run the full RAG chain: retrieve context → prompt LLM → return response."""
    # Retrieve from vector store
    retrieved = retrieve_context(question, k=5)
    context_parts = [r["content"] for r in retrieved]

    # Prepend resume context if available
    if resume_context:
        context_parts.insert(0, f"[USER'S RESUME]\n{resume_context}")

    context_str = "\n\n---\n\n".join(context_parts) if context_parts else "No additional context available."

    prompt = HR_SYSTEM_PROMPT.format(
        context=context_str,
        chat_history=chat_history,
        question=question,
    )

    try:
        llm = _get_llm()
        response = llm.invoke(prompt)
        answer = response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        # LLM error (rate limit, config, network, etc.) — return a helpful fallback
        answer = (
            f"⚠️ LLM error: {str(e)}\n\n"
            "However, based on the context retrieved from the knowledge base:\n\n"
            + "\n".join(f"- {c[:200]}..." for c in context_parts[:3])
        )

    return {
        "answer": answer,
        "sources": retrieved,
        "context_used": len(retrieved),
    }
