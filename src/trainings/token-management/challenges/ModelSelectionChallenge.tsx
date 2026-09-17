import { useState } from 'react'
import type { ChallengeProps, ChallengeResult } from '../../../engine/types'
import { simulateModelSelection, type ModelSelectionResult, type ModelSelectionScenario } from '../../../simulation/modelSelection'
import { getModel, MODELS } from '../../../simulation/models'
import { formatCurrency, formatSeconds, formatTokens } from '../../../simulation/tokens'
import { Feedback } from '../../../ui/Feedback'
import { ModelCard } from '../../../ui/ModelCard'
import { ScoreBreakdown } from '../../../ui/ScoreBreakdown'
import { modelScenarios } from '../data/modelScenarios'

export interface ModelSelectionAnswer {
  choices: Record<string, string>
}

/**
 * Multi-round challenge: one constrained workload at a time. Each round is
 * simulated immediately so the learner sees consequences before moving on;
 * the final submit records the aggregate score with the engine.
 */
export function ModelSelectionChallenge({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<ModelSelectionAnswer>) {
  const [round, setRound] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const [roundResult, setRoundResult] = useState<ModelSelectionResult | null>(null)

  const scenario = modelScenarios[round]!
  const isLast = round === modelScenarios.length - 1

  const runRound = () => {
    if (!picked) return
    const r = simulateModelSelection(scenario, picked)
    setRoundResult(r)
    setChoices((c) => ({ ...c, [scenario.id]: picked }))
  }

  const nextRound = () => {
    if (isLast) {
      submit({ choices })
      return
    }
    setRound((r) => r + 1)
    setPicked(null)
    setRoundResult(null)
  }

  const reset = () => {
    setRound(0)
    setChoices({})
    setPicked(null)
    setRoundResult(null)
    retry()
  }

  if (result) {
    return <FinalPanel result={result} attempts={attempts} bestScore={bestScore} onRetry={reset} onContinue={onContinue} />
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Model Selection</h2>
          <span className="chip surface-2 ink-3">
            Round {round + 1} of {modelScenarios.length}
          </span>
        </div>
        <ScenarioBrief scenario={scenario} />
      </header>

      <fieldset disabled={!!roundResult} className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-semibold">Which model do you run this on?</legend>
        {MODELS.map((m) => {
          const o = roundResult?.all.find((x) => x.modelId === m.id)
          const verdict = o
            ? o.viable
              ? { label: roundResult?.bestModelId === m.id ? 'Best fit' : 'Meets constraints', tone: 'good' as const }
              : { label: !o.fitsContext ? 'Context too small' : !o.meetsQuality ? 'Quality too low' : !o.meetsBudget ? 'Over budget' : 'Too slow', tone: 'bad' as const }
            : undefined
          return <ModelCard key={m.id} model={m} selected={picked === m.id} onSelect={setPicked} disabled={!!roundResult} {...(verdict ? { verdict } : {})} />
        })}
      </fieldset>

      {roundResult ? (
        <div className="space-y-4" role="region" aria-label="Round result">
          <p className="text-lg font-semibold animate-rise">{roundResult.summary}</p>
          <ComparisonTable result={roundResult} scenario={scenario} />
          <Feedback items={roundResult.feedback} heading="Why" />
          <div className="flex justify-end">
            <button type="button" className="btn btn-primary" onClick={nextRound}>
              {isLast ? 'See overall score' : 'Next scenario'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" disabled={!picked} onClick={runRound}>
            Run simulation
          </button>
        </div>
      )}
    </div>
  )
}

function ScenarioBrief({ scenario }: { scenario: ModelSelectionScenario }) {
  return (
    <div className="card p-4 space-y-3 text-sm">
      <p className="font-semibold ink-1">{scenario.title}</p>
      <p className="ink-2">{scenario.description}</p>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg surface-2 px-3 py-2">
          <dt className="text-xs ink-3">Workload</dt>
          <dd className="font-semibold tabular-nums">{formatTokens(scenario.requests)} requests</dd>
          <dd className="text-xs ink-3">
            ~{formatTokens(scenario.avgInputTokens)} in / {formatTokens(scenario.avgOutputTokens)} out
          </dd>
        </div>
        <div className="rounded-lg surface-2 px-3 py-2">
          <dt className="text-xs ink-3">Budget</dt>
          <dd className="font-semibold tabular-nums">{formatCurrency(scenario.budget)}</dd>
        </div>
        <div className="rounded-lg surface-2 px-3 py-2">
          <dt className="text-xs ink-3">Latency</dt>
          <dd className="font-semibold tabular-nums">&lt; {formatSeconds(scenario.maxLatencySeconds)}</dd>
          <dd className="text-xs ink-3">per request</dd>
        </div>
        <div className="rounded-lg surface-2 px-3 py-2">
          <dt className="text-xs ink-3">Quality target</dt>
          <dd className="font-semibold tabular-nums">{Math.round(scenario.qualityTarget * 100)}%</dd>
        </div>
      </dl>
    </div>
  )
}

function ComparisonTable({ result, scenario }: { result: ModelSelectionResult; scenario: ModelSelectionScenario }) {
  return (
    <div className="overflow-x-auto card">
      <table className="w-full text-sm">
        <caption className="sr-only">Simulated outcome for every model</caption>
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide ink-3">
            <th className="px-3 py-2">Model</th>
            <th className="px-3 py-2">Total cost</th>
            <th className="px-3 py-2">Latency</th>
            <th className="px-3 py-2">Quality</th>
            <th className="px-3 py-2">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {result.all.map((o) => {
            const m = getModel(o.modelId)
            const chosen = o.modelId === result.outcome.modelId
            return (
              <tr key={o.modelId} className={`border-t line ${chosen ? 'bg-brand-500/10 font-semibold' : ''}`}>
                <td className="px-3 py-2">
                  {m.name}
                  {chosen && <span className="ml-2 chip bg-brand-600 text-white">Your pick</span>}
                </td>
                <td className={`px-3 py-2 tabular-nums ${o.meetsBudget ? '' : 'text-bad'}`}>{formatCurrency(o.cost)}</td>
                <td className={`px-3 py-2 tabular-nums ${o.meetsLatency ? '' : 'text-bad'}`}>{formatSeconds(o.latency)}</td>
                <td className={`px-3 py-2 tabular-nums ${o.meetsQuality ? '' : 'text-bad'}`}>{o.fitsContext ? `${Math.round(o.quality * 100)}%` : '—'}</td>
                <td className="px-3 py-2">
                  {o.viable ? (
                    <span className="text-good">{result.bestModelId === o.modelId ? 'Best fit' : 'Viable'}</span>
                  ) : (
                    <span className="text-bad">{!o.fitsContext ? 'Context too small' : !o.meetsQuality ? `Below ${Math.round(scenario.qualityTarget * 100)}%` : !o.meetsBudget ? 'Over budget' : 'Too slow'}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function FinalPanel({ result, attempts, bestScore, onRetry, onContinue }: { result: ChallengeResult; attempts: number; bestScore: number | null; onRetry: () => void; onContinue: () => void }) {
  return (
    <div className="space-y-4" role="region" aria-label="Model selection result">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Model Selection: overall</h2>
        <div className="flex gap-2 text-xs ink-3">
          <span className="chip surface-2">Attempt {attempts}</span>
          {bestScore !== null && <span className="chip surface-2">Best {bestScore}</span>}
        </div>
      </div>
      {result.summary && <p className="text-lg font-semibold">{result.summary}</p>}
      <ScoreBreakdown total={result.score} dimensions={result.breakdown} />
      <Feedback items={result.feedback} heading="Takeaways" />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          {result.passed ? 'Continue' : 'Continue anyway'}
        </button>
      </div>
    </div>
  )
}
