import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { effectiveContextItems, type FinalAnswer, type FinalResult } from '../../../simulation/finalChallenge'
import { getModel, requestCost, requestLatency } from '../../../simulation/models'
import { formatCurrency, formatSeconds, formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { ContextItem } from '../../../ui/ContextItem'
import { MetricsTable } from '../../../ui/MetricsTable'
import { ModelCard } from '../../../ui/ModelCard'
import { TokenMeter } from '../../../ui/TokenMeter'
import { finalScenario } from '../data/finalScenario'

const initial: FinalAnswer = { modelId: 'heron', selectedIds: [], useRetrieval: false, toolIds: [], outputTokens: 1_500 }

export function FinalChallenge({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<FinalAnswer>) {
  const [answer, setAnswer] = useState<FinalAnswer>(initial)
  const typed = result as FinalResult | null
  const items = effectiveContextItems(finalScenario, answer.useRetrieval)
  const contextTokens = items.filter((i) => answer.selectedIds.includes(i.id)).reduce((s, i) => s + i.tokens, 0)
  const toolTokens = finalScenario.tools.filter((t) => answer.toolIds.includes(t.id)).reduce((s, t) => s + t.resultTokens, 0)
  const model = getModel(answer.modelId)
  const liveCost = requestCost(model, contextTokens + toolTokens + 400, answer.outputTokens) + finalScenario.tools.filter((t) => answer.toolIds.includes(t.id)).reduce((s, t) => s + t.costPerCall, 0)
  const liveLatency = requestLatency(model, contextTokens + toolTokens + 400, answer.outputTokens) + finalScenario.tools.filter((t) => answer.toolIds.includes(t.id)).reduce((s, t) => s + t.latencySeconds, 0) + (answer.useRetrieval ? finalScenario.retrievalLatencySeconds : 0)
  const locked = !!result

  const toggleIn = (key: 'selectedIds' | 'toolIds') => (id: string) => {
    if (locked) return
    setAnswer((a) => ({ ...a, [key]: a[key].includes(id) ? a[key].filter((x) => x !== id) : [...a[key], id] }))
  }

  return (
    <ChallengeFrame
      title="Final Challenge: ship the workflow"
      brief={
        <>
          <p>
            <strong className="ink-1">Task:</strong> {finalScenario.task}
          </p>
          <p>{finalScenario.framing}</p>
          <p className="text-xs ink-3">Context budget: {formatTokens(finalScenario.tokenLimit)} simulated tokens for documents and tool results together.</p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={answer.selectedIds.length > 0}
      onSubmit={() => submit(answer)}
      onRetry={() => {
        setAnswer(initial)
        retry()
      }}
      onContinue={onContinue}
      submitLabel="Run the workflow"
      resultExtra={
        typed ? (
          <div className="space-y-3">
            <div className="card p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide ink-3">What happened</p>
              {typed.narrative.map((line, i) => (
                <p key={i} className="text-sm ink-2">
                  {line}
                </p>
              ))}
            </div>
            <MetricsTable
              metrics={[
                { label: 'Context', value: formatTokens(typed.metrics['contextTokens'] ?? 0), hint: `+ ${formatTokens(typed.metrics['toolTokens'] ?? 0)} from tools` },
                { label: 'Output reserved', value: formatTokens(typed.metrics['outputTokens'] ?? 0) },
                { label: 'Cost / request', value: formatCurrency(typed.metrics['cost'] ?? 0), hint: `ideal ${formatCurrency(typed.metrics['idealCost'] ?? 0)}` },
                { label: 'Latency', value: formatSeconds(typed.metrics['latency'] ?? 0), hint: `ideal ${formatSeconds(typed.metrics['idealLatency'] ?? 0)}` },
              ]}
            />
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        <Section step={1} title="Choose the model">
          <fieldset disabled={locked} className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Model</legend>
            {finalScenario.modelIds.map((id) => (
              <ModelCard key={id} model={getModel(id)} selected={answer.modelId === id} onSelect={(m) => !locked && setAnswer((a) => ({ ...a, modelId: m }))} disabled={locked} />
            ))}
          </fieldset>
        </Section>

        <Section step={2} title="Select the context">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border line p-3">
            <input type="checkbox" checked={answer.useRetrieval} disabled={locked} onChange={(e) => setAnswer((a) => ({ ...a, useRetrieval: e.target.checked }))} className="mt-1 size-4 accent-brand-600" />
            <span>
              <span className="font-semibold">Use retrieval</span>
              <span className="block text-xs ink-3">
                Send only the relevant passages of each selected document (about {Math.round(finalScenario.retrievalKeepShare * 100)}% of its tokens), adding {formatSeconds(finalScenario.retrievalLatencySeconds)} per request.
              </span>
            </span>
          </label>
          <TokenMeter used={contextTokens + toolTokens} limit={finalScenario.tokenLimit} label="Documents + tool results" />
          <ul className="grid gap-2 sm:grid-cols-2">
            {items.map((i) => (
              <li key={i.id}>
                <ContextItem
                  id={i.id}
                  label={i.label}
                  tokens={i.tokens}
                  selected={answer.selectedIds.includes(i.id)}
                  onToggle={toggleIn('selectedIds')}
                  {...(i.description ? { description: i.description } : {})}
                  {...(typed ? { revealRelevance: i.relevance, disabled: true } : {})}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section step={3} title="Give the agent its tools">
          <ul className="grid gap-2 sm:grid-cols-3">
            {finalScenario.tools.map((t) => (
              <li key={t.id}>
                <label className={`flex h-full cursor-pointer gap-3 rounded-xl border p-3 ${answer.toolIds.includes(t.id) ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'} ${locked ? 'cursor-not-allowed opacity-80' : ''}`}>
                  <input type="checkbox" checked={answer.toolIds.includes(t.id)} disabled={locked} onChange={() => toggleIn('toolIds')(t.id)} className="mt-1 size-4 accent-brand-600" />
                  <span>
                    <span className="block font-semibold">{t.label}</span>
                    <span className="block text-xs ink-3">{t.description}</span>
                    <span className="block text-xs ink-3 tabular-nums">
                      +{formatTokens(t.resultTokens)} tokens · +{formatSeconds(t.latencySeconds)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Section>

        <Section step={4} title="Set the output budget">
          <label className="block text-sm">
            <span className="flex justify-between font-semibold">
              Tokens reserved for the answer <span className="tabular-nums ink-2">{formatTokens(answer.outputTokens)}</span>
            </span>
            <input type="range" min={100} max={4000} step={50} value={answer.outputTokens} disabled={locked} onChange={(e) => setAnswer((a) => ({ ...a, outputTokens: Number(e.target.value) }))} className="w-full accent-brand-600" aria-valuetext={`${answer.outputTokens} tokens`} />
            <span className="block text-xs ink-3">A one-line reply or a full report? The team needs a clear recommendation with the numbers, not an essay.</span>
          </label>
        </Section>

        <MetricsTable
          caption="Live simulated metrics"
          metrics={[
            { label: 'Model', value: model.name },
            { label: 'Input tokens', value: formatTokens(contextTokens + toolTokens + 400), hint: 'incl. instructions' },
            { label: 'Est. cost', value: formatCurrency(liveCost), hint: 'per request' },
            { label: 'Est. latency', value: formatSeconds(liveLatency) },
          ]}
        />
      </div>
    </ChallengeFrame>
  )
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3" aria-labelledby={`final-step-${step}`}>
      <h3 id={`final-step-${step}`} className="flex items-center gap-2 font-semibold">
        <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-xs text-white">{step}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}
