import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import type { AgentRunResult } from '../../../simulation/agent'
import { formatCurrency, formatSeconds, formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { MetricsTable } from '../../../ui/MetricsTable'
import { supportAgentSpec as spec } from '../data/agent'

export interface AgentAnswer {
  toolIds: string[]
}

const RISK_CHIP = { read: 'surface-2 ink-3', write: 'bg-warn/15 text-warn', dangerous: 'bg-bad/15 text-bad' } as const

export function AgentToolbox({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<AgentAnswer>) {
  const [toolIds, setToolIds] = useState<string[]>([])
  const typed = result as AgentRunResult | null
  const locked = !!result
  const toggle = (id: string) => !locked && setToolIds((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))

  return (
    <ChallengeFrame
      title="Agent Toolbox"
      brief={
        <>
          <p>
            <strong className="ink-1">Task:</strong> {spec.task}
          </p>
          <p>Give the agent its tools, then watch the run. Every tool definition and every result lands in the context window, and every capability you grant is one the agent can use at the wrong moment.</p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={toolIds.length > 0}
      onSubmit={() => submit({ toolIds })}
      onRetry={() => {
        setToolIds([])
        retry()
      }}
      onContinue={onContinue}
      submitLabel="Run the agent"
      resultExtra={
        typed ? (
          <div className="space-y-3">
            <ol className="card divide-y line p-0" aria-label="Agent run">
              {typed.steps.map((s, i) => {
                const step = spec.steps.find((x) => x.id === s.stepId)!
                const tool = spec.tools.find((t) => t.id === s.toolId)
                return (
                  <li key={s.stepId} className="flex flex-wrap items-start justify-between gap-2 p-3 text-sm">
                    <span className="min-w-0">
                      <span className="block font-semibold">
                        {i + 1}. {step.label}
                      </span>
                      <span className="block text-xs ink-3">{s.note}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs ink-3 tabular-nums">
                      {tool ? <span className="block font-mono">{tool.label}</span> : <span className="block text-bad">no tool</span>}
                      context {formatTokens(s.contextAfter)} · {formatSeconds(s.latency)}
                    </span>
                  </li>
                )
              })}
            </ol>
            <MetricsTable
              metrics={[
                { label: 'Completed', value: typed.completed ? 'yes' : 'no' },
                { label: 'Context used', value: formatTokens(typed.metrics['contextTokens'] ?? 0), hint: `limit ${formatTokens(spec.contextLimit)}` },
                { label: 'Tool cost', value: formatCurrency(typed.metrics['cost'] ?? 0) },
                { label: 'Latency', value: formatSeconds(typed.metrics['latency'] ?? 0) },
              ]}
            />
          </div>
        ) : null
      }
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {spec.tools.map((t) => (
          <li key={t.id}>
            <label className={`flex h-full cursor-pointer items-start gap-3 rounded-xl border p-3 ${toolIds.includes(t.id) ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'} ${locked ? 'cursor-not-allowed' : ''}`}>
              <input type="checkbox" checked={toolIds.includes(t.id)} disabled={locked} onChange={() => toggle(t.id)} className="mt-1 size-4 accent-brand-600" />
              <span className="min-w-0">
                <span className="block font-mono text-sm break-words">{t.label}</span>
                <span className="block text-xs ink-3">{t.description}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  <span className={`chip ${RISK_CHIP[t.risk]}`}>{t.risk}</span>
                  <span className="chip surface-2 ink-3">+{formatTokens(t.resultTokens)} tokens</span>
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </ChallengeFrame>
  )
}
