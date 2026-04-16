import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { CreditInputs, ExplanationResponse, ScoreResponse } from '../lib/types'

// ✅ NEW TYPE FOR HISTORY
type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

// ✅ FIXED PROPS TYPE (history added)
type Props = {
  disabled: boolean
  inputs: CreditInputs
  score: ScoreResponse | null
  onAsk: (args: {
    question: string
    history: { role: string; content: string }[]
  }) => Promise<ExplanationResponse>
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
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const quickQuestions = useMemo(
    () => [
      'How can I improve my score fastest?',
      'What happens if I reduce utilization?',
      'Which factor is hurting me most?',
    ],
    [],
  )

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function send(question: string) {
    const q = question.trim()
    if (!q) return
    if (!score) return

    setError(null)
    setLoading(true)

    const userMsg: ChatMessage = { id: makeId(), role: 'user', text: q }
    setMessages((m) => [...m, userMsg])

    try {
      // ✅ BUILD HISTORY FROM CHAT
      const history = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }))

      const res = await onAsk({
        question: q,
        history,
      })

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        text: res.assistant_response,
      }

      setMessages((m) => [...m, assistantMsg])
      setDraft('')
    } catch {
      setError('Could not reach the explanation service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Chat Assistant
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-950">
            Ask follow-up questions
          </div>
          <div className="mt-1 text-sm text-gray-500">
            ChatGPT-lite guidance grounded in the current score state.
          </div>
        </div>
        <div className="text-right text-xs font-medium text-gray-500">
          {score ? `Score ${score.credit_score}` : 'Compute score'}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              disabled={disabled || loading || !score}
              onClick={() => send(q)}
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                disabled || loading || !score
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
        <div ref={scrollerRef} className="max-h-[420px] overflow-auto p-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={m.role === 'user' ? 'my-2 flex justify-end' : 'my-2 flex justify-start'}
              >
                <div
                  className={[
                    'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
                    m.role === 'user'
                      ? 'bg-gray-950 text-white'
                      : 'border border-gray-200 bg-white text-gray-900',
                  ].join(' ')}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="my-2 flex justify-start">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white p-3">
          {error && <div className="mb-2 text-xs text-red-500">{error}</div>}

          <div className="relative">
            <input
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-24 text-sm outline-none transition focus:border-gray-900 focus:bg-white"
              placeholder={score ? 'Type your question…' : 'Compute a score to enable chat'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={disabled || loading || !score}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send(draft)
                }
              }}
            />

            <button
              type="button"
              disabled={disabled || loading || !score || !draft.trim()}
              onClick={() => send(draft)}
              className={[
                'absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 text-sm font-medium transition',
                disabled || loading || !score || !draft.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-950 text-white hover:opacity-90',
              ].join(' ')}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}