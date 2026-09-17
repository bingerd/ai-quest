import { useState } from 'react'
import { defineChallenge, type ChallengeDefinition, type ChallengeProps, type ChallengeResult, type Feedback as FeedbackItem } from '../../engine/types'
import { simulateModelSelection, type ModelSelectionResult, type ModelSelectionScenario } from '../../simulation/modelSelection'
import { getModel, MODELS, type ModelProfile } from '../../simulation/models'
import { Feedback } from '../../ui/Feedback'
import { ModelCard } from '../../ui/ModelCard'
import { ComparisonTable, ModelSelectionFinalPanel, ScenarioBrief } from '../../ui/ModelSelectionParts'

interface ModelSelectionAnswer {
  choices: Record<string, string>
}

export interface ModelSelectionChallengeConfig {
  title: string
  scenarios: ModelSelectionScenario[]
  catalogue?: ModelProfile[]
  question?: string
  takeaway?: string
  passScore?: number
}

const DEFAULT_TAKEAWAY =
  'Neither "always the cheapest" nor "always the best" wins. The right model is the cheapest one that clears the quality bar within the latency and budget limits.'

/** Aggregate: each scenario is scored by the model simulation; the total is the mean. */
export function evaluateModelChoices(config: ModelSelectionChallengeConfig, answer: unknown): ChallengeResult {
  const catalogue = config.catalogue ?? MODELS
  const raw = typeof answer === 'object' && answer !== null ? (answer as ModelSelectionAnswer).choices : null
  const choices: Record<string, unknown> = typeof raw === 'object' && raw !== null ? raw : {}
  const rounds = config.scenarios.map((s) => {
    const modelId = choices[s.id]
    const valid = typeof modelId === 'string' && catalogue.some((m) => m.id === modelId)
    return { scenario: s, result: valid ? simulateModelSelection(s, modelId, catalogue) : null }
  })
  const breakdown = rounds.map((r) => ({ id: r.scenario.id, label: r.scenario.title, score: r.result?.score ?? 0 }))
  const score = Math.round(breakdown.reduce((s, d) => s + d.score, 0) / Math.max(1, breakdown.length))
  const fits = rounds.filter((r) => r.result?.outcome.viable).length
  const feedback: FeedbackItem[] = [
    {
      tone: fits === rounds.length ? 'positive' : 'neutral',
      title: `${fits} of ${rounds.length} ${rounds.length === 1 ? 'task' : 'tasks'} landed on a model that met every constraint`,
      body: config.takeaway ?? DEFAULT_TAKEAWAY,
      concept: 'model-selection',
    },
    ...rounds
      .filter((r) => r.result && !r.result.outcome.viable)
      .map<FeedbackItem>((r) => ({
        tone: 'warning',
        title: `${r.scenario.title}: ${getModel(r.result!.outcome.modelId, catalogue).name} did not fit`,
        body: r.result!.feedback[0]?.body ?? '',
        concept: 'model-selection',
      })),
  ]
  return { score, passed: score >= (config.passScore ?? 60), breakdown, feedback, summary: `Average simulation score across ${rounds.length} rounds: ${score}` }
}

/** Build a multi-round "pick the model for this workload" challenge. */
export function makeModelSelectionChallenge(config: ModelSelectionChallengeConfig): ChallengeDefinition {
  const catalogue = config.catalogue ?? MODELS
  const modelScenarios = config.scenarios

  /**
   * One constrained workload at a time. Each round is simulated immediately so the
   * learner sees consequences before moving on; the final submit records the aggregate.
   */
  function ModelSelectionChallenge({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<ModelSelectionAnswer>) {
  const [round, setRound] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const [roundResult, setRoundResult] = useState<ModelSelectionResult | null>(null)

  const scenario = modelScenarios[round]!
  const isLast = round === modelScenarios.length - 1

  const runRound = () => {
    if (!picked) return
    const r = simulateModelSelection(scenario, picked, catalogue)
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
    return <ModelSelectionFinalPanel title={config.title} result={result} attempts={attempts} bestScore={bestScore} onRetry={reset} onContinue={onContinue} />
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{config.title}</h2>
          <span className="chip surface-2 ink-3">
            Round {round + 1} of {modelScenarios.length}
          </span>
        </div>
        <ScenarioBrief scenario={scenario} />
      </header>

      <fieldset disabled={!!roundResult} className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-semibold">{config.question ?? 'Which model do you run this on?'}</legend>
        {catalogue.map((m) => {
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
          <ComparisonTable result={roundResult} scenario={scenario} catalogue={catalogue} />
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

  return defineChallenge<ModelSelectionAnswer>({
    kind: 'model-selection',
    component: ModelSelectionChallenge,
    ...(config.passScore !== undefined ? { passScore: config.passScore } : {}),
    evaluate: (answer) => evaluateModelChoices(config, answer),
  })
}
