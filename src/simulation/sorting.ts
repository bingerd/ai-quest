import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { round } from './scoring'

/**
 * "Put each item in the right bucket." Generic and deterministic: used for
 * "where does this belong?" style challenges in any training.
 */

export interface SortBucket {
  id: string
  label: string
  description?: string
}

export interface SortItem {
  id: string
  label: string
  detail?: string
  correctBucket: string
  /** Buckets that are defensible but not ideal: half credit. */
  acceptable?: string[]
  /** Why the correct bucket is right. Shown after submitting. */
  explanation: string
}

export interface SortingInput {
  buckets: SortBucket[]
  items: SortItem[]
  /** itemId → bucketId */
  placements: Record<string, string>
  passScore?: number
}

export interface SortingResult extends ChallengeResult {
  itemResults: { itemId: string; placed: string | null; verdict: 'correct' | 'acceptable' | 'wrong' | 'missing' }[]
}

export function simulateSorting(input: SortingInput): SortingResult {
  const bucketLabel = new Map(input.buckets.map((b) => [b.id, b.label]))
  const itemResults = input.items.map((item) => {
    const raw = input.placements[item.id]
    const placed = typeof raw === 'string' && bucketLabel.has(raw) ? raw : null
    const verdict: 'correct' | 'acceptable' | 'wrong' | 'missing' =
      placed === null ? 'missing' : placed === item.correctBucket ? 'correct' : item.acceptable?.includes(placed) ? 'acceptable' : 'wrong'
    return { itemId: item.id, placed, verdict }
  })

  const points = itemResults.reduce((s, r) => s + (r.verdict === 'correct' ? 1 : r.verdict === 'acceptable' ? 0.5 : 0), 0)
  const score = input.items.length === 0 ? 0 : round((points / input.items.length) * 100)

  // Per-bucket accuracy: of the items that belong in a bucket, how many landed there.
  const breakdown: ScoreDimension[] = input.buckets
    .map((b) => {
      const belong = input.items.filter((i) => i.correctBucket === b.id)
      if (belong.length === 0) return null
      const got = belong.filter((i) => itemResults.find((r) => r.itemId === i.id)?.placed === b.id).length
      return { id: b.id, label: b.label, score: round((got / belong.length) * 100) }
    })
    .filter((d): d is ScoreDimension => d !== null)

  const feedback: Feedback[] = []
  // Confusion summary: most common wrong destination for a correct bucket.
  const confusions = new Map<string, number>()
  for (const r of itemResults) {
    if (r.verdict !== 'wrong' || !r.placed) continue
    const item = input.items.find((i) => i.id === r.itemId)!
    const key = `${r.placed}→${item.correctBucket}`
    confusions.set(key, (confusions.get(key) ?? 0) + 1)
  }
  const top = [...confusions.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]
  if (top && top[1] >= 2) {
    const [from, to] = top[0].split('→') as [string, string]
    feedback.push({
      tone: 'warning',
      title: `${top[1]} things you put in ${bucketLabel.get(from)} belong in ${bucketLabel.get(to)}`,
      body: 'That is the most common mix-up in your answer. Check what makes each of these different.',
      concept: 'sorting',
    })
  }

  for (const r of itemResults) {
    const item = input.items.find((i) => i.id === r.itemId)!
    const right = bucketLabel.get(item.correctBucket) ?? item.correctBucket
    if (r.verdict === 'correct') {
      feedback.push({ tone: 'positive', title: `${item.label} → ${right}`, body: item.explanation })
    } else if (r.verdict === 'acceptable') {
      feedback.push({ tone: 'neutral', title: `${item.label}: ${bucketLabel.get(r.placed!)} works, ${right} is better`, body: item.explanation })
    } else if (r.verdict === 'wrong') {
      feedback.push({ tone: 'warning', title: `${item.label} belongs in ${right}, not ${bucketLabel.get(r.placed!)}`, body: item.explanation })
    } else {
      feedback.push({ tone: 'warning', title: `${item.label} was not placed`, body: `It belongs in ${right}. ${item.explanation}` })
    }
  }
  // Mistakes first.
  const order = { warning: 0, neutral: 1, positive: 2 } as const
  feedback.sort((a, b) => order[a.tone] - order[b.tone])

  const correct = itemResults.filter((r) => r.verdict === 'correct').length
  return {
    score,
    passed: score >= (input.passScore ?? 70),
    breakdown,
    feedback,
    summary: `${correct} of ${input.items.length} in the right place.`,
    itemResults,
  }
}

/** Parse an unknown answer into placements, dropping anything malformed. */
export function parsePlacements(answer: unknown): Record<string, string> {
  const raw = typeof answer === 'object' && answer !== null ? (answer as { placements?: unknown }).placements : null
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) if (typeof v === 'string') out[k] = v
  return out
}
