import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import type { CreditInputs, ExplanationResponse, ScoreResponse } from '../lib/types'

type Props = {
  disabled: boolean
  inputs: CreditInputs
  score: ScoreResponse | null
  onExplain: (args: { question: string }) => Promise<ExplanationResponse>
}

export default function AIExplanation({ disabled, score, onExplain }: Props) {
  const [question, setQuestion] = useState('How can I improve my credit score fastest?')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<ExplanationResponse | null>(null)

  const topNegatives = useMemo(() => response?.structured?.top_negative_factors ?? [], [response])
  const suggestions = useMemo(
    () => response?.structured?.actionable_suggestions ?? [],
    [response],
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">AI explanation</div>
          <div className="text-xs text-gray-500 mt-1">
            Simple, non-technical feedback based on your current inputs.
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          {score ? `Estimated score: ${score.credit_score}` : 'Compute a score first'}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs text-gray-600">Your question</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium border transition',
              disabled
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
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
            {loading ? 'Generating…' : 'Explain my score'}
          </button>

          <div className="text-xs text-gray-500">
            {response ? 'Updated from latest score.' : 'Try: “What’s hurting my score most?”'}
          </div>
        </div>

        {error ? <div className="mt-3 text-xs text-rose-700">{error}</div> : null}
      </div>

      <AnimatePresence mode="wait">
        {response ? (
          <motion.div
            key="ai-response"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="text-xs text-gray-500">Summary</div>
            <div className="text-sm mt-1 text-gray-900 whitespace-pre-wrap">
              {response.assistant_response}
            </div>

            {topNegatives.length ? (
              <div className="mt-4">
                <div className="text-xs text-gray-500">Top negative factors</div>
                <div className="mt-2 space-y-2">
                  {topNegatives.map((t, idx) => (
                    <div key={idx} className="text-sm text-gray-800">
                      • {t}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {suggestions.length ? (
              <div className="mt-4">
                <div className="text-xs text-gray-500">Actionable suggestions</div>
                <div className="mt-2 space-y-2">
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="text-sm text-gray-800">
                      • {s}
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

