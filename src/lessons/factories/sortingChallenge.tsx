import { useState, type ReactNode } from 'react'
import { defineChallenge, type ChallengeDefinition, type ChallengeProps } from '../../engine/types'
import { parsePlacements, simulateSorting, type SortBucket, type SortingResult, type SortItem } from '../../simulation/sorting'
import { BucketSort } from '../../ui/BucketSort'
import { ChallengeFrame } from '../../ui/Challenge'

export interface SortingChallengeConfig {
  title: string
  brief: ReactNode
  buckets: SortBucket[]
  items: SortItem[]
  passScore?: number
  minAttemptsToContinue?: number
}

interface SortingAnswer {
  placements: Record<string, string>
}

/** Build a complete "sort items into buckets" challenge from data. */
export function makeSortingChallenge(config: SortingChallengeConfig): ChallengeDefinition {
  const passScore = config.passScore ?? 70
  function SortingChallenge({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<SortingAnswer>) {
    const [placements, setPlacements] = useState<Record<string, string>>({})
    const allPlaced = config.items.every((i) => placements[i.id])
    return (
      <ChallengeFrame
        title={config.title}
        brief={config.brief}
        result={result}
        attempts={attempts}
        bestScore={bestScore}
        canSubmit={allPlaced}
        onSubmit={() => submit({ placements })}
        onRetry={() => {
          setPlacements({})
          retry()
        }}
        onContinue={onContinue}
        submitLabel={allPlaced ? 'Check my sorting' : 'Place every item first'}
        {...(config.minAttemptsToContinue ? { minAttemptsToContinue: config.minAttemptsToContinue, continueLockHint: 'Pass, or make a few more attempts, before skipping ahead.' } : {})}
      >
        <BucketSort
          buckets={config.buckets}
          items={config.items}
          placements={placements}
          onPlace={(itemId, bucketId) => !result && setPlacements((p) => ({ ...p, [itemId]: bucketId }))}
          result={(result as SortingResult | null) ?? null}
        />
      </ChallengeFrame>
    )
  }
  return defineChallenge<SortingAnswer>({
    kind: 'sorting',
    component: SortingChallenge,
    passScore,
    evaluate: (answer) => simulateSorting({ buckets: config.buckets, items: config.items, placements: parsePlacements(answer), passScore }),
  })
}
