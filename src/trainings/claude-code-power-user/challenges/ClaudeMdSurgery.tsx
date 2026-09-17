import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { sessionTokens } from '../../../simulation/claudeMd'
import { formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { CodeEditor } from '../../../ui/CodeEditor'
import { MetricsTable } from '../../../ui/MetricsTable'
import { claudeMdExercise, claudeMdOriginal } from '../data/claudeMd'

export interface ClaudeMdAnswer {
  text: string
}

export function ClaudeMdSurgery({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<ClaudeMdAnswer>) {
  const [text, setText] = useState(claudeMdOriginal)
  const before = sessionTokens(claudeMdOriginal, claudeMdExercise)
  const now = sessionTokens(text, claudeMdExercise)
  return (
    <ChallengeFrame
      title="CLAUDE.md Surgery"
      brief={
        <>
          <p>This is the committed CLAUDE.md for a billing service. It loads into every session for everyone on the team. Edit it until it is lean, specific and safe.</p>
          <p>The bracketed line stands for a 3,000-line paste. The docs exist at <code>docs/api.md</code>. The checker is rule-based: no model reads your file.</p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={text.trim().length > 0}
      onSubmit={() => submit({ text })}
      onRetry={retry}
      onContinue={onContinue}
      submitLabel="Review CLAUDE.md"
      minAttemptsToContinue={3}
      continueLockHint="Pass the review, or make three attempts, before you can skip."
      resultExtra={
        result?.metrics ? (
          <MetricsTable
            metrics={[
              { label: 'Before', value: formatTokens(result.metrics['tokensBefore'] ?? 0), hint: 'tokens per session' },
              { label: 'After', value: formatTokens(result.metrics['tokensAfter'] ?? 0), hint: 'tokens per session' },
              { label: 'Saved', value: `${result.metrics['savedPercent'] ?? 0}%` },
              { label: 'Checks passed', value: `${result.breakdown.filter((d) => d.score === 100).length} / ${result.breakdown.length}` },
            ]}
          />
        ) : null
      }
    >
      <div className="space-y-3">
        <CodeEditor value={text} onChange={setText} language="markdown" ariaLabel="CLAUDE.md editor" height={420} readOnly={!!result} />
        <p className="text-sm ink-3" aria-live="polite">
          Loaded every session: <span className="font-semibold ink-1 tabular-nums">{formatTokens(now)}</span> simulated tokens (was {formatTokens(before)}).
        </p>
      </div>
    </ChallengeFrame>
  )
}
