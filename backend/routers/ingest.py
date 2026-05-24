"""Ingest router — upload documents to the RAG knowledge base."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional

from backend.services.resume_parser import extract_text
from backend.services.rag_pipeline import ingest_texts

router = APIRouter(prefix="/api", tags=["Ingest"])


@router.post("/ingest")
async def ingest_documents(files: list[UploadFile] = File(...)):
    """Upload one or more documents to be chunked, embedded, and stored in the vector DB."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    texts: list[str] = []
    metadatas: list[dict] = []

    for file in files:
        if not file.filename:
            continue
        contents = await file.read()
        text = extract_text(contents, file.filename)
        if text.strip():
            texts.append(text)
            metadatas.append({"source": file.filename, "type": "uploaded_document"})

    if not texts:
        raise HTTPException(status_code=400, detail="No text could be extracted from uploaded files.")

    chunk_count = ingest_texts(texts, metadatas)

    return {
        "message": f"Successfully ingested {len(texts)} document(s) into {chunk_count} chunks.",
        "documents": [m["source"] for m in metadatas],
        "total_chunks": chunk_count,
    }


@router.post("/ingest_text")
async def ingest_text(texts: list[str], source: str = "manual_input"):
    """Ingest raw text directly into the vector store."""
    if not texts:
        raise HTTPException(status_code=400, detail="No texts provided.")

    metadatas = [{"source": source, "type": "raw_text", "index": i} for i in range(len(texts))]
    chunk_count = ingest_texts(texts, metadatas)

    return {
        "message": f"Successfully ingested {len(texts)} text(s) into {chunk_count} chunks.",
        "total_chunks": chunk_count,
    }
