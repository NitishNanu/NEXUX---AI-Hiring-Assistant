# ── Stage 1: Build Frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --production=false
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python Backend ─────────────────────────────────────────
FROM python:3.11-slim AS backend-runtime
WORKDIR /app

# Install only temporary build tools needed for any compiled dependencies,
# then remove them to keep the final image small.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend source and runtime assets only
COPY backend/ ./backend/
COPY backend/data/ ./data/

# Copy built frontend files from the builder stage
COPY --from=frontend-build /app/frontend/dist ./static/

# Environment
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
