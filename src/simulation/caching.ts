import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { linearScore, round } from './scoring'

/**
 * Prompt caching, simplified for teaching. The cache is a PREFIX cache: a cached
 * segment is reusable only while everything before it is byte-identical.
 * Relative prices from the docs: 5-minute write 1.25x input, 1-hour write 2x, read 0.1x.
 * Short prefixes below a model's minimum simply do not cache.
 * Source: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
 */

export const CACHE_MULTIPLIERS = { write5m: 1.25, write1h: 2, read: 0.1 } as const
export const MAX_BREAKPOINTS = 4

export interface CacheBlock {
  id: string
  label: string
  tokens: number
  /** Whether the block's content is identical on the next call. */
  changesEveryCall: boolean
  detail?: string
}

export interface CachingInput {
  blocks: CacheBlock[]
  /** Block ids in request order. */
  order: string[]
  /** Block ids that a cache breakpoint sits after. */
  breakpoints: string[]
  ttl: '5m' | '1h'
  calls: number
  minutesBetweenCalls: number
  /** Model minimum for a cacheable prefix. */
  minCacheableTokens: number
}

export interface CachingResult {
  cachedPrefixTokens: number
  freshTokensPerCall: number
  writes: number
  reads: number
  /** Relative cost units: 1 unit = one uncached input token. */
  cost: number
  baselineCost: number
  savedPercent: number
  reason: string
}

function ordered(input: CachingInput): CacheBlock[] {
  const byId = new Map(input.blocks.map((b) => [b.id, b]))
  const seen = new Set<string>()
  const list: CacheBlock[] = []
  for (const id of input.order) {
    const b = byId.get(id)
    if (b && !seen.has(id)) {
      seen.add(id)
      list.push(b)
    }
  }
  for (const b of input.blocks) if (!seen.has(b.id)) list.push(b)
  return list
}

/** Tokens of the longest stable prefix that ends at a breakpoint. */
export function cacheablePrefix(input: CachingInput): { tokens: number; endsAt: string | null; blockedBy: string | null } {
  const list = ordered(input)
  const breakpoints = new Set(input.breakpoints.slice(0, MAX_BREAKPOINTS))
  let tokens = 0
  let best = 0
  let endsAt: string | null = null
  for (const block of list) {
    if (block.changesEveryCall) return { tokens: best, endsAt, blockedBy: best === 0 ? block.id : null }
    tokens += Math.max(0, block.tokens)
    if (breakpoints.has(block.id)) {
      best = tokens
      endsAt = block.id
    }
  }
  return { tokens: best, endsAt, blockedBy: null }
}

export function simulateCaching(input: CachingInput): CachingResult {
  const list = ordered(input)
  const total = list.reduce((s, b) => s + Math.max(0, b.tokens), 0)
  const calls = Math.max(1, Math.round(input.calls))
  const { tokens: prefix, endsAt, blockedBy } = cacheablePrefix(input)
  const baselineCost = total * calls

  const usable = prefix >= input.minCacheableTokens && endsAt !== null
  if (!usable) {
    const reason =
      endsAt === null
        ? blockedBy
          ? `Nothing is cached: "${list.find((b) => b.id === blockedBy)?.label}" changes on every call and sits before your first breakpoint, so the whole prefix is new each time.`
          : 'Nothing is cached: there is no cache breakpoint after a stable block.'
        : `The stable prefix is only ${prefix} tokens, below the ${input.minCacheableTokens}-token minimum, so it is silently not cached.`
    return { cachedPrefixTokens: prefix, freshTokensPerCall: total, writes: 0, reads: 0, cost: baselineCost, baselineCost, savedPercent: 0, reason }
  }

  const ttlMinutes = input.ttl === '1h' ? 60 : 5
  const expiresBetweenCalls = input.minutesBetweenCalls > ttlMinutes
  const writeMultiplier = input.ttl === '1h' ? CACHE_MULTIPLIERS.write1h : CACHE_MULTIPLIERS.write5m
  const writes = expiresBetweenCalls ? calls : 1
  const reads = calls - writes
  const fresh = total - prefix
  const cost = writes * prefix * writeMultiplier + reads * prefix * CACHE_MULTIPLIERS.read + calls * fresh

  const reason = expiresBetweenCalls
    ? `The cache expires between calls (${input.minutesBetweenCalls} minutes apart, ${input.ttl} lifetime), so every call pays the write premium and never gets a read.`
    : `${prefix} tokens are cached after the first call and read back at ${CACHE_MULTIPLIERS.read}x for the other ${reads} calls.`

  return {
    cachedPrefixTokens: prefix,
    freshTokensPerCall: fresh,
    writes,
    reads,
    cost: round(cost),
    baselineCost,
    savedPercent: baselineCost === 0 ? 0 : round(((baselineCost - cost) / baselineCost) * 100),
    reason,
  }
}

/** Best achievable arrangement: stable blocks first, one breakpoint after the last of them. */
export function idealCaching(input: CachingInput): CachingResult {
  const stable = input.blocks.filter((b) => !b.changesEveryCall)
  const volatile = input.blocks.filter((b) => b.changesEveryCall)
  const last = stable.at(-1)
  const ttl: '5m' | '1h' = input.minutesBetweenCalls > 5 ? '1h' : '5m'
  return simulateCaching({
    ...input,
    ttl,
    order: [...stable.map((b) => b.id), ...volatile.map((b) => b.id)],
    breakpoints: last ? [last.id] : [],
  })
}

export interface CacheArchitectResult extends ChallengeResult {
  run: CachingResult
  ideal: CachingResult
}

export function simulateCacheArchitect(input: CachingInput, passScore = 75): CacheArchitectResult {
  const run = simulateCaching(input)
  const ideal = idealCaching(input)
  const savingsScore = ideal.savedPercent <= 0 ? 100 : linearScore(run.savedPercent, ideal.savedPercent, 0)
  const costScore = run.cost <= ideal.cost * 1.02 ? 100 : linearScore(run.cost, ideal.cost, ideal.cost * 3)
  const breakdown: ScoreDimension[] = [
    { id: 'savings', label: 'Cache hit rate', score: savingsScore, weight: 2 },
    { id: 'cost', label: 'Cost vs ideal', score: costScore, weight: 2 },
    { id: 'breakpoints', label: 'Breakpoints', score: input.breakpoints.length === 0 ? 0 : input.breakpoints.length <= MAX_BREAKPOINTS ? 100 : 40, weight: 1 },
  ]
  const score = Math.round((breakdown.reduce((s, d) => s + d.score * (d.weight ?? 1), 0) / breakdown.reduce((s, d) => s + (d.weight ?? 1), 0)))

  const feedback: Feedback[] = []
  if (run.savedPercent < ideal.savedPercent) {
    feedback.push({ tone: 'warning', title: `You saved ${run.savedPercent}%, the best arrangement saves ${ideal.savedPercent}%`, body: run.reason, concept: 'caching' })
  } else {
    feedback.push({ tone: 'positive', title: `${run.savedPercent}% cheaper than sending everything fresh`, body: run.reason, concept: 'caching' })
  }
  if (input.breakpoints.length > MAX_BREAKPOINTS) {
    feedback.push({ tone: 'warning', title: `Only ${MAX_BREAKPOINTS} cache breakpoints are allowed`, body: `You set ${input.breakpoints.length}. The extra ones are ignored.`, concept: 'caching' })
  }
  if (input.ttl === '1h' && input.minutesBetweenCalls <= 5) {
    feedback.push({ tone: 'neutral', title: 'A 1-hour cache costs more to write', body: 'Writes cost 2x with a 1-hour lifetime versus 1.25x for 5 minutes. With calls this close together, the shorter lifetime is enough.', concept: 'caching' })
  }
  if (input.ttl === '5m' && input.minutesBetweenCalls > 5) {
    feedback.push({ tone: 'warning', title: 'The cache expires before the next call', body: `Calls are ${input.minutesBetweenCalls} minutes apart. A 1-hour lifetime costs 2x to write but is read back at 0.1x instead of writing every time.`, concept: 'caching' })
  }
  return {
    score,
    passed: score >= passScore,
    breakdown,
    feedback,
    summary: run.savedPercent >= ideal.savedPercent ? 'Optimal layout: the stable prefix is cached and re-read.' : `${run.savedPercent}% saved. There is more on the table.`,
    metrics: { savedPercent: run.savedPercent, cost: run.cost, baselineCost: run.baselineCost, cachedPrefixTokens: run.cachedPrefixTokens },
    run,
    ideal,
  }
}
