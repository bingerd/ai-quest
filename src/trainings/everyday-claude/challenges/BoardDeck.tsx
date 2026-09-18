import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import type { DeckWorkflowAnswer, DeckWorkflowResult, WorkflowChoice } from '../../../simulation/deckWorkflow'
import { formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { ContextItem } from '../../../ui/ContextItem'
import { boardDeckWorkflow as spec } from '../data/workflow'
import { BriefBlocks } from '../../../ui/BriefBlocks'

const initial: DeckWorkflowAnswer = { workspace: '', selectedIds: [], briefChoices: {}, review: '' }

export function BoardDeck({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<DeckWorkflowAnswer>) {
  const [answer, setAnswer] = useState<DeckWorkflowAnswer>(initial)
  const typed = result as DeckWorkflowResult | null
  const locked = !!result
  const used = spec.items.filter((i) => answer.selectedIds.includes(i.id)).reduce((s, i) => s + i.tokens, 0)
  const toggle = (id: string) => !locked && setAnswer((a) => ({ ...a, selectedIds: a.selectedIds.includes(id) ? a.selectedIds.filter((x) => x !== id) : [...a.selectedIds, id] }))

  return (
    <ChallengeFrame
      title="Final Challenge: the board-meeting deck"
      brief={<p>{spec.task}</p>}
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={!!answer.workspace && !!answer.review && answer.selectedIds.length > 0}
      onSubmit={() => submit(answer)}
      onRetry={() => {
        setAnswer(initial)
        retry()
      }}
      onContinue={onContinue}
      submitLabel="Make the deck"
      resultExtra={
        typed ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="card p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide ink-3">The run</p>
              {typed.narrative.map((line) => (
                <p key={line} className="text-sm ink-2">
                  {line}
                </p>
              ))}
            </div>
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide ink-3">Outline you would get</p>
              <ol className="mt-2 space-y-1 text-sm ink-1">
                {typed.outline.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        <Step n={1} title="Where will you work?">
          <ChoiceGroup name="workspace" choices={spec.workspaces} value={answer.workspace} onChange={(v) => setAnswer((a) => ({ ...a, workspace: v }))} disabled={locked} />
        </Step>
        <Step n={2} title="Which sources do you give Claude?">
          <p className="text-xs ink-3">{formatTokens(used)} simulated tokens selected</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {spec.items.map((i) => (
              <li key={i.id}>
                <ContextItem id={i.id} label={i.label} tokens={i.tokens} selected={answer.selectedIds.includes(i.id)} onToggle={toggle} {...(i.description ? { description: i.description } : {})} {...(typed ? { revealRelevance: i.relevance, disabled: true } : {})} />
              </li>
            ))}
          </ul>
        </Step>
        <Step n={3} title="Write the brief">
          <BriefBlocks spec={spec.brief} choices={answer.briefChoices} onChange={(c) => setAnswer((a) => ({ ...a, briefChoices: c }))} disabled={locked} />
        </Step>
        <Step n={4} title="How do you check it before it goes out?">
          <ChoiceGroup name="review" choices={spec.reviews} value={answer.review} onChange={(v) => setAnswer((a) => ({ ...a, review: v }))} disabled={locked} />
        </Step>
      </div>
    </ChallengeFrame>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3" aria-labelledby={`deck-step-${n}`}>
      <h3 id={`deck-step-${n}`} className="flex items-center gap-2 font-semibold">
        <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-xs text-white">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function ChoiceGroup({ name, choices, value, onChange, disabled }: { name: string; choices: WorkflowChoice[]; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <fieldset disabled={disabled} className="grid gap-2 sm:grid-cols-2">
      <legend className="sr-only">{name}</legend>
      {choices.map((c) => (
        <label key={c.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${value === c.id ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
          <input type="radio" name={name} checked={value === c.id} onChange={() => onChange(c.id)} className="mt-1 size-4 accent-brand-600" />
          <span>
            <span className="block font-semibold">{c.label}</span>
            <span className="block text-xs ink-3">{c.detail}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
