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
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
            {label}
          </div>
          {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
        </div>
        <motion.div
          key={display}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold text-gray-950 tabular-nums"
        >
          {display}
        </motion.div>
      </div>

      <input
        aria-label={label}
        className="fintech-slider mt-4 w-full accent-black"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-2 flex justify-between text-[11px] text-gray-400">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </motion.div>
  )
}

export default function InputPanel({ inputs, onChange }: Props) {
  const fmtMoney = (v: number) => `$${Math.round(v).toLocaleString()}`

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
          Control Panel
        </div>
        <div className="mt-2 text-lg font-semibold text-gray-950">
          Tune the profile inputs
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Every change updates the score engine in real time.
        </div>
      </div>

      <SliderField
        label="Monthly income"
        value={inputs.monthly_income}
        min={0}
        max={30000}
        step={100}
        format={fmtMoney}
        onChange={(monthly_income) => onChange({ ...inputs, monthly_income })}
        hint="Stable income supports healthier credit behavior."
      />

      <SliderField
        label="Monthly expenses"
        value={inputs.monthly_expenses}
        min={0}
        max={30000}
        step={100}
        format={fmtMoney}
        onChange={(monthly_expenses) => onChange({ ...inputs, monthly_expenses })}
        hint="Higher expenses can increase repayment pressure."
      />

      <SliderField
        label="Credit utilization"
        value={inputs.credit_utilization_pct}
        min={0}
        max={100}
        step={1}
        format={(v) => `${v}%`}
        onChange={(credit_utilization_pct) => onChange({ ...inputs, credit_utilization_pct })}
        hint="Keeping this below 30% usually helps the fastest."
      />

      <SliderField
        label="Missed payments"
        value={inputs.missed_payments_last_12_months}
        min={0}
        max={12}
        step={1}
        onChange={(missed_payments_last_12_months) =>
          onChange({ ...inputs, missed_payments_last_12_months })
        }
        hint="Payment history is the biggest score driver."
        format={(v) => `${v}`}
      />

      <SliderField
        label="Credit history length"
        value={inputs.credit_history_length_years}
        min={0}
        max={30}
        step={0.5}
        format={(v) => `${v} yrs`}
        onChange={(credit_history_length_years) =>
          onChange({ ...inputs, credit_history_length_years })
        }
        hint="Longer history improves stability."
      />

      <SliderField
        label="Active loans"
        value={inputs.active_loans}
        min={0}
        max={10}
        step={1}
        onChange={(active_loans) => onChange({ ...inputs, active_loans })}
        hint="Too many active accounts can increase perceived risk."
      />

      <SliderField
        label="Credit inquiries"
        value={inputs.recent_credit_inquiries}
        min={0}
        max={12}
        step={1}
        onChange={(recent_credit_inquiries) =>
          onChange({ ...inputs, recent_credit_inquiries })
        }
        hint="New applications can drag the score down short-term."
      />

      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.18 }}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
          Credit mix
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Choose the quality of the overall account mix.
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(['good', 'average', 'poor'] as CreditMix[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...inputs, credit_mix: m })}
              className={[
                'rounded-2xl border px-3 py-4 text-left transition duration-200',
                inputs.credit_mix === m
                  ? 'border-gray-900 bg-gray-950 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
              ].join(' ')}
            >
              <div className="text-sm font-semibold capitalize">{m}</div>
              <div
                className={[
                  'mt-1 text-xs',
                  inputs.credit_mix === m ? 'text-white/70' : 'text-gray-500',
                ].join(' ')}
              >
                {m === 'good' ? 'Balanced profile' : m === 'average' ? 'Neutral mix' : 'Weak mix'}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

