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
        self.api_key = api_key or os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")

        self.base_url = (
            base_url
            or os.getenv("LLM_BASE_URL")
            or "https://api.groq.com/openai/v1"
        )

        self.model = (
            model
            or os.getenv("LLM_MODEL")
            or "LLM_MODEL=llama-3.1-8b-instant"
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
            "You are a smart fintech credit advisor. "
            "Give concise, practical, DIFFERENT advice every time. "
            "Do not repeat generic suggestions."
        )

        user = (
            f"Variation seed: {variation_seed}\n\n"
            "Give a UNIQUE and SPECIFIC response.\n"
            "Focus on the weakest factor in the profile.\n\n"
            f"{json.dumps(payload, indent=2)}\n\n"
            "Respond in JSON format like this:\n"
            "{\n"
            '  "assistant_response": "...",\n'
            '  "top_negative_factors": ["..."],\n'
            '  "actionable_suggestions": ["..."],\n'
            '  "fastest_improvement_path": "..."\n'
            "}"
        )

        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    def get_explanation(self, req: ExplanationRequest) -> dict[str, Any]:
        if not self._client:
            print("AI ERROR: Client not initialized")
            return self._fallback_response()

        try:
            print("Using model:", self.model)

            completion = self._client.chat.completions.create(
                model=self.model,
                messages=self.build_prompt(req),
                temperature=1.0,
                top_p=0.95,
                frequency_penalty=0.6,
                presence_penalty=0.6,
            )

            raw = completion.choices[0].message.content or ""

            print("RAW AI RESPONSE:", raw)  # 🔥 debug

            try:
                data = json.loads(raw)
            except Exception:
                # 🔥 fallback parser if JSON is messy
                data = {
                    "assistant_response": raw,
                    "top_negative_factors": [],
                    "actionable_suggestions": [],
                    "fastest_improvement_path": "",
                }

            return self._normalize_response(data)

        except Exception as e:
            print("AI ERROR:", str(e))  # keep this for debugging
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
            "fastest_improvement_path": "Reduce credit utilization and avoid missed payments for the next 2–3 months.",
        }