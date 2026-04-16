from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router


def _origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "*").strip()
    if raw == "*":
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(
    title="Credit Score Simulator API",
    version="1.0.0",
    description="Backend for credit score simulation, breakdown, and AI explanations",
)

# CORS (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prefix all routes → cleaner structure
app.include_router(router, prefix="/api")

@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Credit Score API is running"}

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}