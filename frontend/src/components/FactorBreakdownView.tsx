import { motion } from 'framer-motion'

import type { FactorBreakdown } from '../lib/types'

function formatValue(v: number) {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${Math.round(v)}`
}

export default function FactorBreakdownView({ breakdown }: { breakdown: FactorBreakdown | null }) {
  const items = [
    { key: 'payment_history', label: 'Payment history', hint: 'Missed payments have the biggest impact.' },
    { key: 'utilization', label: 'Credit utilization', hint: 'Higher utilization typically lowers the score.' },
    { key: 'credit_age', label: 'Credit history length', hint: 'Longer history improves stability.' },
    { key: 'credit_mix', label: 'Credit mix', hint: 'A stronger mix can help slightly.' },
    { key: 'inquiries', label: 'Credit inquiries + loans', hint: 'Too many new lines can reduce score.' },
  ] as const

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
        Factor Breakdown
      </div>
      <div className="mt-2 text-lg font-semibold text-gray-950">
        Why the score moved
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Each driver contributes positive or negative pressure to the model.
      </div>

      <div className="mt-6 space-y-4">
        {items.map((it) => {
          const v = breakdown ? breakdown[it.key] : null
          const pos = v !== null && v >= 0
          const width = v === null ? 12 : Math.max(12, Math.min(100, Math.abs(v) / 1.6))

          return (
            <motion.div
              key={it.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-950">{it.label}</div>
                  <div className="mt-1 text-xs text-gray-500">{it.hint}</div>
                </div>
                <div
                  className={[
                    'text-sm font-semibold tabular-nums',
                    pos ? 'text-emerald-600' : 'text-red-500',
                  ].join(' ')}
                >
                  {v === null ? '—' : formatValue(v)}
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className={[
                    'h-2 rounded-full',
                    pos ? 'bg-emerald-500' : 'bg-red-500',
                  ].join(' ')}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

