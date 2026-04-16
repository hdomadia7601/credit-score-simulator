import { AnimatePresence, motion } from 'framer-motion'

import type { ScoreResponse } from '../lib/types'

type Props = {
  score: ScoreResponse | null
  loading: boolean
  error: string | null
  approvalColor: string
}

function getScoreMeta(value: number | null) {
  if (value === null) {
    return {
      tone: 'text-gray-900',
      label: 'Pending',
      helper: 'Adjust your profile to generate a live estimate.',
    }
  }
  if (value >= 750) {
    return {
      tone: 'text-emerald-500',
      label: 'Excellent',
      helper: 'Strong repayment profile with high approval potential.',
    }
  }
  if (value >= 650) {
    return {
      tone: 'text-blue-500',
      label: 'Good',
      helper: 'Healthy credit standing with room to optimize.',
    }
  }
  if (value >= 550) {
    return {
      tone: 'text-amber-500',
      label: 'Average',
      helper: 'The profile is workable, but risk factors are visible.',
    }
  }
  return {
    tone: 'text-red-500',
    label: 'Poor',
    helper: 'Higher-risk behavior is pulling the score down.',
  }
}

export default function ScoreDisplay({ score, loading, error, approvalColor }: Props) {
  const meta = getScoreMeta(score?.credit_score ?? null)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Score Overview
          </div>
          <div className="mt-2 text-sm text-gray-500">Real-time credit intelligence</div>
        </div>
        <div className="text-right">
          <div
            className={[
              'inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold',
              approvalColor,
            ].join(' ')}
          >
            {score ? score.approval_status : '—'}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={score?.credit_score ?? 'empty'}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={['text-7xl font-semibold tracking-tight tabular-nums', meta.tone].join(' ')}
            >
              {score ? score.credit_score : '—'}
            </motion.div>
          </AnimatePresence>

          <div className="mt-3 flex items-center gap-3">
            <div className="text-xl font-semibold text-gray-950">{meta.label}</div>
            <div className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
              Range 300-900
            </div>
          </div>

          <div className="mt-3 max-w-xl text-sm text-gray-500">
            {loading ? 'Updating your score from the latest controls…' : meta.helper}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:min-w-[240px]">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
              Score band
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-950">{meta.label}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
              Status
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-950">
              {loading ? 'Refreshing' : score?.approval_status ?? 'Waiting'}
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="mt-5 text-sm text-red-500">{error}</div> : null}
    </div>
  )
}

