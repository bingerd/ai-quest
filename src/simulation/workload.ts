import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { round, weightedTotal } from './scoring'

/**
 * Realtime vs batch vs cached, per workload. The Batches API gives a 50% discount
 * and usually finishes within an hour, so it fits work nobody is waiting for.
 * Caching pays off when calls share a large, stable prefix.
 * Source: https://platform.claude.com/docs/en/build-with-claude/batch-processing
 */

export type Delivery = 'realtime' | 'batch' | 'realtime-cached'

export const BATCH_DISCOUNT = 0.5

export interface Workload {
  id: string
  title: string
  description: string
  /** Someone is waiting for the answer right now. */
  interactive: boolean
  requests: number
  /** Tokens repeated on every request (documents, instructions). */
  sharedPrefixTokens: number
  uniqueTokensPerRequest: number
  outputTokens: number
  /** The correct answer for this workload. */
  best: Delivery
  why: Record<Delivery, string>
}

export interface WorkloadAnswer {
  choices: Record<string, Delivery>
}

export function estimateCost(workload: Workload, delivery: Delivery): number {
  const per = workload.sharedPrefixTokens + workload.uniqueTokensPerRequest + workload.outputTokens
  const raw = per * workload.requests
  if (delivery === 'batch') return round(raw * BATCH_DISCOUNT)
  if (delivery === 'realtime-cached') {
    const cached = workload.sharedPrefixTokens * (1 * 1.25 + (workload.requests - 1) * 0.1)
    return round(cached + (workload.uniqueTokensPerRequest + workload.outputTokens) * workload.requests)
  }
  return round(raw)
}

export function simulateWorkloadPlan(workloads: Workload[], answer: WorkloadAnswer, passScore = 75): ChallengeResult {
  const breakdown: ScoreDimension[] = []
  const feedback: Feedback[] = []
  for (const w of workloads) {
    const choice = answer.choices[w.id]
    const ok = choice === w.best
    const impossible = choice === 'batch' && w.interactive
    breakdown.push({ id: w.id, label: w.title, score: ok ? 100 : impossible ? 0 : 50 })
    if (!choice) {
      feedback.push({ tone: 'warning', title: `${w.title}: no decision`, body: 'Pick how this workload is delivered.' })
      continue
    }
    feedback.push({
      tone: ok ? 'positive' : impossible ? 'warning' : 'neutral',
      title: `${w.title}: ${labelFor(choice)}`,
      body: `${w.why[choice]} ${ok ? '' : `The better fit is ${labelFor(w.best)}: ${w.why[w.best]}`}`.trim(),
      concept: 'workloads',
    })
  }
  const score = weightedTotal(breakdown)
  const order = { warning: 0, neutral: 1, positive: 2 } as const
  feedback.sort((a, b) => order[a.tone] - order[b.tone])
  return {
    score,
    passed: score >= passScore,
    breakdown,
    feedback,
    summary: `${breakdown.filter((d) => d.score === 100).length} of ${workloads.length} workloads on the right path.`,
  }
}

export function labelFor(d: Delivery): string {
  return d === 'batch' ? 'the Batches API' : d === 'realtime-cached' ? 'realtime with prompt caching' : 'plain realtime'
}

export function parseWorkloadAnswer(answer: unknown): WorkloadAnswer {
  const raw = typeof answer === 'object' && answer !== null ? (answer as { choices?: unknown }).choices : null
  const choices: Record<string, Delivery> = {}
  if (typeof raw === 'object' && raw !== null) {
    for (const [k, v] of Object.entries(raw)) if (v === 'batch' || v === 'realtime' || v === 'realtime-cached') choices[k] = v
  }
  return { choices }
}
