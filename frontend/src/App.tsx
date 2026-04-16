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
    if (!status) return 'border-gray-200 bg-white text-gray-700'
    if (status === 'High Approval') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    if (status === 'Moderate Approval') return 'border-blue-200 bg-blue-50 text-blue-700'
    return 'border-red-200 bg-red-50 text-red-700'
  }, [score?.approval_status])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Fintech Simulator
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
              Credit Score Intelligence
            </div>
          </div>
          <div className="text-right text-xs font-medium text-gray-500">
            Session-based • Real-time
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 xl:grid-cols-12"
      >
        <aside className="space-y-6 xl:col-span-3 xl:sticky xl:top-24 self-start">
          <InputPanel inputs={inputs} onChange={(next) => setInputs(next)} />
        </aside>

        <section className="space-y-6 xl:col-span-6">
          <ScoreDisplay
            score={score}
            loading={loadingScore}
            error={scoreError}
            approvalColor={approvalColor}
          />

          <FactorBreakdownView breakdown={score?.factor_breakdown ?? null} />

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
                className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600 shadow-sm"
              >
                Tip: test one improvement at a time to understand which action creates the biggest lift.
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside className="space-y-6 xl:col-span-3 xl:sticky xl:top-24 self-start">
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
      </motion.main>
    </div>
  )
}

