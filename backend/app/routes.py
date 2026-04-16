from __future__ import annotations

import os
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


def _deterministic_explanation(req: ExplanationRequest) -> dict[str, Any]:
    breakdown = req.factor_breakdown.model_dump()

    # Negative factors are the lowest values.
    sorted_negative = sorted(
        [(k, v) for k, v in breakdown.items()],
        key=lambda kv: kv[1],
    )
    negative_keys = [k for k, v in sorted_negative if v < 0]
    top_negative = negative_keys[:3]

    factor_hints: dict[str, str] = {
        "payment_history": "Missed payments are reducing your score. Prioritize on-time payments (autopay helps).",
        "utilization": "Your utilization level is heavier than ideal. Paying down balances can help quickly.",
        "credit_age": "Short credit history can make your score less stable. Keeping accounts open helps over time.",
        "credit_mix": "Having a stronger mix of credit types can help a bit. Avoid opening new accounts just to chase this.",
        "inquiries": "Recent inquiries and active credit lines can weigh on your score. Minimize new applications unless necessary.",
    }

    top_negative_factors = [factor_hints.get(k, f"{k} is a negative driver.") for k in top_negative]

    actionable_suggestions: list[str] = []
    # Suggestions in order of what typically moves fastest.
    if "utilization" in breakdown and breakdown["utilization"] < 0:
        actionable_suggestions.append("Lower your credit utilization (aim for under 30%, and lower is better).")
    if "payment_history" in breakdown and breakdown["payment_history"] < 0:
        actionable_suggestions.append("If possible, make sure future payments are on time every month (autopay can help).")
    if "inquiries" in breakdown and breakdown["inquiries"] < 0:
        actionable_suggestions.append("Pause new credit applications for a few months so inquiries stop accumulating.")
    if not actionable_suggestions:
        actionable_suggestions.append("Maintain stable habits: keep utilization moderate and payments on time.")

    # Add a credit-age / credit-mix hint if relevant.
    if "credit_age" in breakdown and breakdown["credit_age"] < 0:
        actionable_suggestions.append("Don’t close older accounts; length of history improves score stability.")
    if "credit_mix" in breakdown and breakdown["credit_mix"] < 0:
        actionable_suggestions.append("If you don’t have a strong mix, consider strengthening it only when it makes sense for your overall plan.")

    fastest = (
        "Fastest improvement typically comes from lowering utilization and preventing missed payments. "
        "If you have recent inquiries, spacing out new applications can help too."
    )

    return {
        "assistant_response": fastest,
        "top_negative_factors": top_negative_factors[:2] if top_negative_factors else [],
        "actionable_suggestions": actionable_suggestions[:4],
        "fastest_improvement_path": fastest,
    }


@router.post("/calculate-score", response_model=ScoreResponse)
def calculate_score(inputs: CreditInputs) -> ScoreResponse:
    return calculate_credit_score(inputs)


@router.post("/get-explanation", response_model=ExplanationResponse)
def get_explanation(req: ExplanationRequest) -> ExplanationResponse:
    # AI is optional; scoring works without it.
    ai = AIService()
    if ai.is_configured:
        try:
            data = ai.get_explanation(req)
            return ExplanationResponse(
                assistant_response=str(data.get("assistant_response", "")),
                structured=data,
            )
        except Exception:
            # Fall back to deterministic output for reliability.
            pass

    deterministic = _deterministic_explanation(req)
    return ExplanationResponse(
        assistant_response=str(deterministic.get("assistant_response", "")),
        structured=deterministic,
    )


@router.post("/simulate-scenario", response_model=ScenarioResponse)
def simulate_scenario(req: ScenarioRequest) -> ScenarioResponse:
    current = calculate_credit_score(req.current_inputs)

    data = req.current_inputs.model_dump()
    for k, v in req.scenario_inputs.items():
        # Ignore unknown keys; keep validation in CreditInputs.
        if k in data:
            data[k] = v

    improved_inputs = CreditInputs.model_validate(data)
    improved = calculate_credit_score(improved_inputs)

    delta_score = improved.credit_score - current.credit_score
    factor_deltas = FactorBreakdown(
        payment_history=int(
            round(
                improved.factor_breakdown.payment_history
                - current.factor_breakdown.payment_history,
            )
        ),
        utilization=int(round(improved.factor_breakdown.utilization - current.factor_breakdown.utilization)),
        credit_age=int(round(improved.factor_breakdown.credit_age - current.factor_breakdown.credit_age)),
        credit_mix=int(round(improved.factor_breakdown.credit_mix - current.factor_breakdown.credit_mix)),
        inquiries=int(round(improved.factor_breakdown.inquiries - current.factor_breakdown.inquiries)),
    )

    deltas = factor_deltas.model_dump()

    # Pick the most meaningful changes.
    sorted_by_mag = sorted(deltas.items(), key=lambda kv: abs(kv[1]), reverse=True)
    top_changes = [(k, d) for k, d in sorted_by_mag if d != 0][:3]

    if delta_score > 0:
        drivers = ", ".join([f"{k.replace('_', ' ')} ({'+' if d>0 else ''}{round(d,1)})" for k, d in top_changes])
        scenario_explanation = (
            f"Your score improved by {delta_score} points. The biggest change came from {drivers}. "
            "This generally indicates lower risk in the areas you adjusted."
        )
    elif delta_score < 0:
        drivers = ", ".join([f"{k.replace('_', ' ')} ({'+' if d>0 else ''}{round(d,1)})" for k, d in top_changes])
        scenario_explanation = (
            f"Your score decreased by {abs(delta_score)} points. The biggest change came from {drivers}. "
            "This suggests higher risk based on the inputs you changed."
        )
    else:
        scenario_explanation = (
            "Your score stayed the same. The scenario changes were neutral relative to your current factor balance."
        )

    # Optional AI narrative for scenario comparison.
    if req.use_ai and os.getenv("OPENAI_API_KEY"):
        try:
            ai_req = ExplanationRequest(
                inputs=improved_inputs,
                credit_score=improved.credit_score,
                factor_breakdown=improved.factor_breakdown,
                question=(
                    "Compare my current score vs this improved scenario. "
                    f"Current score: {current.credit_score}. Improved score: {improved.credit_score}. "
                    "Explain why it changed and what to do next."
                ),
            )
            ai = AIService()
            data = ai.get_explanation(ai_req)
            scenario_explanation = str(data.get("assistant_response", scenario_explanation))
        except Exception:
            pass

    return ScenarioResponse(
        current=current,
        improved=improved,
        delta_score=delta_score,
        factor_deltas=factor_deltas,
        scenario_explanation=scenario_explanation,
    )

