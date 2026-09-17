import { useState } from 'react'
import type { DecisionPoint as DecisionPointData } from '../simulation/scenario'

export interface DecisionPointProps {
  decision: DecisionPointData
  index: number
  total: number
  onDecide: (optionId: string) => void
  onNext: () => void
  isLast: boolean
}

/** One situation → options → consequence. Radios keep it keyboard-friendly. */
export function DecisionPoint({ decision, index, total, onDecide, onNext, isLast }: DecisionPointProps) {
  const [picked, setPicked] = useState<string | null>(null)
  const [decided, setDecided] = useState(false)
  const option = decision.options.find((o) => o.id === picked)
  const tone = option ? (option.outcome.score >= 80 ? 'border-good/50 bg-good/10' : option.outcome.score >= 50 ? 'border-brand-400/50 bg-brand-500/10' : 'border-warn/50 bg-warn/10') : ''

  return (
    <div className="space-y-4 animate-rise" key={decision.id}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Situation {index + 1} of {total}
        </p>
      </div>
      <div className="card p-5 space-y-3">
        <h3 className="text-lg font-semibold">{decision.title}</h3>
        <p className="ink-2">{decision.situation}</p>
        <p className="font-semibold ink-1">{decision.question}</p>
      </div>
      <fieldset disabled={decided} className="grid gap-2">
        <legend className="sr-only">Options</legend>
        {decision.options.map((o) => (
          <label key={o.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${picked === o.id ? 'border-brand-500 bg-brand-500/10' : 'line hover:line-strong hover:surface-2'}`}>
            <input type="radio" name={decision.id} value={o.id} checked={picked === o.id} onChange={() => setPicked(o.id)} className="mt-1 size-4 accent-brand-600" />
            <span>
              <span className="block font-semibold">{o.label}</span>
              {o.detail && <span className="block text-sm ink-3">{o.detail}</span>}
            </span>
          </label>
        ))}
      </fieldset>
      {decided && option ? (
        <div className={`rounded-xl border p-4 animate-rise ${tone}`} role="status">
          <p className="text-xs font-semibold uppercase tracking-wide ink-3">What happened</p>
          <p className="mt-1 ink-1">{option.outcome.consequence}</p>
          <div className="mt-3 flex justify-end">
            <button type="button" className="btn btn-primary" onClick={onNext}>
              {isLast ? 'See the outcome' : 'Next situation'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!picked}
            onClick={() => {
              if (!picked) return
              setDecided(true)
              onDecide(picked)
            }}
          >
            Decide
          </button>
        </div>
      )}
    </div>
  )
}
