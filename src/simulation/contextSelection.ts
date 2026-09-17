import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { getModel, requestCost, requestLatency } from './models'
import { clamp, linearScore, round, weightedTotal } from './scoring'
import { formatCurrency, formatSeconds, formatTokens } from './tokens'

/**
 * Deterministic simulation of "which information should go into context?".
 * Shared by Token Heist, Context Surgeon and the Final Challenge.
 */

export interface ContextItemSpec {
  id: string
  label: string
  tokens: number
  /** 0..1 — how useful the item is for the task. Hidden from the learner until after submission. */
  relevance: number
  /** The task cannot be completed without this item. */
  required?: boolean
  description?: string
}

export interface ContextSelectionInput {
  items: ContextItemSpec[]
  selectedIds: string[]
  /** Token budget available for context items (excludes overhead + output). */
  tokenLimit: number
  modelId: string
  /** Tokens reserved for the answer. Used for cost/latency only. */
  outputTokens?: number
  /** Fixed overhead for instructions + task. Used for cost/latency only. */
  overheadTokens?: number
}

export interface ContextSelectionMetrics extends Record<string, number> {
  tokensUsed: number
  tokenLimit: number
  overBudget: number
  usefulTokens: number
  wastedTokens: number
  relevance: number
  completeness: number
  cost: number
  latency: number
  idealCost: number
  quality: number
}

export interface ContextSelectionResult extends ChallengeResult {
  metrics: ContextSelectionMetrics
  /** Relevance per item id, for revealing after submission. */
  reveal: Record<string, number>
  /** Ids the simulator considers the ideal selection. */
  idealIds: string[]
}

export const USEFUL_THRESHOLD = 0.4

export function idealSelection(items: ContextItemSpec[], tokenLimit: number): string[] {
  // Greedy by relevance density within budget; required items first.
  const sorted = [...items]
    .filter((i) => i.required || i.relevance >= USEFUL_THRESHOLD)
    .sort((a, b) => Number(b.required ?? false) - Number(a.required ?? false) || b.relevance - a.relevance)
  const chosen: string[] = []
  let used = 0
  for (const item of sorted) {
    if (used + item.tokens <= tokenLimit || item.required) {
      chosen.push(item.id)
      used += item.tokens
    }
  }
  return chosen
}

export function simulateContextSelection(input: ContextSelectionInput): ContextSelectionResult {
  const model = getModel(input.modelId)
  const outputTokens = input.outputTokens ?? 800
  const overhead = input.overheadTokens ?? 400
  const byId = new Map(input.items.map((i) => [i.id, i]))
  const selected = [...new Set(input.selectedIds)].map((id) => byId.get(id)).filter((i): i is ContextItemSpec => !!i)

  const tokensUsed = selected.reduce((s, i) => s + Math.max(0, i.tokens), 0)
  const overBudget = Math.max(0, tokensUsed - input.tokenLimit)
  const usefulTokens = selected.reduce((s, i) => s + i.tokens * i.relevance, 0)
  const wastedTokens = tokensUsed - usefulTokens

  // Completeness: share of available "value" captured, where only useful items carry value.
  const useful = input.items.filter((i) => i.relevance >= USEFUL_THRESHOLD || i.required)
  const totalValue = useful.reduce((s, i) => s + i.tokens * i.relevance, 0)
  const capturedValue = selected.filter((i) => i.relevance >= USEFUL_THRESHOLD || i.required).reduce((s, i) => s + i.tokens * i.relevance, 0)
  const missingRequired = useful.filter((i) => i.required && !selected.includes(i))
  let completeness = totalValue === 0 ? 100 : (capturedValue / totalValue) * 100
  if (missingRequired.length > 0) completeness = Math.min(completeness, 40)

  const relevance = tokensUsed === 0 ? 0 : (usefulTokens / tokensUsed) * 100

  const ideal = idealSelection(input.items, input.tokenLimit)
  const idealTokens = ideal.reduce((s, id) => s + (byId.get(id)?.tokens ?? 0), 0)
  const idealCost = requestCost(model, idealTokens + overhead, outputTokens)
  const cost = requestCost(model, tokensUsed + overhead, outputTokens)
  const idealLatency = requestLatency(model, idealTokens + overhead, outputTokens)
  const latency = requestLatency(model, tokensUsed + overhead, outputTokens)

  const costScore = cost <= idealCost ? 100 : linearScore(cost, idealCost, idealCost * 2.5)
  const latencyScore = latency <= idealLatency ? 100 : linearScore(latency, idealLatency, idealLatency * 2.5)

  // Simulated answer quality: driven by completeness, degraded by noise and truncation.
  const noiseShare = tokensUsed === 0 ? 0 : wastedTokens / tokensUsed
  let quality = completeness * (1 - 0.35 * noiseShare)
  if (overBudget > 0) quality *= 0.5

  const breakdown: ScoreDimension[] = [
    { id: 'completeness', label: 'Completeness', score: round(clamp(completeness)), weight: 3 },
    { id: 'relevance', label: 'Relevance', score: round(clamp(relevance)), weight: 2 },
    { id: 'cost', label: 'Cost', score: round(costScore), weight: 2 },
    { id: 'latency', label: 'Latency', score: round(latencyScore), weight: 1 },
  ]
  let score = weightedTotal(breakdown)
  if (overBudget > 0) score = Math.min(score, 55)
  // Lean context that cannot answer the task is not a pass, however cheap it is.
  if (missingRequired.length > 0) score = Math.min(score, 50)

  const isIdeal = selected.length === ideal.length && ideal.every((id) => selected.some((s) => s.id === id))
  const feedback = buildFeedback({ input, selected, overBudget, missingRequired, tokensUsed, cost, latency, isIdeal })
  const passed = score >= 60

  return {
    score,
    passed,
    breakdown,
    feedback,
    summary: summarize(score, overBudget, missingRequired.length),
    metrics: {
      tokensUsed,
      tokenLimit: input.tokenLimit,
      overBudget,
      usefulTokens: round(usefulTokens),
      wastedTokens: round(wastedTokens),
      relevance: round(relevance),
      completeness: round(clamp(completeness)),
      cost: round(cost, 4),
      latency: round(latency, 2),
      idealCost: round(idealCost, 4),
      quality: round(clamp(quality)),
    },
    reveal: Object.fromEntries(input.items.map((i) => [i.id, i.relevance])),
    idealIds: ideal,
  }
}

function summarize(score: number, overBudget: number, missingRequired: number): string {
  if (overBudget > 0) return 'Over budget. The request would fail or be truncated.'
  if (missingRequired > 0) return 'The task could not be completed with this context.'
  if (score >= 90) return 'Lean and complete. This is what good context looks like.'
  if (score >= 75) return 'Solid. A little trimming would make it better.'
  if (score >= 60) return 'It works, but there is real waste in here.'
  return 'This context would produce a poor result.'
}

interface FeedbackCtx {
  input: ContextSelectionInput
  selected: ContextItemSpec[]
  overBudget: number
  missingRequired: ContextItemSpec[]
  tokensUsed: number
  cost: number
  latency: number
  isIdeal: boolean
}

function buildFeedback({ input, selected, overBudget, missingRequired, tokensUsed, cost, latency, isIdeal }: FeedbackCtx): Feedback[] {
  const out: Feedback[] = []
  const selectedIds = new Set(selected.map((s) => s.id))

  if (overBudget > 0) {
    out.push({
      tone: 'warning',
      title: `You exceeded the simulated context budget by ${formatTokens(overBudget)} tokens`,
      body: 'In a real system the request would fail or older content would be dropped silently. Remove the least relevant items first.',
      concept: 'context-window',
    })
  }

  for (const item of missingRequired) {
    out.push({
      tone: 'warning',
      title: `${item.label} was essential and was left out`,
      body: `The task cannot be answered without it. No amount of other context makes up for missing the one source that holds the answer.`,
      concept: 'completeness',
    })
  }

  const missedUseful = input.items
    .filter((i) => !i.required && i.relevance >= USEFUL_THRESHOLD && !selectedIds.has(i.id))
    .sort((a, b) => b.relevance - a.relevance)
  const topMissed = missedUseful[0]
  if (topMissed) {
    out.push({
      tone: 'neutral',
      title: `${topMissed.label} would have helped`,
      body: `It is directly relevant to the task and costs ${formatTokens(topMissed.tokens)} tokens. Completeness matters as much as efficiency.`,
      concept: 'completeness',
    })
  }

  const noise = selected.filter((i) => i.relevance < USEFUL_THRESHOLD).sort((a, b) => b.tokens - a.tokens)
  const topNoise = noise[0]
  if (topNoise) {
    const noiseTokens = noise.reduce((s, i) => s + i.tokens, 0)
    out.push({
      tone: 'warning',
      title: `${formatTokens(noiseTokens)} tokens were probably unnecessary`,
      body:
        noise.length === 1
          ? `${topNoise.label} is not relevant to the task. Removing it would cut context without reducing task coverage.`
          : `${topNoise.label} and ${noise.length - 1} other item${noise.length > 2 ? 's' : ''} are not relevant to the task. Removing them would cut context without reducing task coverage.`,
      concept: 'context-pollution',
    })
  }

  const marginal = selected.filter((i) => i.relevance >= USEFUL_THRESHOLD && i.relevance < 0.7).sort((a, b) => b.tokens - a.tokens)
  const topMarginal = marginal[0]
  if (topMarginal && !topNoise && overBudget === 0 && !isIdeal) {
    out.push({
      tone: 'neutral',
      title: `${topMarginal.label} is only partly relevant`,
      body: `It costs ${formatTokens(topMarginal.tokens)} tokens for a modest gain. With a tighter budget it would be the first thing to drop.`,
      concept: 'relevance',
    })
  }

  if (out.length === 0) {
    out.push({
      tone: 'positive',
      title: 'Exactly what the task needed, and nothing else',
      body: `${formatTokens(tokensUsed)} tokens of context, ${formatCurrency(cost)} and about ${formatSeconds(latency)} per request. This selection scales.`,
      concept: 'efficiency',
    })
  } else if (overBudget === 0 && missingRequired.length === 0) {
    out.push({
      tone: 'neutral',
      title: 'Simulated cost and latency',
      body: `${formatTokens(tokensUsed)} tokens of context cost ${formatCurrency(cost)} and about ${formatSeconds(latency)} per request. Multiply that by every user, every day.`,
      concept: 'efficiency',
    })
  }

  return out
}
