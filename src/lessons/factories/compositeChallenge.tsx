import { useState, type ReactNode } from 'react'
import { defineChallenge, type ChallengeDefinition, type ChallengeProps } from '../../engine/types'
import { parseCompositeAnswer, simulateComposite, type CompositeAnswer, type CompositeResult, type CompositeSpec } from '../../simulation/composite'
import { ChallengeFrame } from '../../ui/Challenge'
import { CompositeForm } from '../../ui/CompositeForm'

export interface CompositeChallengeConfig {
  title: string
  brief: ReactNode
  spec: CompositeSpec
  submitLabel?: string
  minAttemptsToContinue?: number
}

const empty: CompositeAnswer = { choices: {}, checks: {} }

/** Build an "assemble the setup" final challenge from a CompositeSpec. */
export function makeCompositeChallenge(config: CompositeChallengeConfig): ChallengeDefinition {
  function CompositeChallenge({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<CompositeAnswer>) {
    const [answer, setAnswer] = useState<CompositeAnswer>(empty)
    const typed = result as CompositeResult | null
    const allChosen = config.spec.parts.every((p) => p.kind !== 'choice' || answer.choices[p.id])
    return (
      <ChallengeFrame
        title={config.title}
        brief={config.brief}
        result={result}
        attempts={attempts}
        bestScore={bestScore}
        canSubmit={allChosen}
        onSubmit={() => submit(answer)}
        onRetry={() => {
          setAnswer(empty)
          retry()
        }}
        onContinue={onContinue}
        submitLabel={allChosen ? (config.submitLabel ?? 'Run the simulation') : 'Answer every question first'}
        {...(config.minAttemptsToContinue ? { minAttemptsToContinue: config.minAttemptsToContinue, continueLockHint: 'Pass, or try a few more times, before skipping ahead.' } : {})}
        resultExtra={
          typed ? (
            <div className="card p-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide ink-3">Your setup</p>
              {typed.narrative.map((line) => (
                <p key={line} className="text-sm ink-2">
                  {line}
                </p>
              ))}
            </div>
          ) : null
        }
      >
        <CompositeForm spec={config.spec} answer={answer} onChange={setAnswer} locked={!!result} />
      </ChallengeFrame>
    )
  }
  return defineChallenge<CompositeAnswer>({
    kind: 'composite',
    component: CompositeChallenge,
    passScore: config.spec.passScore ?? 70,
    evaluate: (answer) => simulateComposite(config.spec, parseCompositeAnswer(answer)),
  })
}
