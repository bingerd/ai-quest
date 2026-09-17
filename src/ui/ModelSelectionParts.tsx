import type { ChallengeResult } from '../engine/types'
import type { ModelSelectionResult, ModelSelectionScenario } from '../simulation/modelSelection'
import { getModel, type ModelProfile } from '../simulation/models'
import { formatCurrency, formatSeconds, formatTokens } from '../simulation/tokens'
import { Feedback } from './Feedback'
import { ScoreBreakdown } from './ScoreBreakdown'

/** Presentational pieces of the model selection challenge. */

export function ScenarioBrief({ scenario }: { scenario: ModelSelectionScenario }) {
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

export function ComparisonTable({ result, scenario, catalogue }: { result: ModelSelectionResult; scenario: ModelSelectionScenario; catalogue: ModelProfile[] }) {
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
            const m = getModel(o.modelId, catalogue)
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

export function ModelSelectionFinalPanel({ title, result, attempts, bestScore, onRetry, onContinue }: { title: string; result: ChallengeResult; attempts: number; bestScore: number | null; onRetry: () => void; onContinue: () => void }) {
  return (
    <div className="space-y-4" role="region" aria-label="Model selection result">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{title}: overall</h2>
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
