import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { round, weightedTotal } from './scoring'

/**
 * "Put these in the right order." The sequence sibling of `sorting.ts`, which
 * does buckets. Generic and deterministic, so any training can use it.
 *
 * Two things are scored, because they fail differently: how many steps sit in
 * exactly the right place, and how many neighbouring pairs survived. An order
 * that is right except for one step dropped at the end still keeps most of its
 * pairs, and should not score the same as a shuffle.
 */

export interface OrderStep {
  id: string
  label: string
  /** Why this step belongs where it does. Shown after submitting. */
  explanation: string
}

export interface OrderingInput {
  /** The steps, already in the correct order. */
  steps: OrderStep[]
  /** The learner's order, as step ids. */
  given: string[]
  passScore?: number
}

export interface OrderingResult extends ChallengeResult {
  positions: { id: string; placedAt: number; correctAt: number; correct: boolean }[]
  /** True when the learner left steps out entirely. */
  incomplete: boolean
}

/** Keeps known ids only, first occurrence wins. Junk in never throws. */
function normalise(steps: OrderStep[], given: string[]): string[] {
  const known = new Set(steps.map((s) => s.id))
  const out: string[] = []
  for (const id of given) {
    if (known.has(id) && !out.includes(id)) out.push(id)
  }
  return out
}

export function simulateOrdering(input: OrderingInput): OrderingResult {
  const { steps } = input
  const passScore = input.passScore ?? 70
  const placed = normalise(steps, input.given)
  const n = steps.length

  if (n === 0) {
    return { score: 0, passed: false, breakdown: [], feedback: [], positions: [], incomplete: true, summary: 'Nothing to order.' }
  }

  const correctIndex = new Map(steps.map((s, i) => [s.id, i]))
  const positions = steps.map((s) => {
    const placedAt = placed.indexOf(s.id)
    const correctAt = correctIndex.get(s.id) ?? 0
    return { id: s.id, placedAt, correctAt, correct: placedAt === correctAt }
  })

  const positionHits = positions.filter((p) => p.correct).length
  let pairHits = 0
  for (let i = 0; i < n - 1; i += 1) {
    const a = steps[i]?.id
    const b = steps[i + 1]?.id
    if (a === undefined || b === undefined) continue
    const at = placed.indexOf(a)
    if (at >= 0 && placed[at + 1] === b) pairHits += 1
  }

  const positionScore = (positionHits / n) * 100
  const adjacencyScore = n > 1 ? (pairHits / (n - 1)) * 100 : positionScore

  const breakdown: ScoreDimension[] = [
    { id: 'positions', label: 'Steps in the right place', score: round(positionScore), weight: 2 },
    { id: 'flow', label: 'Steps that still follow on', score: round(adjacencyScore), weight: 1 },
  ]

  const incomplete = placed.length < n
  let score = weightedTotal(breakdown)
  // Leaving steps out is a hard failure, not an average worth softening.
  if (incomplete) score = Math.min(score, 50)

  const feedback: Feedback[] = []
  if (incomplete) {
    feedback.push({ tone: 'warning', title: 'Some steps were left out', body: 'Every step has to go somewhere before this can be scored properly.', concept: 'structure' })
  }
  for (const p of positions.filter((x) => !x.correct).slice(0, 3)) {
    const step = steps[p.correctAt]
    if (step) feedback.push({ tone: 'neutral', title: `"${step.label}" belongs at position ${p.correctAt + 1}`, body: step.explanation, concept: 'structure' })
  }
  if (feedback.length === 0) {
    feedback.push({ tone: 'positive', title: 'The order holds together', body: 'Each step sets up the next one, which is what makes a reader keep going.', concept: 'structure' })
  }

  return {
    score: round(score),
    passed: score >= passScore,
    breakdown,
    feedback,
    positions,
    incomplete,
    summary: incomplete ? 'Not every step was placed.' : positionHits === n ? 'Exactly right.' : `${positionHits} of ${n} steps are in the right place.`,
  }
}

export function parseOrder(answer: unknown): string[] {
  if (Array.isArray(answer)) return answer.filter((x): x is string => typeof x === 'string')
  if (typeof answer === 'object' && answer !== null) {
    const o = (answer as { order?: unknown }).order
    if (Array.isArray(o)) return o.filter((x): x is string => typeof x === 'string')
  }
  return []
}
