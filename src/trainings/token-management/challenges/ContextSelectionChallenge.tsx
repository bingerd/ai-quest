import { lazy, Suspense, useMemo, useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { hasWebGLOrCanvas, useMediaFlags } from '../../../app/useMediaFlags'
import { TokenHeistList } from '../../../games/token-heist/TokenHeistList'
import type { ContextSelectionResult } from '../../../simulation/contextSelection'
import { getModel, requestCost, requestLatency } from '../../../simulation/models'
import { formatCurrency, formatSeconds, formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { MetricsTable } from '../../../ui/MetricsTable'
import type { ContextScenario } from '../data/contextScenarios'

const TokenHeistGame = lazy(() => import('../../../games/token-heist/TokenHeistGame'))

export interface ContextSelectionAnswer {
  selectedIds: string[]
}

export interface ContextSelectionChallengeProps extends ChallengeProps<ContextSelectionAnswer> {
  scenario: ContextScenario
  /** Show the Phaser board (Token Heist) or the list only (Context Surgeon). */
  board: boolean
}

export function ContextSelectionChallenge({ scenario, board, submit, result, attempts, bestScore, retry, onContinue }: ContextSelectionChallengeProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(scenario.initialSelectedIds)
  const flags = useMediaFlags()
  const boardSupported = useMemo(() => board && hasWebGLOrCanvas(), [board])
  const autoList = flags.reducedMotion || flags.narrow || !boardSupported
  const [viewPref, setViewPref] = useState<'board' | 'list' | null>(null)
  const view = viewPref ?? (autoList ? 'list' : 'board')

  const model = getModel(scenario.modelId)
  const used = scenario.items.filter((i) => selectedIds.includes(i.id)).reduce((s, i) => s + i.tokens, 0)
  const liveCost = requestCost(model, used + 400, 800)
  const liveLatency = requestLatency(model, used + 400, 800)
  const typed = result as ContextSelectionResult | null
  const reveal = typed?.reveal ?? null

  const toggle = (id: string) => {
    if (result) return
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  return (
    <ChallengeFrame
      title={scenario.title}
      brief={
        <>
          <p>
            <strong className="ink-1">Task:</strong> {scenario.task}
          </p>
          <p>{scenario.framing}</p>
          <p className="text-xs ink-3">
            Budget: {formatTokens(scenario.tokenLimit)} simulated tokens · Model: {model.name}
          </p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={true}
      onSubmit={() => submit({ selectedIds })}
      onRetry={() => {
        setSelectedIds(scenario.initialSelectedIds)
        retry()
      }}
      onContinue={onContinue}
      resultExtra={
        typed ? (
          <MetricsTable
            metrics={[
              { label: 'Context used', value: `${formatTokens(typed.metrics.tokensUsed)}`, hint: `of ${formatTokens(typed.metrics.tokenLimit)}` },
              { label: 'Wasted tokens', value: formatTokens(typed.metrics.wastedTokens), hint: 'low relevance' },
              { label: 'Cost / request', value: formatCurrency(typed.metrics.cost), hint: `ideal ${formatCurrency(typed.metrics.idealCost)}` },
              { label: 'Latency', value: formatSeconds(typed.metrics.latency) },
            ]}
          />
        ) : null
      }
    >
      <div className="space-y-3">
        {board && boardSupported && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm ink-3">{view === 'board' ? 'Drag documents into the vault, or click them.' : 'Tick the documents to include.'}</p>
            <div className="inline-flex rounded-lg surface-2 p-0.5" role="group" aria-label="View">
              {(['board', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setViewPref(v)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${view === v ? 'surface-1 ink-1 shadow' : 'ink-3'}`}
                >
                  {v === 'board' ? 'Board' : 'List'}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'board' && board && boardSupported ? (
          <div key={flags.dark ? 'dark' : 'light'} className="space-y-3">
            <Suspense fallback={<div className="grid aspect-[880/520] place-items-center rounded-xl surface-2 ink-3">Loading the vault…</div>}>
              <TokenHeistGame
                blocks={scenario.items.map((i) => ({ id: i.id, label: i.label, tokens: i.tokens }))}
                tokenLimit={scenario.tokenLimit}
                selectedIds={selectedIds}
                onToggle={toggle}
                reveal={reveal}
                dark={flags.dark}
              />
            </Suspense>
          </div>
        ) : (
          <TokenHeistList items={scenario.items} tokenLimit={scenario.tokenLimit} selectedIds={selectedIds} onToggle={toggle} reveal={reveal} />
        )}

        <MetricsTable
          caption="Live simulated metrics"
          metrics={[
            { label: 'Selected', value: `${selectedIds.length} / ${scenario.items.length}` },
            { label: 'Context', value: formatTokens(used), hint: used > scenario.tokenLimit ? 'over budget' : `${formatTokens(scenario.tokenLimit - used)} left` },
            { label: 'Est. cost', value: formatCurrency(liveCost), hint: 'per request' },
            { label: 'Est. latency', value: formatSeconds(liveLatency) },
          ]}
        />
      </div>
    </ChallengeFrame>
  )
}
