import { useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { audienceQuestions, suggestTrack } from '../data/audience'

export function AudienceCheck({ onComplete, completed }: InteractiveLessonProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const done = audienceQuestions.every((q) => answers[q.id])
  const track = done ? suggestTrack(answers) : null

  return (
    <div className="space-y-6">
      <p className="ink-2">Four quick questions. There are no wrong answers: this tells the facilitator, and you, which parts of today to spend the most time on.</p>
      {audienceQuestions.map((q) => (
        <fieldset key={q.id} className="card space-y-2 p-4">
          <legend className="px-1 font-semibold">{q.prompt}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o) => (
              <label
                key={o.id}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${answers[q.id] === o.id ? 'border-brand-500 bg-brand-500/15 font-semibold' : 'line'}`}
              >
                <input type="radio" className="sr-only" name={q.id} checked={answers[q.id] === o.id} onChange={() => setAnswers({ ...answers, [q.id]: o.id })} />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {track && (
        <div className="rounded-xl border border-brand-400/50 bg-brand-500/5 p-4" role="status">
          <p className="text-xs font-semibold uppercase tracking-wide ink-3">Your track today</p>
          <p className="mt-1 font-semibold">{track.title}</p>
          <p className="mt-1 text-sm ink-2">{track.body}</p>
        </div>
      )}
      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!done && !completed}>
          {completed ? 'Next' : done ? 'Continue' : 'Answer all four to continue'}
        </button>
      </div>
    </div>
  )
}
