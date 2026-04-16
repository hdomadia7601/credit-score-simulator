import { AnimatePresence, motion } from 'framer-motion'

import type { ScoreResponse } from '../lib/types'

type Props = {
  score: ScoreResponse | null
  loading: boolean
  error: string | null
  approvalColor: string
}

export default function ScoreDisplay({ score, loading, error, approvalColor }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">Credit score</div>

          <div className="mt-2 flex items-end gap-3">
            <AnimatePresence mode="wait">
              {!score ? null : (
                <motion.div
                  key={score.credit_score}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-4xl font-semibold tracking-tight text-gray-900 tabular-nums"
                >
                  {score.credit_score}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pb-1">
              <div className="text-xs text-gray-500">Range</div>
              <div className="text-sm font-medium text-gray-900">300 - 900</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            {loading ? 'Updating…' : score ? 'Real-time estimate based on your inputs.' : 'Adjust inputs to see your score.'}
          </div>
        </div>

        <div className="text-right">
          <div
            className={[
              'inline-flex items-center rounded-full border px-3 py-2 text-xs font-medium',
              approvalColor,
            ].join(' ')}
          >
            {score ? score.approval_status : '—'}
          </div>

          {error ? <div className="mt-2 text-xs text-rose-700">{error}</div> : null}
        </div>
      </div>
    </div>
  )
}

