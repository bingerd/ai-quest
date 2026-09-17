import type { ReactNode } from 'react'
import type { ChallengeResult } from '../engine/types'
import { Feedback } from './Feedback'
import { ScoreBreakdown } from './ScoreBreakdown'

export interface ChallengeFrameProps {
  title: string
  /** Scenario/task description shown above the interaction. */
  brief: ReactNode
  children: ReactNode
  result: ChallengeResult | null
  attempts: number
  bestScore: number | null
  canSubmit: boolean
  onSubmit: () => void
  onRetry: () => void
  onContinue: () => void
  submitLabel?: string
  /** Extra content rendered inside the result panel (e.g. metrics table). */
  resultExtra?: ReactNode
}

/**
 * Shared frame for challenges: brief → interaction → submit → result → retry/continue.
 * Keeps every challenge consistent and keyboard-friendly.
 */
export function ChallengeFrame({
  title,
  brief,
  children,
  result,
  attempts,
  bestScore,
  canSubmit,
  onSubmit,
  onRetry,
  onContinue,
  submitLabel = 'Run simulation',
  resultExtra,
}: ChallengeFrameProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex gap-2 text-xs ink-3">
            <span className="chip surface-2">Attempt {attempts + (result ? 0 : 1)}</span>
            {bestScore !== null && <span className="chip surface-2">Best {bestScore}</span>}
          </div>
        </div>
        <div className="card p-4 text-sm ink-2 space-y-2">{brief}</div>
      </header>

      <div aria-live="polite">{children}</div>

      {result ? (
        <div className="space-y-4" role="region" aria-label="Simulation result">
          {result.summary && <p className="text-lg font-semibold animate-rise">{result.summary}</p>}
          <ScoreBreakdown total={result.score} dimensions={result.breakdown} />
          {resultExtra}
          <Feedback items={result.feedback} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary" onClick={onRetry}>
              Try again
            </button>
            <button type="button" className="btn btn-primary" onClick={onContinue}>
              {result.passed ? 'Continue' : 'Continue anyway'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={onSubmit}>
            {submitLabel}
          </button>
        </div>
      )}
    </div>
  )
}
