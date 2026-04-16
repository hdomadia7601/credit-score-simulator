export type CreditMix = 'good' | 'average' | 'poor'
export type ApprovalStatus = 'High Approval' | 'Moderate Approval' | 'Likely Rejected'

export type FactorBreakdown = {
  payment_history: number
  utilization: number
  credit_age: number
  credit_mix: number
  inquiries: number
}

export type CreditInputs = {
  monthly_income: number
  monthly_expenses: number
  credit_utilization_pct: number
  missed_payments_last_12_months: number
  credit_history_length_years: number
  active_loans: number
  credit_mix: CreditMix
  recent_credit_inquiries: number
}

export type ScoreResponse = {
  credit_score: number
  approval_status: ApprovalStatus
  factor_breakdown: FactorBreakdown
}

export type ExplanationResponse = {
  assistant_response: string
  structured: {
    top_negative_factors?: string[]
    actionable_suggestions?: string[]
    fastest_improvement_path?: string
    [key: string]: unknown
  }
}

export type ScenarioResponse = {
  current: ScoreResponse
  improved: ScoreResponse
  delta_score: number
  factor_deltas: FactorBreakdown
  scenario_explanation: string
}

