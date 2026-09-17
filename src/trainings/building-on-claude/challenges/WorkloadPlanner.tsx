import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { estimateCost, labelFor, type Delivery } from '../../../simulation/workload'
import { formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { workloads } from '../data/workloads'

export interface WorkloadPlannerAnswer {
  choices: Record<string, Delivery>
}

const OPTIONS: Delivery[] = ['realtime', 'realtime-cached', 'batch']

export function WorkloadPlanner({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<WorkloadPlannerAnswer>) {
  const [choices, setChoices] = useState<Record<string, Delivery>>({})
  const locked = !!result
  const complete = workloads.every((w) => choices[w.id])

  return (
    <ChallengeFrame
      title="Workload Planner"
      brief={<p>Three workloads on the same API. Decide how each one is delivered. The cost column is relative: one unit is one uncached input token.</p>}
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={complete}
      onSubmit={() => submit({ choices })}
      onRetry={() => {
        setChoices({})
        retry()
      }}
      onContinue={onContinue}
      submitLabel={complete ? 'Check the plan' : 'Choose for every workload'}
    >
      <ol className="space-y-4">
        {workloads.map((w) => (
          <li key={w.id} className="card p-4 space-y-3">
            <div>
              <h3 className="font-semibold">{w.title}</h3>
              <p className="text-sm ink-2">{w.description}</p>
              <p className="text-xs ink-3">
                {formatTokens(w.requests)} requests · {formatTokens(w.sharedPrefixTokens)} shared + {formatTokens(w.uniqueTokensPerRequest)} unique tokens each · {w.interactive ? 'someone is waiting' : 'asynchronous'}
              </p>
            </div>
            <fieldset disabled={locked} className="grid gap-2 sm:grid-cols-3">
              <legend className="sr-only">{w.title}</legend>
              {OPTIONS.map((o) => {
                const selected = choices[w.id] === o
                return (
                  <label key={o} className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm ${selected ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
                    <span className="flex items-center gap-2 font-semibold">
                      <input type="radio" name={`wl-${w.id}`} checked={selected} onChange={() => setChoices((c) => ({ ...c, [w.id]: o }))} className="size-4 accent-brand-600" />
                      {labelFor(o)}
                    </span>
                    <span className="text-xs ink-3 tabular-nums">relative cost {formatTokens(estimateCost(w, o))}</span>
                  </label>
                )
              })}
            </fieldset>
          </li>
        ))}
      </ol>
    </ChallengeFrame>
  )
}
