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
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-semibold text-gray-900">Factor breakdown</div>
      <div className="text-xs text-gray-500 mt-1">
        Explainability values: how each factor shifts your estimate.
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it) => {
          const v = breakdown ? breakdown[it.key] : null
          const pos = v !== null && v >= 0

          return (
            <motion.div
              key={it.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={[
                'rounded-lg border p-3',
                pos
                  ? 'border-blue-200 bg-blue-50 text-blue-800'
                  : 'border-gray-200 bg-gray-50 text-gray-800',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{it.label}</div>
                  <div className="text-[11px] mt-1 opacity-80">{it.hint}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{v === null ? '—' : formatValue(v)}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

