import { motion } from 'framer-motion'

import type { CreditInputs, CreditMix } from '../lib/types'

type Props = {
  inputs: CreditInputs
  onChange: (next: CreditInputs) => void
}

function SliderField(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (v: number) => string
  onChange: (v: number) => void
  hint?: string
}) {
  const { label, value, min, max, step, onChange, format, hint } = props
  const display = format ? format(value) : `${value}`

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {hint ? <div className="text-xs text-gray-500 mt-1">{hint}</div> : null}
        </div>
        <motion.div
          key={display}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-gray-900 tabular-nums"
        >
          {display}
        </motion.div>
      </div>

      <input
        aria-label={label}
        className="mt-3 w-full accent-blue-600"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  )
}

function MixOption({ value, label }: { value: CreditMix; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input className="accent-blue-600" type="radio" name="credit_mix" value={value} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

export default function InputPanel({ inputs, onChange }: Props) {
  const fmtMoney = (v: number) => `$${Math.round(v).toLocaleString()}`

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-gray-900">Your inputs</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SliderField
          label="Monthly income"
          value={inputs.monthly_income}
          min={0}
          max={30000}
          step={100}
          format={fmtMoney}
          onChange={(monthly_income) => onChange({ ...inputs, monthly_income })}
        />

        <SliderField
          label="Monthly expenses"
          value={inputs.monthly_expenses}
          min={0}
          max={30000}
          step={100}
          format={fmtMoney}
          onChange={(monthly_expenses) => onChange({ ...inputs, monthly_expenses })}
        />

        <SliderField
          label="Credit utilization (%)"
          value={inputs.credit_utilization_pct}
          min={0}
          max={100}
          step={1}
          onChange={(credit_utilization_pct) =>
            onChange({ ...inputs, credit_utilization_pct })
          }
          hint="Lower utilization usually helps."
        />

        <SliderField
          label="Missed payments (last 12 months)"
          value={inputs.missed_payments_last_12_months}
          min={0}
          max={12}
          step={1}
          onChange={(missed_payments_last_12_months) =>
            onChange({ ...inputs, missed_payments_last_12_months })
          }
          hint="Misses heavily impact score."
          format={(v) => `${v}x`}
        />

        <SliderField
          label="Credit history length (years)"
          value={inputs.credit_history_length_years}
          min={0}
          max={30}
          step={0.5}
          onChange={(credit_history_length_years) =>
            onChange({ ...inputs, credit_history_length_years })
          }
          hint="Longer history increases stability."
        />

        <SliderField
          label="Number of active loans"
          value={inputs.active_loans}
          min={0}
          max={10}
          step={1}
          onChange={(active_loans) => onChange({ ...inputs, active_loans })}
        />

        <SliderField
          label="Recent credit inquiries"
          value={inputs.recent_credit_inquiries}
          min={0}
          max={12}
          step={1}
          onChange={(recent_credit_inquiries) =>
            onChange({ ...inputs, recent_credit_inquiries })
          }
          hint="Fewer new applications is often better."
          format={(v) => `${v}`}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-gray-900">Credit mix</div>
            <div className="text-xs text-gray-500 mt-1">
              Good mix slightly improves stability.
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col gap-2">
              <MixOption value="good" label="Good" />
              <MixOption value="average" label="Average" />
              <MixOption value="poor" label="Poor" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['good', 'average', 'poor'] as CreditMix[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...inputs, credit_mix: m })}
              className={[
                'rounded-lg border px-4 py-3 text-left transition',
                inputs.credit_mix === m
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50',
              ].join(' ')}
            >
              <div className="text-sm font-medium capitalize text-gray-900">{m}</div>
              <div className="text-xs text-gray-500 mt-1">
                {m === 'good' ? 'Slightly positive' : m === 'average' ? 'Neutral' : 'Negative'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

