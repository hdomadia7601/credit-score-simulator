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

1. Frontend (static, Vercel):
   - Import the repo into Vercel.
   - Set the project root to `frontend`.
   - Framework: Vite / Other.
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

2. Backend (API, Render):
   - From Render, "New + Blueprint" and point it at this repo.
   - Render will detect `render.yaml` and create a web service using `backend/Dockerfile`.
   - After first deploy, copy the public URL (e.g. `https://credit-score-backend.onrender.com`) into the Vercel `VITE_API_BASE_URL` value.

Because the app uses a REST API, both pieces must be hosted together (Vercel + Render) so the frontend can reach the backend using `VITE_API_BASE_URL`.

## CI

GitHub Actions runs:

- Frontend `npm run build`
- Backend `python -m compileall`
