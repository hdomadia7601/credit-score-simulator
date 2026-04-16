import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import type { CreditInputs, ExplanationResponse, ScoreResponse } from '../lib/types'

type Props = {
  disabled: boolean
  inputs: CreditInputs
  score: ScoreResponse | null
  onAsk: (args: { question: string }) => Promise<ExplanationResponse>
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

function makeId() {
  return Math.random().toString(16).slice(2)
}

export default function ChatAssistant({ disabled, inputs, score, onAsk }: Props) {
  void inputs
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: 'assistant',
      text: 'Ask a question like “How can I improve my score fastest?” and I’ll tailor it to your inputs.',
    },
  ])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickQuestions = useMemo(
    () => [
      'How can I improve my score fastest?',
      'What happens if I reduce utilization?',
      'Which factor is hurting me most?',
    ],
    [],
  )

  async function send(question: string) {
    const q = question.trim()
    if (!q) return
    if (!score) return

    setError(null)
    setLoading(true)
    const userMsg: ChatMessage = { id: makeId(), role: 'user', text: q }
    setMessages((m) => [...m, userMsg])

    try {
      const res = await onAsk({ question: q })
      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        text: res.assistant_response,
      }
      setMessages((m) => [...m, assistantMsg])
    } catch {
      setError('Could not reach the explanation service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Credit advisor</div>
          <div className="text-xs text-gray-500 mt-1">AI-powered guidance based on your current scenario.</div>
        </div>
        <div className="text-right text-xs text-gray-500">{score ? `Score: ${score.credit_score}` : 'Compute score'}</div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              disabled={disabled || loading || !score}
              onClick={() => send(q)}
              className={[
                'rounded-full px-3 py-1 text-xs border transition',
                disabled || loading || !score
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
              ].join(' ')}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="max-h-[360px] overflow-auto pr-2">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={m.role === 'user' ? 'flex justify-end my-2' : 'flex justify-start my-2'}
              >
                <div
                  className={[
                    'rounded-xl px-3 py-2 text-sm border',
                    m.role === 'user'
                      ? 'bg-blue-50 border-blue-200 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-900',
                  ].join(' ')}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error ? <div className="text-xs text-rose-700 mt-2">{error}</div> : null}

        <div className="mt-3 flex items-center gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder={score ? 'Type your question…' : 'Compute a score to enable chat'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={disabled || loading || !score}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send(draft)
            }}
          />
          <button
            type="button"
            disabled={disabled || loading || !score || !draft.trim()}
            onClick={() => send(draft)}
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium border transition',
              disabled || loading || !score || !draft.trim()
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
            ].join(' ')}
          >
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

