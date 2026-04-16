from __future__ import annotations

import json
import os
from typing import Any, Optional

from openai import OpenAI

from .models import ExplanationRequest


class AIService:
    def __init__(
        self,
        *,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ) -> None:
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
        self.base_url = base_url or os.getenv("LLM_BASE_URL") or "https://api.openai.com/v1"
        self.model = model or os.getenv("LLM_MODEL") or "gpt-4o-mini"

        self._client: Optional[OpenAI] = None
        if self.api_key:
            self._client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    def _build_payload(self, req: ExplanationRequest) -> dict[str, Any]:
        inputs = req.inputs.model_dump()
        breakdown = req.factor_breakdown.model_dump()

        return {
            "inputs": inputs,
            "credit_score": req.credit_score,
            "factor_breakdown": breakdown,
            "question": (req.question or "").strip(),
        }

    def build_prompt(self, req: ExplanationRequest) -> list[dict[str, str]]:
        payload = self._build_payload(req)

        system = (
            "You are a non-technical fintech assistant for credit-score education. "
            "Be concise, clear, and actionable. Do not mention internal model weights. "
            "Return JSON only."
        )

        user = (
            "Given this credit score simulation context, answer the user's question.\n\n"
            f"Context JSON:\n{json.dumps(payload, indent=2)}\n\n"
            "Return a JSON object with exactly these keys:\n"
            "1) assistant_response (string): simple, non-technical explanation.\n"
            "2) top_negative_factors (array of strings): 2-3 items most hurting the score.\n"
            "3) actionable_suggestions (array of strings): steps the user can take.\n"
            "4) fastest_improvement_path (string): the quickest realistic path.\n"
            "All suggestions must relate to the provided factor_breakdown."
        )

        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    def get_explanation(self, req: ExplanationRequest) -> dict[str, Any]:
        if not self._client:
            raise RuntimeError("AI service is not configured (missing API key).")

        prompt = self.build_prompt(req)
        completion = self._client.chat.completions.create(
            model=self.model,
            messages=prompt,
            temperature=0.2,
            response_format={"type": "json_object"},
        )

        raw = completion.choices[0].message.content or "{}"
        data = json.loads(raw)

        # Normalize to the expected output shape.
        return data

