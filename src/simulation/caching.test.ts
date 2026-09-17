import { describe, expect, it } from 'vitest'
import { cacheablePrefix, idealCaching, simulateCacheArchitect, simulateCaching, type CachingInput } from './caching'

const blocks = [
  { id: 'tools', label: 'Tool definitions', tokens: 2_000, changesEveryCall: false },
  { id: 'system', label: 'System prompt', tokens: 1_000, changesEveryCall: false },
  { id: 'docs', label: 'Policy documents', tokens: 12_000, changesEveryCall: false },
  { id: 'history', label: 'Conversation so far', tokens: 3_000, changesEveryCall: true },
  { id: 'question', label: 'User question', tokens: 200, changesEveryCall: true },
]

const base: CachingInput = {
  blocks,
  order: ['tools', 'system', 'docs', 'history', 'question'],
  breakpoints: ['docs'],
  ttl: '5m',
  calls: 50,
  minutesBetweenCalls: 1,
  minCacheableTokens: 1_024,
}

describe('cacheablePrefix', () => {
  it('is the stable run up to the last breakpoint inside it', () => {
    expect(cacheablePrefix(base)).toEqual({ tokens: 15_000, endsAt: 'docs', blockedBy: null })
    expect(cacheablePrefix({ ...base, breakpoints: ['system'] }).tokens).toBe(3_000)
  })
  it('is zero when a changing block comes first', () => {
    expect(cacheablePrefix({ ...base, order: ['history', 'tools', 'system', 'docs', 'question'] })).toMatchObject({ tokens: 0, blockedBy: 'history' })
  })
  it('ignores breakpoints beyond the fourth', () => {
    const r = cacheablePrefix({ ...base, breakpoints: ['tools', 'tools', 'system', 'system', 'docs'] })
    expect(r.tokens).toBe(3_000)
  })
})

describe('simulateCaching', () => {
  it('writes once and reads afterwards', () => {
    const r = simulateCaching(base)
    expect(r.writes).toBe(1)
    expect(r.reads).toBe(49)
    expect(r.cost).toBe(1 * 15_000 * 1.25 + 49 * 15_000 * 0.1 + 50 * 3_200)
    expect(r.savedPercent).toBeGreaterThan(70)
  })
  it('caches nothing when the volatile block is first', () => {
    const r = simulateCaching({ ...base, order: ['history', 'tools', 'system', 'docs', 'question'] })
    expect(r.cost).toBe(r.baselineCost)
    expect(r.reason).toContain('changes on every call')
  })
  it('caches nothing below the minimum length', () => {
    const r = simulateCaching({ ...base, breakpoints: ['system'], minCacheableTokens: 4_096 })
    expect(r.savedPercent).toBe(0)
    expect(r.reason).toContain('minimum')
  })
  it('rewrites every call when the cache expires in between', () => {
    const r = simulateCaching({ ...base, minutesBetweenCalls: 30 })
    expect(r.writes).toBe(50)
    expect(r.reads).toBe(0)
    expect(r.cost).toBeGreaterThan(r.baselineCost)
    const hour = simulateCaching({ ...base, ttl: '1h', minutesBetweenCalls: 30 })
    expect(hour.reads).toBe(49)
    expect(hour.cost).toBeLessThan(r.cost)
  })
  it('is deterministic', () => {
    expect(simulateCaching(base)).toEqual(simulateCaching(base))
  })
})

describe('simulateCacheArchitect', () => {
  it('scores the ideal arrangement highly', () => {
    const r = simulateCacheArchitect(base)
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.passed).toBe(true)
    expect(r.feedback[0]?.tone).toBe('positive')
  })
  it('fails an arrangement that caches nothing', () => {
    const r = simulateCacheArchitect({ ...base, breakpoints: [] })
    expect(r.passed).toBe(false)
    expect(r.breakdown.find((d) => d.id === 'breakpoints')?.score).toBe(0)
  })
  it('warns when the lifetime does not match the call spacing', () => {
    expect(simulateCacheArchitect({ ...base, minutesBetweenCalls: 30 }).feedback.some((f) => f.title.includes('expires before'))).toBe(true)
    expect(simulateCacheArchitect({ ...base, ttl: '1h' }).feedback.some((f) => f.title.includes('costs more to write'))).toBe(true)
  })
  it('ideal ordering puts stable blocks first', () => {
    expect(idealCaching({ ...base, order: ['history', 'question', 'tools', 'system', 'docs'], breakpoints: [] }).cachedPrefixTokens).toBe(15_000)
  })
})
