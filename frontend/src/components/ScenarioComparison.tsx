import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import type { CreditInputs, CreditMix, FactorBreakdown, ScenarioResponse, ScoreResponse } from '../lib/types'
import type { ApprovalStatus } from '../lib/types'

type Props = {
  current: ScoreResponse | null
  inputs: CreditInputs
  onCompare: (payload: {
    current_inputs: CreditInputs
    scenario_inputs: Partial<CreditInputs>
  }) => Promise<ScenarioResponse>
}

function approvalColor(status: ApprovalStatus | null) {
  if (!status) return 'border-gray-200 bg-white text-gray-700'
  if (status === 'High Approval') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'Moderate Approval') return 'border-blue-200 bg-blue-50 text-blue-700'
  return 'border-red-200 bg-red-50 text-red-700'
}

function formatDelta(v: number) {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${Math.round(v)}`
}

function FactorDeltas({ deltas }: { deltas: FactorBreakdown }) {
  const items: { key: keyof FactorBreakdown; label: string }[] = [
    { key: 'payment_history', label: 'Payment history' },
    { key: 'utilization', label: 'Utilization' },
    { key: 'credit_age', label: 'Credit age' },
    { key: 'credit_mix', label: 'Credit mix' },
    { key: 'inquiries', label: 'Inquiries + loans' },
  ]

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((it) => {
        const v = deltas[it.key]
        const improved = v >= 0
        return (
          <div
            key={it.key}
            className={[
              'rounded-lg border p-3',
              improved ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-gray-200 bg-gray-50 text-gray-800',
            ].join(' ')}
          >
            <div className="text-sm font-medium">{it.label}</div>
            <div className="text-xs text-gray-600 mt-1">Impact on score</div>
            <div className="text-lg font-semibold tabular-nums mt-2">{formatDelta(v)}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function ScenarioComparison({ current, inputs, onCompare }: Props) {
  const [targetUtilization, setTargetUtilization] = useState(inputs.credit_utilization_pct)
  const [targetMissed, setTargetMissed] = useState(inputs.missed_payments_last_12_months)
  const [targetInquiries, setTargetInquiries] = useState(inputs.recent_credit_inquiries)
  const [targetMix, setTargetMix] = useState<CreditMix>(inputs.credit_mix)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScenarioResponse | null>(null)

  const isImprovementLikely = useMemo(() => {
    // Heuristic: only show an "improvement" hint when the scenario tightens the two biggest drivers.
    return (
      targetUtilization < inputs.credit_utilization_pct ||
      targetMissed < inputs.missed_payments_last_12_months ||
      targetInquiries <= inputs.recent_credit_inquiries
    )
  }, [inputs, targetInquiries, targetMissed, targetUtilization])

  // Keep scenario controls in sync when user changes base inputs.
  useEffect(() => {
    setTargetUtilization(inputs.credit_utilization_pct)
    setTargetMissed(inputs.missed_payments_last_12_months)
    setTargetInquiries(inputs.recent_credit_inquiries)
    setTargetMix(inputs.credit_mix)
    setResult(null)
  }, [inputs])

  async function compare() {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        current_inputs: inputs,
        scenario_inputs: {
          credit_utilization_pct: targetUtilization,
          missed_payments_last_12_months: targetMissed,
          recent_credit_inquiries: targetInquiries,
          credit_mix: targetMix,
        },
      }
      const res = await onCompare(payload)
      setResult(res)
    } catch {
      setError('Could not compare scenarios right now.')
    } finally {
      setLoading(false)
    }
  }

  const delta = result?.delta_score ?? 0

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Scenario Simulator
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-950">
            Run a what-if improvement path
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Compare current score against a cleaner behavior profile.
          </div>
        </div>
        <div className="text-right text-xs font-medium text-gray-500">
          {isImprovementLikely ? 'Likely improves score' : 'Adjust targets to see change'}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
            Target utilization
          </div>
          <div className="mt-2 text-lg font-semibold tabular-nums text-gray-950">
            {targetUtilization}%
          </div>
          <input
            className="fintech-slider mt-4 w-full accent-black"
            type="range"
            min={0}
            max={100}
            step={1}
            value={targetUtilization}
            onChange={(e) => setTargetUtilization(Number(e.target.value))}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
            Target missed payments
          </div>
          <div className="mt-2 text-lg font-semibold tabular-nums text-gray-950">
            {targetMissed} missed
          </div>
          <input
            className="fintech-slider mt-4 w-full accent-black"
            type="range"
            min={0}
            max={12}
            step={1}
            value={targetMissed}
            onChange={(e) => setTargetMissed(Number(e.target.value))}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
            Target inquiries
          </div>
          <div className="mt-2 text-lg font-semibold tabular-nums text-gray-950">
            {targetInquiries} inquiries
          </div>
          <input
            className="fintech-slider mt-4 w-full accent-black"
            type="range"
            min={0}
            max={12}
            step={1}
            value={targetInquiries}
            onChange={(e) => setTargetInquiries(Number(e.target.value))}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
            Target credit mix
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-950 capitalize">{targetMix}</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['good', 'average', 'poor'] as CreditMix[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTargetMix(m)}
                className={[
                  'rounded-2xl border px-3 py-3 text-left text-sm font-medium capitalize transition',
                  targetMix === m
                    ? 'border-gray-900 bg-gray-950 text-white'
                    : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled={!current || loading}
          onClick={compare}
          className={[
            'w-full rounded-2xl px-4 py-3 text-sm font-medium transition',
            !current || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-950 text-white hover:opacity-90',
          ].join(' ')}
        >
          {loading ? 'Running simulation…' : 'Run Simulation'}
        </button>
      </div>

      {error ? <div className="mt-3 text-sm text-red-500">{error}</div> : null}

      <AnimatePresence>
        {result ? (
          <motion.div
            key="scenario-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                Simulation result
              </div>
              <div
                className={[
                  'mt-3 text-5xl font-semibold tracking-tight tabular-nums',
                  result.delta_score >= 0 ? 'text-emerald-500' : 'text-red-500',
                ].join(' ')}
              >
                {delta >= 0 ? '+' : ''}
                {delta}
              </div>
              <div className="mt-1 text-sm text-gray-500">Projected score delta</div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                    Before
                  </div>
                  <div className="mt-2 text-3xl font-semibold tabular-nums text-gray-950">
                    {result.current.credit_score}
                  </div>
                  <div className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs ${approvalColor(result.current.approval_status)}`}>
                    {result.current.approval_status}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                    After
                  </div>
                  <div className="mt-2 text-3xl font-semibold tabular-nums text-gray-950">
                    {result.improved.credit_score}
                  </div>
                  <div className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs ${approvalColor(result.improved.approval_status)}`}>
                    {result.improved.approval_status}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">
                {result.scenario_explanation}
              </div>
            </div>

            <FactorDeltas deltas={result.factor_deltas} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

