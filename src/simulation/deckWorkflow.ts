import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { evaluateBrief, type BriefChoices, type BriefSpec } from './brief'
import { simulateContextSelection, type ContextItemSpec } from './contextSelection'
import { round, weightedTotal } from './scoring'
import { formatTokens } from './tokens'

/**
 * Everyday final challenge: produce a deck by combining where you work, which
 * sources you give Claude, how you brief it and how you review the result.
 * Composes the context-selection and brief simulations. Deterministic.
 */

export interface WorkflowChoice {
  id: string
  label: string
  detail: string
  /** 0..100 */
  score: number
  explanation: string
}

export interface DeckWorkflowSpec {
  task: string
  tokenLimit: number
  modelId: string
  items: ContextItemSpec[]
  /** Item ids that must never be shared. */
  sensitiveIds: string[]
  brief: BriefSpec
  workspaces: WorkflowChoice[]
  reviews: WorkflowChoice[]
  passScore?: number
}

export interface DeckWorkflowAnswer {
  workspace: string
  selectedIds: string[]
  briefChoices: BriefChoices
  review: string
}

export interface DeckWorkflowResult extends ChallengeResult {
  narrative: string[]
  outline: string[]
}

export function simulateDeckWorkflow(spec: DeckWorkflowSpec, answer: DeckWorkflowAnswer): DeckWorkflowResult {
  const ctx = simulateContextSelection({ items: spec.items, selectedIds: answer.selectedIds, tokenLimit: spec.tokenLimit, modelId: spec.modelId })
  const brief = evaluateBrief(spec.brief, answer.briefChoices)
  const workspace = spec.workspaces.find((w) => w.id === answer.workspace)
  const review = spec.reviews.find((r) => r.id === answer.review)
  const leaked = spec.items.filter((i) => spec.sensitiveIds.includes(i.id) && answer.selectedIds.includes(i.id))

  const breakdown: ScoreDimension[] = [
    { id: 'sources', label: 'Sources', score: ctx.score, weight: 3 },
    { id: 'brief', label: 'Brief', score: brief.score, weight: 3 },
    { id: 'workspace', label: 'Where you worked', score: workspace?.score ?? 0, weight: 1 },
    { id: 'review', label: 'Review', score: review?.score ?? 0, weight: 2 },
    { id: 'safety', label: 'Data safety', score: leaked.length === 0 ? 100 : 0, weight: 2 },
  ]
  let score = weightedTotal(breakdown)
  const passScore = spec.passScore ?? 70
  if (leaked.length > 0) score = Math.min(score, 40)
  if (ctx.metrics.completeness <= 40) score = Math.min(score, 50)
  // Each part is a gate: a strong average cannot hide one broken step.
  if (ctx.metrics.overBudget > 0) score = Math.min(score, passScore - 10)
  if (brief.score < 50) score = Math.min(score, passScore - 1)
  if ((review?.score ?? 0) < 50) score = Math.min(score, passScore - 1)

  const feedback: Feedback[] = []
  for (const item of leaked) {
    feedback.push({ tone: 'warning', title: `${item.label} should never have been shared`, body: 'It has nothing to do with the deck and contains personal data. Leave sensitive files out, whatever tool you use.', concept: 'security' })
  }
  if (review && review.score < 50) feedback.push({ tone: 'warning', title: `Review: ${review.label}`, body: review.explanation, concept: 'review' })
  // Keep source feedback in plain language: no cost notes, and no repeating the sensitive-data warning.
  const sourceNotes = ctx.feedback.filter((f) => f.tone !== 'positive' && f.concept !== 'efficiency' && !leaked.some((l) => f.body.includes(l.label) || f.title.includes(l.label)))
  feedback.push(...sourceNotes.slice(0, 2))
  feedback.push(...brief.feedback.filter((f) => f.tone !== 'positive').slice(0, 2))
  if (workspace && workspace.score < 80) feedback.push({ tone: 'neutral', title: `Workspace: ${workspace.label}`, body: workspace.explanation, concept: 'projects' })
  if (review && review.score >= 50) feedback.push({ tone: review.score >= 80 ? 'positive' : 'neutral', title: `Review: ${review.label}`, body: review.explanation, concept: 'review' })
  if (feedback.every((f) => f.tone === 'positive')) {
    feedback.unshift({ tone: 'positive', title: 'A deck you can put in front of the board', body: 'Right sources, a sharp brief, a reusable project and a real check before it goes out.', concept: 'workflow' })
  }

  const narrative = [
    `You worked in ${workspace ? workspace.label.toLowerCase() : 'an unspecified place'} and gave Claude ${answer.selectedIds.length} source${answer.selectedIds.length === 1 ? '' : 's'} (${formatTokens(ctx.metrics.tokensUsed)} simulated tokens).`,
    brief.text ? `Your request: "${brief.text}"` : 'You did not write much of a request.',
    review ? `Before sending: ${review.label.toLowerCase()}.` : 'You did not choose a review step.',
  ]

  return {
    score: round(score),
    passed: score >= passScore,
    breakdown,
    feedback,
    summary:
      leaked.length > 0
        ? 'Sensitive data went into the chat. That outweighs everything else.'
        : score >= 90
          ? 'Board-ready, and done the efficient way.'
          : score >= passScore
            ? 'A usable deck, with a few habits to sharpen.'
            : 'This deck would cause problems in the boardroom.',
    narrative,
    outline: brief.outline,
  }
}

export function parseDeckWorkflowAnswer(answer: unknown): DeckWorkflowAnswer {
  const o = (typeof answer === 'object' && answer !== null ? answer : {}) as Partial<Record<keyof DeckWorkflowAnswer, unknown>>
  const choices: BriefChoices = {}
  if (typeof o.briefChoices === 'object' && o.briefChoices !== null) {
    for (const [k, v] of Object.entries(o.briefChoices)) if (typeof v === 'string') choices[k] = v
  }
  return {
    workspace: typeof o.workspace === 'string' ? o.workspace : '',
    selectedIds: Array.isArray(o.selectedIds) ? o.selectedIds.filter((x): x is string => typeof x === 'string') : [],
    briefChoices: choices,
    review: typeof o.review === 'string' ? o.review : '',
  }
}
