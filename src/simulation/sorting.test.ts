import { describe, expect, it } from 'vitest'
import { parsePlacements, simulateSorting, type SortBucket, type SortItem } from './sorting'

const buckets: SortBucket[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]
const items: SortItem[] = [
  { id: '1', label: 'One', correctBucket: 'a', explanation: 'one' },
  { id: '2', label: 'Two', correctBucket: 'a', acceptable: ['b'], explanation: 'two' },
  { id: '3', label: 'Three', correctBucket: 'b', explanation: 'three' },
  { id: '4', label: 'Four', correctBucket: 'b', explanation: 'four' },
]

describe('simulateSorting', () => {
  it('scores all correct as 100', () => {
    const r = simulateSorting({ buckets, items, placements: { '1': 'a', '2': 'a', '3': 'b', '4': 'b' } })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
    expect(r.feedback.every((f) => f.tone === 'positive')).toBe(true)
    expect(r.breakdown.map((d) => d.id)).toEqual(['a', 'b'])
  })
  it('gives half credit for acceptable buckets', () => {
    const r = simulateSorting({ buckets, items, placements: { '1': 'a', '2': 'b', '3': 'b', '4': 'b' } })
    expect(r.score).toBe(88)
    expect(r.itemResults[1]?.verdict).toBe('acceptable')
    expect(r.feedback[0]?.tone).toBe('neutral')
  })
  it('summarises the most common confusion and marks missing and unknown buckets', () => {
    const r = simulateSorting({ buckets, items, placements: { '1': 'c', '3': 'a', '4': 'a', '2': 'nope' } })
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
    expect(r.feedback[0]?.title).toBe('2 things you put in Alpha belong in Beta')
    expect(r.itemResults.find((x) => x.itemId === '2')?.verdict).toBe('missing')
  })
  it('handles no items and is deterministic', () => {
    expect(simulateSorting({ buckets, items: [], placements: {} }).score).toBe(0)
    const p = { '1': 'b', '2': 'c', '3': 'a', '4': 'b' }
    expect(simulateSorting({ buckets, items, placements: p })).toEqual(simulateSorting({ buckets, items, placements: p }))
  })
})

describe('parsePlacements', () => {
  it('drops malformed input', () => {
    expect(parsePlacements(null)).toEqual({})
    expect(parsePlacements({ placements: null })).toEqual({})
    expect(parsePlacements({ placements: { a: 'x', b: 3 } })).toEqual({ a: 'x' })
  })
})
