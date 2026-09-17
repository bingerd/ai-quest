import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { simulateContextSelection, type ContextItemSpec } from './contextSelection'
import { expectedQuality, getModel, requestCost, requestLatency } from './models'
import { clamp, linearScore, round, weightedTotal } from './scoring'
import { formatCurrency, formatSeconds, formatTokens } from './tokens'

/**
 * The final challenge composes the earlier simulations: model choice,
 * context selection, retrieval, tool selection and an output budget.
 */

export interface ToolSpec {
  id: string
  label: string
  description: string
  /** Tokens the tool result adds to context. */
  resultTokens: number
  latencySeconds: number
  /** Simulated € per call. */
  costPerCall: number
  /** 0..1 usefulness for the task. */
  relevance: number
  required?: boolean
}

export interface FinalScenario {
  id: string
  task: string
  framing: string
  tokenLimit: number
  modelIds: string[]
  items: ContextItemSpec[]
  tools: ToolSpec[]
  /** Task difficulty 0..1 for the quality model. */
  complexity: number
  /** Output tokens a good answer needs. */
  idealOutputTokens: number
  /** Share of each document's tokens that retrieval keeps. */
  retrievalKeepShare: number
  retrievalLatencySeconds: number
}

export interface FinalAnswer {
  modelId: string
  selectedIds: string[]
  useRetrieval: boolean
  toolIds: string[]
  outputTokens: number
}

export interface FinalResult extends ChallengeResult {
  metrics: Record<string, number>
  narrative: string[]
}

export function effectiveContextItems(scenario: FinalScenario, useRetrieval: boolean): ContextItemSpec[] {
  if (!useRetrieval) return scenario.items
  return scenario.items.map((i) => ({ ...i, tokens: Math.max(1, Math.round(i.tokens * scenario.retrievalKeepShare)) }))
}

export function simulateFinalChallenge(scenario: FinalScenario, answer: FinalAnswer): FinalResult {
  const model = getModel(scenario.modelIds.includes(answer.modelId) ? answer.modelId : (scenario.modelIds[0] ?? answer.modelId))
  const items = effectiveContextItems(scenario, answer.useRetrieval)
  const tools = answer.toolIds.map((id) => scenario.tools.find((t) => t.id === id)).filter((t): t is ToolSpec => !!t)
  const outputTokens = clamp(Math.round(answer.outputTokens), 50, 8000)

  // Context: reuse the context-selection simulation with the retrieval-adjusted items.
  const ctx = simulateContextSelection({ items, selectedIds: answer.selectedIds, tokenLimit: scenario.tokenLimit, modelId: model.id, outputTokens, overheadTokens: 400 })

  // Tools.
  const toolTokens = tools.reduce((s, t) => s + t.resultTokens, 0)
  const toolLatency = tools.reduce((s, t) => s + t.latencySeconds, 0)
  const toolCost = tools.reduce((s, t) => s + t.costPerCall, 0)
  const missingTools = scenario.tools.filter((t) => t.required && !tools.some((x) => x.id === t.id))
  const uselessTools = tools.filter((t) => t.relevance < 0.4)
  const toolCoverage = missingTools.length === 0 ? 100 : 40

  // Totals.
  const inputTokens = ctx.metrics.tokensUsed + toolTokens + 400
  const overBudget = Math.max(0, ctx.metrics.tokensUsed + toolTokens - scenario.tokenLimit)
  const cost = requestCost(model, inputTokens, outputTokens) + toolCost
  const latency = requestLatency(model, inputTokens, outputTokens) + toolLatency + (answer.useRetrieval ? scenario.retrievalLatencySeconds : 0)

  // Ideal for cost/latency comparison: cheapest allowed model, ideal context with retrieval, required tools, ideal output.
  const idealModel = scenario.modelIds.map((id) => getModel(id)).sort((a, b) => a.inputCostPerMillion - b.inputCostPerMillion)[0] ?? model
  const idealItems = effectiveContextItems(scenario, true)
  const idealCtx = simulateContextSelection({ items: idealItems, selectedIds: idealSelected(idealItems, scenario.tokenLimit), tokenLimit: scenario.tokenLimit, modelId: idealModel.id, outputTokens: scenario.idealOutputTokens, overheadTokens: 400 })
  const requiredTools = scenario.tools.filter((t) => t.required)
  const idealInput = idealCtx.metrics.tokensUsed + requiredTools.reduce((s, t) => s + t.resultTokens, 0) + 400
  const idealCost = requestCost(idealModel, idealInput, scenario.idealOutputTokens) + requiredTools.reduce((s, t) => s + t.costPerCall, 0)
  const idealLatency = requestLatency(idealModel, idealInput, scenario.idealOutputTokens) + requiredTools.reduce((s, t) => s + t.latencySeconds, 0) + scenario.retrievalLatencySeconds

  // Output budget.
  const outputRatio = outputTokens / scenario.idealOutputTokens
  const outputScore = outputRatio < 0.6 ? linearScore(outputRatio, 0.6, 0.1) : outputRatio <= 1.6 ? 100 : linearScore(outputRatio, 1.6, 5)

  // Quality: model capability vs complexity, then coverage and truncation.
  const modelQuality = expectedQuality(model, scenario.complexity)
  const coverage = clamp((ctx.metrics.completeness * toolCoverage) / 100)
  let quality = modelQuality * 100 * (coverage / 100)
  if (outputRatio < 0.6) quality *= 0.7
  if (overBudget > 0) quality *= 0.5

  const breakdown: ScoreDimension[] = [
    { id: 'efficiency', label: 'Context efficiency', score: round(clamp(overBudget > 0 ? Math.min(ctx.metrics.relevance, 40) : ctx.metrics.relevance - uselessTools.length * 10)), weight: 2 },
    { id: 'coverage', label: 'Information coverage', score: round(coverage), weight: 3 },
    { id: 'quality', label: 'Answer quality', score: round(clamp(quality)), weight: 2 },
    { id: 'cost', label: 'Estimated cost', score: cost <= idealCost * 1.05 ? 100 : linearScore(cost, idealCost, idealCost * 4), weight: 2 },
    { id: 'latency', label: 'Estimated latency', score: latency <= idealLatency * 1.05 ? 100 : linearScore(latency, idealLatency, idealLatency * 3), weight: 1 },
    { id: 'output', label: 'Output budget', score: outputScore, weight: 1 },
  ]
  let score = weightedTotal(breakdown)
  if (overBudget > 0) score = Math.min(score, 50)
  // Without the facts of the case (a required document or tool), the workflow cannot succeed.
  if (coverage < 60) score = Math.min(score, 50)

  const feedback: Feedback[] = []
  const narrative: string[] = []

  narrative.push(`You ran ${model.name} with ${formatTokens(ctx.metrics.tokensUsed)} tokens of context${answer.useRetrieval ? ' (after retrieval)' : ''}, ${tools.length} tool call${tools.length === 1 ? '' : 's'} adding ${formatTokens(toolTokens)} tokens, and room for a ${formatTokens(outputTokens)}-token answer.`)
  narrative.push(`Simulated cost ${formatCurrency(cost)} and latency ${formatSeconds(latency)} per request, against an ideal of ${formatCurrency(idealCost)} and ${formatSeconds(idealLatency)}.`)

  if (overBudget > 0) {
    feedback.push({ tone: 'warning', title: `Context and tool results exceed the ${formatTokens(scenario.tokenLimit)}-token budget by ${formatTokens(overBudget)}`, body: 'Tool results land in the same window as your documents. Budget for both.', concept: 'context-window' })
  }
  for (const t of missingTools) {
    feedback.push({ tone: 'warning', title: `${t.label} was needed`, body: `${t.description} Without it, the analysis is missing the facts of the case.`, concept: 'tools' })
  }
  if (uselessTools.length > 0) {
    feedback.push({ tone: 'warning', title: `${uselessTools.map((t) => t.label).join(' and ')} added nothing`, body: `Unnecessary tool calls added ${formatTokens(uselessTools.reduce((s, t) => s + t.resultTokens, 0))} tokens, ${formatSeconds(uselessTools.reduce((s, t) => s + t.latencySeconds, 0))} and ${formatCurrency(uselessTools.reduce((s, t) => s + t.costPerCall, 0))} for no gain. Give an agent the tools the task needs, not every tool you have.`, concept: 'tools' })
  }
  if (!answer.useRetrieval && ctx.metrics.tokensUsed > scenario.tokenLimit * 0.5) {
    feedback.push({ tone: 'neutral', title: 'Retrieval would have cut the document tokens sharply', body: `With retrieval on, the same documents contribute about ${Math.round(scenario.retrievalKeepShare * 100)}% of their tokens: only the relevant passages.`, concept: 'retrieval' })
  }
  if (outputRatio < 0.6) {
    feedback.push({ tone: 'warning', title: 'The answer would be cut short', body: `A proper analysis needs about ${formatTokens(scenario.idealOutputTokens)} output tokens; you reserved ${formatTokens(outputTokens)}.`, concept: 'output-tokens' })
  } else if (outputRatio > 1.6) {
    feedback.push({ tone: 'neutral', title: 'The output budget is generous', body: `Reserving ${formatTokens(outputTokens)} tokens when about ${formatTokens(scenario.idealOutputTokens)} would do invites long, expensive answers.`, concept: 'output-tokens' })
  }
  if (model.id !== idealModel.id && modelQuality >= 0.9) {
    feedback.push({ tone: 'neutral', title: `${idealModel.name} would have handled this task`, body: `${model.name} is more capable than the task requires. It cost ${formatCurrency(cost)} against ${formatCurrency(idealCost)} for the same result.`, concept: 'model-selection' })
  }
  if (modelQuality < 0.85) {
    feedback.push({ tone: 'warning', title: `${model.name} is stretched by this task`, body: 'Simulated answer quality suffers when the model is below the task complexity.', concept: 'model-selection' })
  }
  // Borrow the two most useful context notes.
  feedback.push(...ctx.feedback.filter((f) => f.tone !== 'positive').slice(0, 2))
  if (feedback.length === 0) {
    feedback.push({ tone: 'positive', title: 'A workflow you could ship', body: 'Right model, lean context, the one tool the task needs, and a sensible output budget. This is what efficient AI usage looks like at scale.', concept: 'efficiency' })
  }

  return {
    score: clamp(score),
    passed: score >= 60,
    breakdown,
    feedback,
    summary: score >= 90 ? 'Efficient, complete and cheap. Mission accomplished.' : score >= 70 ? 'A solid workflow with room to trim.' : score >= 50 ? 'It would work, but expensively or incompletely.' : 'This workflow would disappoint the team.',
    metrics: {
      contextTokens: ctx.metrics.tokensUsed,
      toolTokens,
      outputTokens,
      cost: round(cost, 4),
      latency: round(latency, 2),
      idealCost: round(idealCost, 4),
      idealLatency: round(idealLatency, 2),
      overBudget,
    },
    narrative,
  }
}

function idealSelected(items: ContextItemSpec[], limit: number): string[] {
  const sorted = [...items].filter((i) => i.required || i.relevance >= 0.4).sort((a, b) => Number(b.required ?? false) - Number(a.required ?? false) || b.relevance - a.relevance)
  const out: string[] = []
  let used = 0
  for (const i of sorted) {
    if (used + i.tokens <= limit || i.required) {
      out.push(i.id)
      used += i.tokens
    }
  }
  return out
}
