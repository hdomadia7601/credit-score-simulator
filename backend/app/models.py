from __future__ import annotations

from typing import Literal, Optional, Dict, Any

from pydantic import BaseModel, Field

# -----------------------------
# ENUM TYPES
# -----------------------------

CreditMix = Literal["good", "average", "poor"]
ApprovalStatus = Literal["High Approval", "Moderate Approval", "Likely Rejected"]

# -----------------------------
# INPUT MODEL
# -----------------------------

class CreditInputs(BaseModel):
    monthly_income: float = Field(..., ge=0, le=1_000_000)
    monthly_expenses: float = Field(..., ge=0, le=1_000_000)
    credit_utilization_pct: float = Field(..., ge=0, le=100)
    missed_payments_last_12_months: int = Field(..., ge=0, le=12)
    credit_history_length_years: float = Field(..., ge=0, le=60)
    active_loans: int = Field(..., ge=0, le=50)
    credit_mix: CreditMix
    recent_credit_inquiries: int = Field(..., ge=0, le=50)

# -----------------------------
# CORE SCORE STRUCTURES
# -----------------------------

class FactorBreakdown(BaseModel):
    # Contributions in "score points" added to base score
    payment_history: int
    utilization: int
    credit_age: int
    credit_mix: int
    inquiries: int

class ScoreResponse(BaseModel):
    credit_score: int
    approval_status: ApprovalStatus
    factor_breakdown: FactorBreakdown

# -----------------------------
# AI EXPLANATION
# -----------------------------

class ExplanationRequest(BaseModel):
    inputs: CreditInputs
    credit_score: int
    factor_breakdown: FactorBreakdown
    question: Optional[str] = Field(
        default="How can I improve my credit score fastest?"
    )

class ExplanationResponse(BaseModel):
    assistant_response: str
    top_negative_factors: list[str]
    actionable_suggestions: list[str]
    fastest_improvement_path: str

# -----------------------------
# SCENARIO COMPARISON
# -----------------------------

class ScenarioRequest(BaseModel):
    current_inputs: CreditInputs
    scenario_inputs: Dict[str, Any] = Field(
        ...,
        description="Partial inputs to override; keys must match CreditInputs fields.",
    )
    use_ai: bool = Field(
        default=False,
        description="If true, AI will generate explanation instead of deterministic logic.",
    )

class ScenarioResponse(BaseModel):
    current: ScoreResponse
    improved: ScoreResponse
    delta_score: int
    factor_deltas: FactorBreakdown
    scenario_explanation: str