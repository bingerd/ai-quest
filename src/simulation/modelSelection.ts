import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { expectedQuality, getModel, MODELS, requestCost, requestLatency, type ModelProfile } from './models'
import { clamp, linearScore, round, weightedTotal } from './scoring'
import { formatCurrency, formatSeconds, formatTokens } from './tokens'

/** A constrained workload the learner must pick a model for. */
export interface ModelSelectionScenario {
  id: string
  title: string
  description: string
  /** Number of requests in the workload. */
  requests: number
  avgInputTokens: number
  avgOutputTokens: number
  /** 0..1 task difficulty. */
  complexity: number
  /** Total simulated budget in €. */
  budget: number
  /** Max acceptable latency per request, seconds. */
  maxLatencySeconds: number
  /** 0..1 required quality. */
  qualityTarget: number
}

export interface ModelOutcome {
  modelId: string
  cost: number
  latency: number
  quality: number
  fitsContext: boolean
  meetsBudget: boolean
  meetsLatency: boolean
  meetsQuality: boolean
  viable: boolean
}

export interface ModelSelectionResult extends ChallengeResult {
  outcome: ModelOutcome
  /** Outcomes for every model so the UI can show the comparison after the choice. */
  all: ModelOutcome[]
  bestModelId: string | null
}

export function evaluateModel(scenario: ModelSelectionScenario, model: ModelProfile): ModelOutcome {
  const cost = requestCost(model, scenario.avgInputTokens, scenario.avgOutputTokens) * scenario.requests
  const latency = requestLatency(model, scenario.avgInputTokens, scenario.avgOutputTokens)
  const fitsContext = scenario.avgInputTokens + scenario.avgOutputTokens <= model.contextLimit
  const quality = fitsContext ? expectedQuality(model, scenario.complexity) : 0
  const meetsBudget = cost <= scenario.budget
  const meetsLatency = latency <= scenario.maxLatencySeconds
  const meetsQuality = quality >= scenario.qualityTarget
  return {
    modelId: model.id,
    cost: round(cost, 2),
    latency: round(latency, 2),
    quality: round(quality, 3),
    fitsContext,
    meetsBudget,
    meetsLatency,
    meetsQuality,
    viable: fitsContext && meetsBudget && meetsLatency && meetsQuality,
  }
}

/** The cheapest model that satisfies every constraint, or null. */
export function bestModel(scenario: ModelSelectionScenario, models: ModelProfile[] = MODELS): ModelOutcome | null {
  const viable = models.map((m) => evaluateModel(scenario, m)).filter((o) => o.viable)
  viable.sort((a, b) => a.cost - b.cost)
  return viable[0] ?? null
}

export function simulateModelSelection(scenario: ModelSelectionScenario, modelId: string): ModelSelectionResult {
  const model = getModel(modelId)
  const outcome = evaluateModel(scenario, model)
  const all = MODELS.map((m) => evaluateModel(scenario, m))
  const best = bestModel(scenario)

  const qualityScore = outcome.fitsContext ? linearScore(outcome.quality, scenario.qualityTarget, scenario.qualityTarget - 0.3) : 0
  const budgetScore = outcome.meetsBudget ? 100 : linearScore(outcome.cost, scenario.budget, scenario.budget * 3)
  const latencyScore = outcome.meetsLatency ? 100 : linearScore(outcome.latency, scenario.maxLatencySeconds, scenario.maxLatencySeconds * 3)
  // Efficiency: how close to the cheapest viable option. Only meaningful when the pick is viable.
  const efficiencyScore = !outcome.viable ? 0 : best ? linearScore(outcome.cost, best.cost, best.cost * 4) : 100

  const breakdown: ScoreDimension[] = [
    { id: 'quality', label: 'Quality target', score: qualityScore, weight: 3 },
    { id: 'budget', label: 'Budget', score: budgetScore, weight: 2 },
    { id: 'latency', label: 'Latency', score: latencyScore, weight: 1 },
    { id: 'efficiency', label: 'Efficiency', score: efficiencyScore, weight: 2 },
  ]
  let score = weightedTotal(breakdown)
  if (!outcome.viable) score = Math.min(score, 50)

  const feedback = buildFeedback(scenario, model, outcome, best)
  return {
    score: clamp(score),
    passed: score >= 60,
    breakdown,
    feedback,
    summary: outcome.viable
      ? best && best.modelId === model.id
        ? `${model.name} is the best fit for this workload.`
        : `${model.name} works, but a cheaper model would also have met the bar.`
      : `${model.name} does not meet the constraints.`,
    metrics: { cost: outcome.cost, latency: outcome.latency, quality: round(outcome.quality * 100) },
    outcome,
    all,
    bestModelId: best?.modelId ?? null,
  }
}

function buildFeedback(scenario: ModelSelectionScenario, model: ModelProfile, o: ModelOutcome, best: ModelOutcome | null): Feedback[] {
  const out: Feedback[] = []
  if (!o.fitsContext) {
    out.push({
      tone: 'warning',
      title: `${model.name}'s context window is too small`,
      body: `Each request needs about ${formatTokens(scenario.avgInputTokens + scenario.avgOutputTokens)} tokens but ${model.name} holds ${formatTokens(model.contextLimit)}. The request would fail before quality even matters.`,
      concept: 'context-window',
    })
  }
  if (o.fitsContext && !o.meetsQuality) {
    out.push({
      tone: 'warning',
      title: `Simulated quality ${round(o.quality * 100)}% is below the ${round(scenario.qualityTarget * 100)}% target`,
      body: `${model.name} is not capable enough for a task this complex. Cheap output you cannot trust is the most expensive kind: someone has to check or redo it.`,
      concept: 'model-selection',
    })
  }
  if (!o.meetsBudget) {
    out.push({
      tone: 'warning',
      title: `Simulated cost ${formatCurrency(o.cost)} exceeds the ${formatCurrency(scenario.budget)} budget`,
      body: `${formatTokens(scenario.requests)} requests × ${formatTokens(scenario.avgInputTokens)} input tokens adds up fast on a premium model. Capability you do not need is pure cost.`,
      concept: 'cost',
    })
  }
  if (!o.meetsLatency) {
    out.push({
      tone: 'warning',
      title: `${formatSeconds(o.latency)} per request is over the ${formatSeconds(scenario.maxLatencySeconds)} limit`,
      body: 'Bigger models read and write more slowly. When latency is a hard constraint, it can rule out the most capable option.',
      concept: 'latency',
    })
  }
  if (o.viable && best && best.modelId !== model.id) {
    const bestModel = getModel(best.modelId)
    out.push({
      tone: 'neutral',
      title: `${bestModel.name} would also have met every constraint for ${formatCurrency(best.cost)}`,
      body: `You chose ${model.name} at ${formatCurrency(o.cost)}. Extra capability is worth paying for when quality is at risk, not when the target is already comfortably met.`,
      concept: 'model-selection',
    })
  }
  if (o.viable && best && best.modelId === model.id) {
    const margin = o.quality - scenario.qualityTarget
    out.push({
      tone: 'positive',
      title: 'Matched the tool to the task',
      body: `${model.name} meets the quality target (${round(o.quality * 100)}% vs ${round(scenario.qualityTarget * 100)}%) at ${formatCurrency(o.cost)} and ${formatSeconds(o.latency)} per request.${
        margin < 0.05 ? ' The quality margin is thin, so monitor output closely.' : ''
      }`,
      concept: 'model-selection',
    })
  }
  if (!o.viable && best) {
    out.push({
      tone: 'neutral',
      title: `${getModel(best.modelId).name} was the fit here`,
      body: `It meets the quality target, stays under budget and responds within the latency limit, for ${formatCurrency(best.cost)} in total.`,
      concept: 'model-selection',
    })
  }
  if (!o.viable && !best) {
    out.push({
      tone: 'neutral',
      title: 'No model meets all constraints',
      body: 'The right move is to change the workload: shorten the input, relax the budget, or split the task.',
      concept: 'model-selection',
    })
  }
  return out
}
