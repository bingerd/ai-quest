import { useCallback, useState } from 'react'
import type { ChallengeDefinition, ChallengeResult } from '../engine/types'

export interface ChallengeLessonProps {
  challenge: ChallengeDefinition
  attempts: number
  bestScore: number | null
  submit: (answer: unknown) => ChallengeResult
  onContinue: () => void
}

/** Binds a ChallengeDefinition's component to the engine store. */
export function ChallengeLesson({ challenge, attempts, bestScore, submit, onContinue }: ChallengeLessonProps) {
  const [result, setResult] = useState<ChallengeResult | null>(null)
  const Component = challenge.component

  const handleSubmit = useCallback(
    (answer: unknown) => {
      const r = submit(answer)
      setResult(r)
      return r
    },
    [submit],
  )

  return (
    <Component
      submit={handleSubmit}
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      retry={() => setResult(null)}
      onContinue={onContinue}
    />
  )
}
