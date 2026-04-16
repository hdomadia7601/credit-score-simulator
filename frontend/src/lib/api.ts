import type {
  CreditInputs,
  ExplanationResponse,
  ScenarioResponse,
  ScoreResponse,
} from './types'

const API_BASE = '/api'

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`)
  }

  return (await res.json()) as T
}

export function calculateScore(inputs: CreditInputs): Promise<ScoreResponse> {
  return postJson<ScoreResponse>('/calculate-score', inputs)
}

export function getExplanation(
  payload: {
    inputs: CreditInputs
    credit_score: number
    factor_breakdown: ScoreResponse['factor_breakdown']
    question: string
  },
): Promise<ExplanationResponse> {
  return postJson<ExplanationResponse>('/get-explanation', payload)
}

export function simulateScenario(payload: {
  current_inputs: CreditInputs
  scenario_inputs: Partial<CreditInputs>
  use_ai?: boolean
}): Promise<ScenarioResponse> {
  return postJson<ScenarioResponse>('/simulate-scenario', payload)
}

