import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import type { CreditInputs, ExplanationResponse, ScoreResponse } from '../lib/types'

type Props = {
  disabled: boolean
  inputs: CreditInputs
  score: ScoreResponse | null
  onExplain: (args: { question: string }) => Promise<ExplanationResponse>
}

export default function AIExplanation({ disabled, inputs, score, onExplain }: Props) {
  void inputs
  const [question, setQuestion] = useState('How can I improve my credit score fastest?')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<ExplanationResponse | null>(null)

  const topNegatives = useMemo(() => response?.structured?.top_negative_factors ?? [], [response])
  const suggestions = useMemo(
    () => response?.structured?.actionable_suggestions ?? [],
    [response],
  )

  useEffect(() => {
    let cancelled = false
    if (disabled || !score) {
      setResponse(null)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await onExplain({ question: 'Summarize what is hurting my score and what I should do next.' })
        if (!cancelled) setResponse(res)
      } catch {
        if (!cancelled) setError('Could not refresh AI suggestions right now.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [disabled, onExplain, score])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            AI Advisor
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-950">
            Personalized next best actions
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Live guidance generated from the current credit profile.
          </div>
        </div>
        <div className="text-right text-xs font-medium text-gray-500">
          {score ? `Estimated score: ${score.credit_score}` : 'Compute a score first'}
        </div>
      </div>

      <div className="mt-5">
        <label className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
          Ask for a deeper explanation
        </label>
        <textarea
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:bg-white"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className={[
              'rounded-2xl px-4 py-2.5 text-sm font-medium transition',
              disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-950 text-white hover:opacity-90',
            ].join(' ')}
            onClick={async () => {
              setLoading(true)
              setError(null)
              try {
                const res = await onExplain({ question: question.trim() })
                setResponse(res)
              } catch {
                setError('Could not generate explanation right now.')
              } finally {
                setLoading(false)
              }
            }}
            disabled={disabled || loading}
          >
            {loading ? 'Generating…' : 'Refresh insight'}
          </button>

          <div className="text-xs text-gray-500">
            {response ? 'Synced with current score.' : 'Advisor loads automatically.'}
          </div>
        </div>

        {error ? <div className="mt-3 text-xs text-red-500">{error}</div> : null}
      </div>

      <AnimatePresence mode="wait">
        {response ? (
          <motion.div
            key="ai-response"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 space-y-4"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                Summary
              </div>
              <div className="mt-2 text-sm leading-6 text-gray-900 whitespace-pre-wrap">
                {response.assistant_response}
              </div>
            </div>

            {topNegatives.length ? (
              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                  What&apos;s hurting your score
                </div>
                <div className="mt-2 space-y-2">
                  {topNegatives.map((t, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {suggestions.length ? (
              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                  What you should do
                </div>
                <div className="mt-2 space-y-2">
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

