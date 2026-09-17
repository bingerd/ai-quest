import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { HOOK_EVENTS, NO_MATCHER_EVENTS, type Effect, type HookGoalAnswer, type HookLabResult } from '../../../simulation/hooks'
import { ChallengeFrame } from '../../../ui/Challenge'
import { hookGoals } from '../data/hooks'

export interface HookLabAnswer {
  answers: Record<string, HookGoalAnswer>
}

const EFFECT_LABEL: Record<Effect, string> = {
  skipped: 'did not run',
  ran: 'ran',
  context: 'added context',
  blocked: 'blocked',
  continued: 'kept Claude going',
  'exit2-ignored': 'exit 2 ignored',
  error: 'error, not blocked',
}

export function HookLab({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<HookLabAnswer>) {
  const [answers, setAnswers] = useState<Record<string, HookGoalAnswer>>({})
  const typed = result as HookLabResult | null
  const complete = hookGoals.every((g) => answers[g.id]?.event && answers[g.id]?.behaviour && (answers[g.id]?.matcher !== undefined || NO_MATCHER_EVENTS.has(answers[g.id]!.event as never)))
  const update = (goalId: string, patch: Partial<HookGoalAnswer>) => setAnswers((a) => ({ ...a, [goalId]: { event: '', matcher: '', behaviour: '', ...a[goalId], ...patch } }))

  return (
    <ChallengeFrame
      title="Hook Lab"
      brief={<p>Configure one hook for each goal: the event, the matcher and what the script does. Then run a simulated session and see what each hook actually did.</p>}
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={complete}
      onSubmit={() => submit({ answers })}
      onRetry={() => {
        setAnswers({})
        retry()
      }}
      onContinue={onContinue}
      submitLabel={complete ? 'Run the session' : 'Configure every hook first'}
    >
      <ol className="space-y-4">
        {hookGoals.map((goal, i) => {
          const a = answers[goal.id]
          const goalResult = typed?.goals.find((g) => g.goalId === goal.id)
          const noMatcher = a?.event ? NO_MATCHER_EVENTS.has(a.event as never) : false
          return (
            <li key={goal.id} className="card p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide ink-3">Hook {i + 1}</p>
                  <h3 className="font-semibold">{goal.title}</h3>
                  <p className="text-sm ink-2">{goal.description}</p>
                </div>
                {goalResult && <span className={`chip ${goalResult.score === 100 ? 'bg-good text-white' : 'bg-bad text-white'}`}>{goalResult.score === 100 ? 'Works' : `${goalResult.score}%`}</span>}
              </div>
              <fieldset disabled={!!result} className="grid gap-3 sm:grid-cols-2">
                <legend className="sr-only">{goal.title} configuration</legend>
                <label className="block text-sm">
                  <span className="font-semibold">Event</span>
                  <select className="mt-1 w-full rounded-lg border line-strong surface-1 px-2 py-1.5 ink-1" value={a?.event ?? ''} onChange={(e) => update(goal.id, { event: e.target.value })}>
                    <option value="">Choose…</option>
                    {HOOK_EVENTS.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Matcher</span>
                  <select className="mt-1 w-full rounded-lg border line-strong surface-1 px-2 py-1.5 font-mono ink-1 disabled:opacity-50" value={noMatcher ? '' : (a?.matcher ?? '')} disabled={noMatcher} onChange={(e) => update(goal.id, { matcher: e.target.value })}>
                    <option value="">{noMatcher ? '(no matcher for this event)' : 'Choose…'}</option>
                    {goal.matcherOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="text-sm sm:col-span-2" role="radiogroup" aria-label={`${goal.title}: what the script does`}>
                  <span className="font-semibold">Script does</span>
                  <div className="mt-1 grid gap-1.5">
                    {goal.behaviours.map((b) => (
                      <label key={b.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 ${a?.behaviour === b.id ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
                        <input type="radio" name={`hook-${goal.id}-behaviour`} checked={a?.behaviour === b.id} onChange={() => update(goal.id, { behaviour: b.id })} className="mt-0.5 size-4 accent-brand-600" />
                        <span>{b.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
              {goalResult && (
                <ul className="space-y-1 rounded-lg surface-2 p-2 text-xs" aria-label={`${goal.title} simulated session`}>
                  {goal.stream.map((o) => {
                    const eff = goalResult.effects.find((e) => e.occurrenceId === o.id)!
                    return (
                      <li key={o.id} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="ink-2">
                          <span className="font-mono ink-3">{o.event}</span> {o.label}
                        </span>
                        <span className={eff.ok ? 'text-good' : 'text-bad font-semibold'}>
                          {eff.ok ? '✓' : '✗'} {EFFECT_LABEL[eff.effect]}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </ChallengeFrame>
  )
}
