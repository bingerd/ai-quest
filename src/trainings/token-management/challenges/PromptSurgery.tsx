import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { estimateTokens, formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { CodeEditor } from '../../../ui/CodeEditor'
import { MetricsTable } from '../../../ui/MetricsTable'
import { promptOriginal, promptUserQuestion } from '../data/promptExercise'

export interface PromptAnswer {
  text: string
}

export function PromptSurgery({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<PromptAnswer>) {
  const [text, setText] = useState(promptOriginal)
  const before = estimateTokens(promptOriginal)
  const after = estimateTokens(text)

  return (
    <ChallengeFrame
      title="Prompt Surgery"
      brief={
        <>
          <p>
            A colleague's prompt template is below. The user's question is: <strong className="ink-1">"{promptUserQuestion}"</strong>
          </p>
          <p>
            Edit the template so it is lean, specific and safe. Keep the section headings (<code>SYSTEM</code>, <code>CONTEXT</code>, <code>TASK</code>,{' '}
            <code>OUTPUT</code>). Placeholders in square brackets stand for real documents. The checker is rule-based: no model reads your prompt.
          </p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={text.trim().length > 0}
      onSubmit={() => submit({ text })}
      onRetry={retry}
      onContinue={onContinue}
      submitLabel="Check prompt"
      resultExtra={
        result?.metrics ? (
          <MetricsTable
            metrics={[
              { label: 'Before', value: formatTokens(result.metrics['tokensBefore'] ?? 0), hint: 'simulated tokens' },
              { label: 'After', value: formatTokens(result.metrics['tokensAfter'] ?? 0), hint: 'simulated tokens' },
              { label: 'Saved', value: `${result.metrics['savedPercent'] ?? 0}%`, hint: 'per request' },
              { label: 'Checks passed', value: `${result.breakdown.filter((d) => d.score === 100).length} / ${result.breakdown.length}` },
            ]}
          />
        ) : null
      }
    >
      <div className="space-y-3">
        <CodeEditor value={text} onChange={setText} ariaLabel="Prompt template editor" height={340} readOnly={!!result} />
        <p className="text-sm ink-3">
          Live estimate: <span className="font-semibold ink-1 tabular-nums">{formatTokens(after)}</span> simulated tokens (was {formatTokens(before)}). Template placeholders count as their label only.
        </p>
      </div>
    </ChallengeFrame>
  )
}
