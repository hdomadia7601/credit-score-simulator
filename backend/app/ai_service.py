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
        # Priority: explicit → GROQ → OPENAI
        self.api_key = api_key or os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")

        # Default to GROQ (faster + cheaper for your use case)
        self.base_url = (
            base_url
            or os.getenv("LLM_BASE_URL")
            or "https://api.groq.com/openai/v1"
        )

        # Good default Groq model
        self.model = (
            model
            or os.getenv("LLM_MODEL")
            or "llama3-70b-8192"
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

        system = (
            "You are a fintech assistant explaining credit scores in simple terms. "
            "Be concise, practical, and actionable. Avoid technical jargon. "
            "Always return valid JSON."
        )

        user = (
            "Analyze the credit profile below and answer the user's question.\n\n"
            f"{json.dumps(payload, indent=2)}\n\n"
            "Return ONLY a JSON object with:\n"
            "{\n"
            '  "assistant_response": string,\n'
            '  "top_negative_factors": string[],\n'
            '  "actionable_suggestions": string[],\n'
            '  "fastest_improvement_path": string\n'
            "}\n\n"
            "Keep suggestions realistic and tied to the data."
        )

        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    def get_explanation(self, req: ExplanationRequest) -> dict[str, Any]:
        if not self._client:
            return self._fallback_response()

        try:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=self.build_prompt(req),
                temperature=0.3,
                response_format={"type": "json_object"},
            )

            raw = completion.choices[0].message.content or "{}"

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                # Sometimes LLM returns extra text → try to extract JSON
                start = raw.find("{")
                end = raw.rfind("}") + 1
                data = json.loads(raw[start:end]) if start != -1 else {}

            return self._normalize_response(data)

        except Exception as e:
            print("AI ERROR:", str(e))
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