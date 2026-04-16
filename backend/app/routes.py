from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from .ai_service import AIService
from .models import (
    CreditInputs,
    ExplanationRequest,
    ExplanationResponse,
    FactorBreakdown,
    ScenarioRequest,
    ScenarioResponse,
    ScoreResponse,
)
from .scoring import calculate_credit_score


router = APIRouter()

# -----------------------------
# DETERMINISTIC FALLBACK
# -----------------------------

def _deterministic_explanation(req: ExplanationRequest) -> dict[str, Any]:
    breakdown = req.factor_breakdown.model_dump()

    sorted_negative = sorted(
        [(k, v) for k, v in breakdown.items()],
        key=lambda kv: kv[1],
    )

    negative_keys = [k for k, v in sorted_negative if v < 0]
    top_negative = negative_keys[:3]

    factor_hints = {
        "payment_history": "Missed payments are reducing your score.",
        "utilization": "High credit utilization is hurting your score.",
        "credit_age": "Short credit history reduces stability.",
        "credit_mix": "Weak credit mix slightly affects your score.",
        "inquiries": "Too many inquiries can lower your score.",
    }

    top_negative_factors = [
        factor_hints.get(k, f"{k} is impacting your score.")
        for k in top_negative
    ]

    actionable_suggestions = []

    if breakdown.get("utilization", 0) < 0:
        actionable_suggestions.append("Reduce credit utilization below 30%.")

    if breakdown.get("payment_history", 0) < 0:
        actionable_suggestions.append("Ensure all payments are made on time.")

    if breakdown.get("inquiries", 0) < 0:
        actionable_suggestions.append("Avoid applying for new credit for a while.")

    if breakdown.get("credit_age", 0) < 0:
        actionable_suggestions.append("Keep older accounts open to improve credit age.")

    if breakdown.get("credit_mix", 0) < 0:
        actionable_suggestions.append("Maintain a balanced mix of credit types.")

    if not actionable_suggestions:
        actionable_suggestions.append("Maintain consistent financial habits.")

    fastest = (
        "Lower your credit utilization and avoid missed payments for the fastest improvement."
    )

    return {
        "assistant_response": fastest,
        "top_negative_factors": top_negative_factors[:3],
        "actionable_suggestions": actionable_suggestions[:4],
        "fastest_improvement_path": fastest,
    }

# -----------------------------
# ROUTES
# -----------------------------

@router.post("/calculate-score", response_model=ScoreResponse)
def calculate_score(inputs: CreditInputs) -> ScoreResponse:
    return calculate_credit_score(inputs)


@router.post("/get-explanation", response_model=ExplanationResponse)
def get_explanation(req: ExplanationRequest) -> ExplanationResponse:
    ai = AIService()

    if ai.is_configured:
        try:
            data = ai.get_explanation(req)

            return ExplanationResponse(
                assistant_response=data.get("assistant_response", ""),
                top_negative_factors=data.get("top_negative_factors", []),
                actionable_suggestions=data.get("actionable_suggestions", []),
                fastest_improvement_path=data.get("fastest_improvement_path", ""),
            )

        except Exception as e:
            print("AI ERROR:", str(e))

    # fallback
    deterministic = _deterministic_explanation(req)

    return ExplanationResponse(
        assistant_response=deterministic["assistant_response"],
        top_negative_factors=deterministic["top_negative_factors"],
        actionable_suggestions=deterministic["actionable_suggestions"],
        fastest_improvement_path=deterministic["fastest_improvement_path"],
    )


@router.post("/simulate-scenario", response_model=ScenarioResponse)
def simulate_scenario(req: ScenarioRequest) -> ScenarioResponse:
    current = calculate_credit_score(req.current_inputs)

    data = req.current_inputs.model_dump()

    for k, v in req.scenario_inputs.items():
        if k in data:
            data[k] = v

    improved_inputs = CreditInputs.model_validate(data)
    improved = calculate_credit_score(improved_inputs)

    delta_score = improved.credit_score - current.credit_score

    factor_deltas = FactorBreakdown(
        payment_history=improved.factor_breakdown.payment_history - current.factor_breakdown.payment_history,
        utilization=improved.factor_breakdown.utilization - current.factor_breakdown.utilization,
        credit_age=improved.factor_breakdown.credit_age - current.factor_breakdown.credit_age,
        credit_mix=improved.factor_breakdown.credit_mix - current.factor_breakdown.credit_mix,
        inquiries=improved.factor_breakdown.inquiries - current.factor_breakdown.inquiries,
    )

    # Explanation (clean + simple)
    if delta_score > 0:
        scenario_explanation = f"Your score improved by {delta_score} points due to better financial behavior."
    elif delta_score < 0:
        scenario_explanation = f"Your score dropped by {abs(delta_score)} points due to increased risk factors."
    else:
        scenario_explanation = "No significant change in score."

    return ScenarioResponse(
        current=current,
        improved=improved,
        delta_score=delta_score,
        factor_deltas=factor_deltas,
        scenario_explanation=scenario_explanation,
    )