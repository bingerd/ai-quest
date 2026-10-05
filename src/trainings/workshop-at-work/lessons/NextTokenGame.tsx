import { useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { candidates, runPicks } from '../../../simulation/nextToken'
import { ConceptCard } from '../../../ui/ConceptCard'
import { SimulationPanel } from '../../../ui/SimulationPanel'
import { nextTokenPrompt, nextTokenStart, nextTokenTable } from '../data/nextToken'

export function NextTokenGame({ onComplete, completed }: InteractiveLessonProps) {
  const [picks, setPicks] = useState<string[]>([])
  const [sentences, setSentences] = useState<string[]>([])
  const run = runPicks(nextTokenTable, nextTokenStart, nextTokenPrompt, picks)
  const context = run.steps.length === 0 ? nextTokenStart : run.steps.at(-1)?.picked.next
  const options = context === undefined ? [] : candidates(nextTokenTable, context)
  const tookUnlikely = sentences.length > 0 && run.finished && run.steps.some((s) => !s.greedy)
  const ready = sentences.length >= 2 || completed

  function pick(token: string) {
    const next = [...picks, token]
    const r = runPicks(nextTokenTable, nextTokenStart, nextTokenPrompt, next)
    setPicks(next)
    if (r.finished && !sentences.includes(r.text)) setSentences([...sentences, r.text])
  }

  return (
    <div className="space-y-6">
      <p className="ink-2">
        You are the model. Each turn, pick the next piece of text from the list. The percentages are how likely each piece is to come next. Finish two different sentences.
      </p>

      <SimulationPanel
        title="Be the model"
        aside={
          <div className="card space-y-2 p-3" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide ink-3">Sentences you finished</p>
            {sentences.length === 0 ? <p className="text-sm ink-3">None yet.</p> : sentences.map((s) => <p key={s} className="text-sm ink-1">{s}</p>)}
          </div>
        }
      >
        <div className="space-y-4">
          <p className="rounded-xl surface-2 p-3 text-lg ink-1" aria-live="polite">
            {run.text}
            {!run.finished && <span className="ink-3"> ▍</span>}
          </p>
          {run.finished ? (
            <div className="space-y-3">
              <p className="text-sm ink-2">
                Sentence complete. This path was {run.likelihoodVsGreedy}% as likely as always taking the top choice.
                {tookUnlikely && ' Less likely does not mean wrong, and most likely does not mean true.'}
              </p>
              <button type="button" className="btn" onClick={() => setPicks([])}>
                Start a new sentence
              </button>
            </div>
          ) : (
            <ul className="space-y-2" aria-label="Possible next pieces of text">
              {options.map((c) => (
                <li key={c.token}>
                  <button type="button" className="btn w-full justify-between text-left" onClick={() => pick(c.token)}>
                    <span className="min-w-0 break-words">{c.token.trim() || c.token}</span>
                    <span className="tabular-nums ink-3">{Math.round(c.p * 100)}%</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SimulationPanel>

      <ConceptCard title="A language model predicts the next piece of text" icon="🔮">
        <p>
          It writes one small piece (a token) at a time, picking from what usually comes next given everything before it. It does not look facts up while doing this. A fluent sentence is a likely sentence, not a checked one. That is why the context you give it matters so much: change what comes before, and you change what is likely to come next.
        </p>
      </ConceptCard>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!ready}>
          {completed ? 'Next' : ready ? 'Continue' : 'Finish two different sentences to continue'}
        </button>
      </div>
    </div>
  )
}
