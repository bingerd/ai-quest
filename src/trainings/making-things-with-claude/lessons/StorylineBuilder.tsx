import { useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { simulateOrdering } from '../../../simulation/ordering'
import { Feedback } from '../../../ui/Feedback'
import { ScoreBreakdown } from '../../../ui/ScoreBreakdown'
import { SimulationPanel } from '../../../ui/SimulationPanel'
import { OrderList } from '../../../ui/OrderList'
import { governingThoughts, scqaSteps } from '../data/storyline'

/** Shuffled on purpose, and fixed: no randomness anywhere in this app. */
const START_ORDER = ['answer', 'situation', 'question', 'complication']

export function StorylineBuilder({ onComplete, completed }: InteractiveLessonProps) {
  const [order, setOrder] = useState<string[]>(START_ORDER)
  const [thought, setThought] = useState<string | null>(null)
  const [moved, setMoved] = useState(false)

  const ordering = simulateOrdering({ steps: scqaSteps, given: order })
  const chosen = governingThoughts.find((g) => g.id === thought)
  const thoughtScore = chosen?.score ?? 0
  const total = Math.round(ordering.score * 0.6 + thoughtScore * 0.4)
  const ready = ordering.score === 100 && thoughtScore >= 80

  return (
    <div className="space-y-6">
      <p className="ink-2">
        You are opening a board deck about the mid-market accounts. Put the four opening lines in
        order, then pick the one sentence the rest of the deck has to defend. Both have to be right
        before you go on — this is the part you do before Claude makes anything.
      </p>

      <SimulationPanel
        title="The opening"
        aside={
          <div className="space-y-3 md:sticky md:top-20">
            <div className="card p-3" aria-live="polite">
              <p className="text-xs ink-3">Simulated storyline score</p>
              <p className="text-2xl font-bold tabular-nums">{total}</p>
              <p className="text-xs ink-3">{ordering.summary}</p>
            </div>
            <ScoreBreakdown
              total={total}
              dimensions={[
                { id: 'order', label: 'S-C-Q-A order', score: ordering.score, weight: 3 },
                { id: 'thought', label: 'Governing thought', score: thoughtScore, weight: 2 },
              ]}
            />
          </div>
        }
      >
        <div className="space-y-5">
          <OrderList
            title="The four opening lines"
            items={scqaSteps.map((s) => ({ id: s.id, label: s.label }))}
            order={order}
            onChange={(next) => {
              setMoved(true)
              setOrder(next)
            }}
          />

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-semibold">The governing thought</legend>
            <p className="text-xs ink-3">The single sentence every later slide exists to support.</p>
            <div className="grid gap-1.5">
              {governingThoughts.map((g) => (
                <label
                  key={g.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                    thought === g.id ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'
                  }`}
                >
                  <input type="radio" name="governing-thought" checked={thought === g.id} onChange={() => setThought(g.id)} className="mt-0.5 size-4 accent-brand-600" />
                  <span>{g.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {chosen && (
            <p className={`rounded-xl border p-3 text-sm ${chosen.score >= 80 ? 'border-good/40 bg-good/10' : 'line surface-2'}`} role="status">
              {chosen.explanation}
            </p>
          )}
        </div>
      </SimulationPanel>

      {ordering.feedback.length > 0 && moved && <Feedback items={ordering.feedback} heading="On the order" />}

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!ready && !completed}>
          {completed ? 'Next' : ready ? 'Continue' : 'Get both parts right to continue'}
        </button>
      </div>
    </div>
  )
}
