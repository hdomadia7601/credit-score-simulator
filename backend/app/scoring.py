from __future__ import annotations

from dataclasses import dataclass

from .models import CreditInputs, FactorBreakdown, ScoreResponse


BASE_SCORE = 750
MIN_SCORE = 300
MAX_SCORE = 900


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _payment_history_delta(inputs: CreditInputs) -> float:
    """
    Simplified scoring:
    - Missed payments are the dominant driver.
    - Weak cashflow (expenses >= income) adds extra risk.
    """

    missed = inputs.missed_payments_last_12_months
    cash_flow = inputs.monthly_income - inputs.monthly_expenses

    # Dominant missed-payment penalty/bonus.
    if missed == 0:
        delta = 52.5
    elif missed == 1:
        delta = 10.0
    elif missed == 2:
        delta = -55.0
    else:
        delta = -157.5

    # Cashflow risk: penalize when the user is often cash-strapped.
    if inputs.monthly_income <= 0 and inputs.monthly_expenses <= 0:
        return delta

    # cashflow ratio in [-1, +inf); clamp for stability.
    ratio = cash_flow / (inputs.monthly_income + 1.0)
    if ratio < 0:
        delta -= 20.0
    elif ratio < 0.05:
        delta -= 10.0
    elif ratio > 0.25 and missed == 0:
        delta += 5.0

    # If missed payments exist, weak cashflow makes it worse.
    if missed >= 1 and ratio < 0.05:
        delta -= 10.0

    return delta


def _utilization_delta(inputs: CreditInputs) -> float:
    u = inputs.credit_utilization_pct
    if u <= 20:
        return 45.0
    if u <= 30:
        return 15.0
    if u <= 50:
        return 0.0
    if u <= 70:
        return -90.0
    return -135.0


def _credit_age_delta(inputs: CreditInputs) -> float:
    y = inputs.credit_history_length_years
    if y < 1:
        return -67.5
    if y < 2:
        return -30.0
    if y < 5:
        return 0.0
    if y < 10:
        return 15.0
    return 22.5


def _credit_mix_delta(inputs: CreditInputs) -> float:
    if inputs.credit_mix == "good":
        return 15.0
    if inputs.credit_mix == "average":
        return 0.0
    return -45.0


def _inquiries_delta(inputs: CreditInputs) -> float:
    """
    Includes both:
    - recent credit inquiries
    - active loans (more active credit tends to increase risk)
    """

    # Turn active loans into an "effective inquiries" driver.
    loan_driver = max(0, inputs.active_loans - 3) * 0.75
    effective = inputs.recent_credit_inquiries + loan_driver

    if effective <= 1.0:
        return 15.0
    if effective <= 3.0:
        return 0.0
    if effective <= 5.0:
        return -30.0
    return -45.0


def _approval_status(credit_score: int) -> str:
    if credit_score >= 750:
        return "High Approval"
    if credit_score >= 650:
        return "Moderate Approval"
    return "Likely Rejected"


def calculate_credit_score(inputs: CreditInputs) -> ScoreResponse:
    payment_history = _payment_history_delta(inputs)
    utilization = _utilization_delta(inputs)
    credit_age = _credit_age_delta(inputs)
    credit_mix = _credit_mix_delta(inputs)
    inquiries = _inquiries_delta(inputs)

    total_adjustment = payment_history + utilization + credit_age + credit_mix + inquiries
    raw_score = BASE_SCORE + total_adjustment
    clamped = _clamp(raw_score, MIN_SCORE, MAX_SCORE)
    credit_score = int(round(clamped))

    # Round factor deltas for clean explainability.
    breakdown = FactorBreakdown(
        payment_history=int(round(payment_history)),
        utilization=int(round(utilization)),
        credit_age=int(round(credit_age)),
        credit_mix=int(round(credit_mix)),
        inquiries=int(round(inquiries)),
    )

    return ScoreResponse(
        credit_score=credit_score,
        approval_status=_approval_status(credit_score),  # type: ignore[arg-type]
        factor_breakdown=breakdown,
    )

