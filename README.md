# Credit Score Simulator (Fintech UI)

Minimal, corporate credit-score simulator with explainability and optional AI guidance.

## What you get

- React + Tailwind fintech-style dashboard (Vite)
- FastAPI REST backend
- Deterministic credit scoring + factor breakdown
- Optional LLM explanations via a Groq/OpenAI-compatible endpoint
- Session-based inputs (resets when the tab closes)
- Scenario comparison (compare current score vs improved targets)

## Local development (Docker)

1. Copy env:
   - Create a `.env` file from `.env.example` (optional for scoring; required only for AI explanations).
2. Start:
   - `docker compose up --build`
3. Open:
   - Frontend: `http://localhost:3000`
   - Backend health: `http://localhost:8000/health`

## Environment variables

- `GROQ_API_KEY` (or `OPENAI_API_KEY`): enable AI explanations
- `LLM_BASE_URL`: Groq/OpenAI-compatible base URL (defaults to Groq)
- `LLM_MODEL`: model name (defaults to `gpt-4o-mini`)
- `CORS_ORIGINS`: allowed origins for API calls

## GitHub deployment

This repo is deployable as two services:

1. Frontend (static): build the React app and host the `dist/` output (or use the provided `frontend/Dockerfile`).
2. Backend (API): run the FastAPI app (or use `backend/Dockerfile`).

Because the app uses a REST API, both pieces must be hosted together (or proxied) so the frontend can reach `/api/*`.

## CI

GitHub Actions runs:

- Frontend `npm run build`
- Backend `python -m compileall`
