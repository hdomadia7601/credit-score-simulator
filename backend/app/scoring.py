from __future__ import annotations

from .models import CreditInputs, FactorBreakdown, ScoreResponse, ApprovalStatus


BASE_SCORE = 750
MIN_SCORE = 300
MAX_SCORE = 900


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


# -----------------------------
# FACTOR CALCULATIONS
# -----------------------------

def _payment_history_delta(inputs: CreditInputs) -> float:
    """
    Missed payments + cashflow stability
    """

    missed = inputs.missed_payments_last_12_months
    cash_flow = inputs.monthly_income - inputs.monthly_expenses

    if missed == 0:
        delta = 52.5
    elif missed == 1:
        delta = 10.0
    elif missed == 2:
        delta = -55.0
    else:
        delta = -157.5

    if inputs.monthly_income <= 0 and inputs.monthly_expenses <= 0:
        return delta

    ratio = cash_flow / (inputs.monthly_income + 1.0)

    if ratio < 0:
        delta -= 20.0
    elif ratio < 0.05:
        delta -= 10.0
    elif ratio > 0.25 and missed == 0:
        delta += 5.0

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
    Combines:
    - recent inquiries
    - active loans
    """

    loan_driver = max(0, inputs.active_loans - 3) * 0.75
    effective = inputs.recent_credit_inquiries + loan_driver

    if effective <= 1.0:
        return 15.0
    if effective <= 3.0:
        return 0.0
    if effective <= 5.0:
        return -30.0
    return -45.0


# -----------------------------
# APPROVAL LOGIC
# -----------------------------

def _approval_status(score: int) -> ApprovalStatus:
    if score >= 750:
        return "High Approval"
    if score >= 650:
        return "Moderate Approval"
    return "Likely Rejected"


# -----------------------------
# MAIN FUNCTION
# -----------------------------

def calculate_credit_score(inputs: CreditInputs) -> ScoreResponse:
    payment_history = _payment_history_delta(inputs)
    utilization = _utilization_delta(inputs)
    credit_age = _credit_age_delta(inputs)
    credit_mix = _credit_mix_delta(inputs)
    inquiries = _inquiries_delta(inputs)

    total_adjustment = (
        payment_history
        + utilization
        + credit_age
        + credit_mix
        + inquiries
    )

    raw_score = BASE_SCORE + total_adjustment
    clamped_score = _clamp(raw_score, MIN_SCORE, MAX_SCORE)
    final_score = int(round(clamped_score))

    breakdown = FactorBreakdown(
        payment_history=int(round(payment_history)),
        utilization=int(round(utilization)),
        credit_age=int(round(credit_age)),
        credit_mix=int(round(credit_mix)),
        inquiries=int(round(inquiries)),
    )

    return ScoreResponse(
        credit_score=final_score,
        approval_status=_approval_status(final_score),
        factor_breakdown=breakdown,
    )