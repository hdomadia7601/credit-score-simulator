import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type {
  ApprovalStatus,
  CreditInputs,
  ExplanationResponse,
  ScoreResponse,
} from './lib/types'

import { calculateScore, getExplanation, simulateScenario } from './lib/api'
import { useSessionStorageState } from './hooks/useSessionStorageState'
import InputPanel from './components/InputPanel'
import ScoreDisplay from './components/ScoreDisplay'
import FactorBreakdownView from './components/FactorBreakdownView'
import AIExplanation from './components/AIExplanation'
import ChatAssistant from './components/ChatAssistant'
import ScenarioComparison from './components/ScenarioComparison'

const DEFAULT_INPUTS: CreditInputs = {
  monthly_income: 8000,
  monthly_expenses: 5500,
  credit_utilization_pct: 45,
  missed_payments_last_12_months: 1,
  credit_history_length_years: 5,
  active_loans: 2,
  credit_mix: 'average',
  recent_credit_inquiries: 2,
}

export default function App() {
  const [inputs, setInputs] = useSessionStorageState<CreditInputs>(
    'creditScoreSimulator.inputs',
    DEFAULT_INPUTS,
  )
  const [lastScore, setLastScore] = useSessionStorageState<ScoreResponse | null>(
    'creditScoreSimulator.lastScore',
    null,
  )

  const [score, setScore] = useState<ScoreResponse | null>(lastScore)
  const [loadingScore, setLoadingScore] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)

  // Debounce scoring so slider drags feel smooth.
  useEffect(() => {
    let cancelled = false
    const t = window.setTimeout(async () => {
      setLoadingScore(true)
      setScoreError(null)
      try {
        const res = await calculateScore(inputs)
        if (!cancelled) {
          setScore(res)
          setLastScore(res)
        }
      } catch {
        if (!cancelled) setScoreError('Unable to calculate score right now.')
      }

      if (!cancelled) setLoadingScore(false)
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [inputs, setLastScore])

  const approvalColor = useMemo(() => {
    const status: ApprovalStatus | null = score?.approval_status ?? null
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200'
    if (status === 'High Approval') return 'bg-blue-50 text-blue-800 border-blue-200'
    if (status === 'Moderate Approval') return 'bg-gray-50 text-gray-800 border-gray-200'
    return 'bg-gray-50 text-gray-800 border-gray-200'
  }, [score?.approval_status])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Credit Score Simulator</div>
            <div className="text-lg font-semibold tracking-tight text-gray-900">
              Understand what moves your score
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            Inputs persist only for this session (sessionStorage)
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <section className="space-y-6">
          <InputPanel
            inputs={inputs}
            onChange={(next) => setInputs(next)}
          />

          <ScoreDisplay score={score} loading={loadingScore} error={scoreError} approvalColor={approvalColor} />

          <FactorBreakdownView breakdown={score?.factor_breakdown ?? null} />

          <AIExplanation
            disabled={!score}
            inputs={inputs}
            score={score}
            onExplain={async ({ question }) => {
              if (!score) throw new Error('Score missing')
              const payload = {
                inputs,
                credit_score: score.credit_score,
                factor_breakdown: score.factor_breakdown,
                question,
              } satisfies Parameters<typeof getExplanation>[0]
              const res = await getExplanation(payload)
              return res as ExplanationResponse
            }}
          />

          <ScenarioComparison
            current={score}
            inputs={inputs}
            onCompare={simulateScenario}
          />

          <AnimatePresence>
            {score && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-gray-500"
              >
                Tip: Improve one driver at a time to see clearer deltas.
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside className="lg:sticky lg:top-6 self-start">
          <ChatAssistant
            disabled={!score}
            inputs={inputs}
            score={score}
            onAsk={async ({ question }) => {
              if (!score) throw new Error('Score missing')
              const payload = {
                inputs,
                credit_score: score.credit_score,
                factor_breakdown: score.factor_breakdown,
                question,
              } satisfies Parameters<typeof getExplanation>[0]
              const res = await getExplanation(payload)
              return res as ExplanationResponse
            }}
          />
        </aside>
      </main>
    </div>
  )
}

