from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

CreditMix = Literal["good", "average", "poor"]
ApprovalStatus = Literal["High Approval", "Moderate Approval", "Likely Rejected"]


class CreditInputs(BaseModel):
    monthly_income: float = Field(..., ge=0, le=1_000_000)
    monthly_expenses: float = Field(..., ge=0, le=1_000_000)
    credit_utilization_pct: float = Field(..., ge=0, le=100)
    missed_payments_last_12_months: int = Field(..., ge=0, le=12)
    credit_history_length_years: float = Field(..., ge=0, le=60)
    active_loans: int = Field(..., ge=0, le=50)
    credit_mix: CreditMix
    recent_credit_inquiries: int = Field(..., ge=0, le=50)


class FactorBreakdown(BaseModel):
    # Contributions in "score points" added to `base_score`.
    payment_history: int
    utilization: int
    credit_age: int
    credit_mix: int
    inquiries: int


class ScoreResponse(BaseModel):
    credit_score: int
    approval_status: ApprovalStatus
    factor_breakdown: FactorBreakdown


class ExplanationRequest(BaseModel):
    inputs: CreditInputs
    credit_score: int
    factor_breakdown: FactorBreakdown
    question: Optional[str] = Field(
        default="How can I improve my credit score fastest?"
    )


class ExplanationResponse(BaseModel):
    assistant_response: str
    structured: dict


class ScenarioRequest(BaseModel):
    current_inputs: CreditInputs
    scenario_inputs: dict = Field(
        ...,
        description="Partial inputs to override; keys must match CreditInputs fields.",
    )
    use_ai: bool = Field(
        default=False,
        description="Currently optional. If false, scenario explanation is deterministic.",
    )


class ScenarioResponse(BaseModel):
    current: ScoreResponse
    improved: ScoreResponse
    delta_score: int
    factor_deltas: FactorBreakdown
    scenario_explanation: str

