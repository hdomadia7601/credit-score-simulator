from __future__ import annotations

import json
import os
import random
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
        # Priority: explicit → GROQ → OPENAI
        self.api_key = api_key or os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")

        # Default to GROQ
        self.base_url = (
            base_url
            or os.getenv("LLM_BASE_URL")
            or "https://api.groq.com/openai/v1"
        )

        # ✅ FIXED MODEL (this was broken before)
        self.model = (
            model
            or os.getenv("LLM_MODEL")
            or "llama-3.1-70b-versatile"
        )

        self._client: Optional[OpenAI] = None
        if self.api_key:
            self._client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    def _build_payload(self, req: ExplanationRequest) -> dict[str, Any]:
        return {
            "inputs": req.inputs.model_dump(),
            "credit_score": req.credit_score,
            "factor_breakdown": req.factor_breakdown.model_dump(),
            "question": (req.question or "").strip(),
        }

    def build_prompt(self, req: ExplanationRequest) -> list[dict[str, str]]:
        payload = self._build_payload(req)
        variation_seed = random.randint(1, 100000)

        system = (
            "You are a fintech assistant explaining credit scores in simple terms. "
            "Be concise, practical, and actionable. Avoid technical jargon. "
            "Always return valid JSON."
        )

        user = (
            f"Variation seed: {variation_seed}\n"
            "Generate a fresh, unique response.\n"
            "Use different tone, structure, and examples every time.\n\n"
            f"{json.dumps(payload, indent=2)}\n\n"
            "Return ONLY JSON with:\n"
            "{\n"
            '  "assistant_response": string,\n'
            '  "top_negative_factors": string[],\n'
            '  "actionable_suggestions": string[],\n'
            '  "fastest_improvement_path": string\n'
            "}\n"
        )

        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    def get_explanation(self, req: ExplanationRequest) -> dict[str, Any]:
        if not self._client:
            print("AI ERROR: Client not initialized (missing API key)")
            return self._fallback_response()

        try:
            print("Using model:", self.model)  # 🔍 debug

            completion = self._client.chat.completions.create(
                model=self.model,
                messages=self.build_prompt(req),
                temperature=0.9,
                top_p=0.95,
                frequency_penalty=0.3,
                presence_penalty=0.4,
                response_format={"type": "json_object"},
            )

            raw = getattr(completion.choices[0].message, "content", "{}") or "{}"

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                try:
                    start = raw.find("{")
                    end = raw.rfind("}") + 1
                    if start != -1 and end != -1:
                        data = json.loads(raw[start:end])
                    else:
                        data = {}
                except Exception:
                    data = {}

            return self._normalize_response(data)

        except Exception as e:
            print("AI ERROR:", str(e))  # 🔥 critical debug
            return self._fallback_response()

    def _normalize_response(self, data: dict[str, Any]) -> dict[str, Any]:
        return {
            "assistant_response": data.get("assistant_response", ""),
            "top_negative_factors": data.get("top_negative_factors", []),
            "actionable_suggestions": data.get("actionable_suggestions", []),
            "fastest_improvement_path": data.get("fastest_improvement_path", ""),
        }

    def _fallback_response(self) -> dict[str, Any]:
        return {
            "assistant_response": "Improve your payment consistency and reduce credit utilization to increase your score.",
            "top_negative_factors": [
                "High credit utilization",
                "Inconsistent payments",
            ],
            "actionable_suggestions": [
                "Pay dues on time every month",
                "Keep credit usage below 30%",
            ],
            "fastest_improvement_path": "Reduce credit utilization immediately and avoid missed payments for the next 2–3 months.",
        }