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
  if (!status) return 'bg-gray-50 text-gray-700 border-gray-200'
  if (status === 'High Approval') return 'bg-blue-50 text-blue-800 border-blue-200'
  return 'bg-gray-50 text-gray-800 border-gray-200'
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
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Scenario comparison</div>
          <div className="text-xs text-gray-500 mt-1">
            Simulate improvements and compare score deltas.
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          {isImprovementLikely ? 'Likely improves score' : 'Adjust targets to see change'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="text-xs text-gray-500">Target utilization (%)</div>
          <div className="text-sm font-semibold tabular-nums text-gray-900 mt-1">
            {targetUtilization}%
          </div>
          <input
            className="mt-3 w-full accent-blue-600"
            type="range"
            min={0}
            max={100}
            step={1}
            value={targetUtilization}
            onChange={(e) => setTargetUtilization(Number(e.target.value))}
          />
        </div>

        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="text-xs text-gray-500">Target missed payments</div>
          <div className="text-sm font-semibold tabular-nums text-gray-900 mt-1">
            {targetMissed} missed
          </div>
          <input
            className="mt-3 w-full accent-blue-600"
            type="range"
            min={0}
            max={12}
            step={1}
            value={targetMissed}
            onChange={(e) => setTargetMissed(Number(e.target.value))}
          />
        </div>

        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="text-xs text-gray-500">Target recent inquiries</div>
          <div className="text-sm font-semibold tabular-nums text-gray-900 mt-1">
            {targetInquiries} inquiries
          </div>
          <input
            className="mt-3 w-full accent-blue-600"
            type="range"
            min={0}
            max={12}
            step={1}
            value={targetInquiries}
            onChange={(e) => setTargetInquiries(Number(e.target.value))}
          />
        </div>

        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="text-xs text-gray-500">Target credit mix</div>
          <div className="text-sm font-semibold text-gray-900 mt-1 capitalize">{targetMix}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['good', 'average', 'poor'] as CreditMix[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTargetMix(m)}
                className={[
                  'rounded-full px-3 py-1 text-xs border transition capitalize',
                  targetMix === m
                    ? 'border-blue-200 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={!current || loading}
          onClick={compare}
          className={[
            'rounded-lg px-4 py-2 text-sm font-medium border transition',
            !current || loading
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
          ].join(' ')}
        >
          {loading ? 'Comparing…' : 'Compare scenario'}
        </button>

        {error ? <div className="text-xs text-rose-700">{error}</div> : null}
      </div>

      <AnimatePresence>
        {result ? (
          <motion.div
            key="scenario-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5"
          >
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-gray-900">Result</div>
                <div
                  className={[
                    'rounded-full border px-3 py-2 text-xs font-medium',
                    result.delta_score >= 0
                      ? 'border-blue-200 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-800',
                  ].join(' ')}
                >
                  Delta: {delta >= 0 ? '+' : ''}
                  {delta} pts
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="text-xs text-gray-500">Current</div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">{result.current.credit_score}</div>
                  <div className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs ${approvalColor(result.current.approval_status)}`}>
                    {result.current.approval_status}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="text-xs text-gray-500">Improved scenario</div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">{result.improved.credit_score}</div>
                  <div className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs ${approvalColor(result.improved.approval_status)}`}>
                    {result.improved.approval_status}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-800 mt-4 whitespace-pre-wrap">{result.scenario_explanation}</div>
            </div>

            <FactorDeltas deltas={result.factor_deltas} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

