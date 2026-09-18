import { describe, expect, it } from 'vitest'
import { parseOrder, simulateOrdering, type OrderStep } from './ordering'

const STEPS: OrderStep[] = [
  { id: 's', label: 'Situation', explanation: 'The shared starting point everyone already agrees on.' },
  { id: 'c', label: 'Complication', explanation: 'What changed, and why the situation no longer holds.' },
  { id: 'q', label: 'Question', explanation: 'The question the complication forces.' },
  { id: 'a', label: 'Answer', explanation: 'Your recommendation, stated before the evidence.' },
]

const ids = STEPS.map((s) => s.id)

describe('simulateOrdering', () => {
  it('scores the correct order full marks', () => {
    const r = simulateOrdering({ steps: STEPS, given: ids })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
    expect(r.incomplete).toBe(false)
    expect(r.feedback.every((f) => f.tone === 'positive')).toBe(true)
  })

  it('gives partial credit when one step moves but the rest still follow on', () => {
    // Answer pulled to the front: three of four pairs are broken, but S-C-Q survives.
    const r = simulateOrdering({ steps: STEPS, given: ['a', 's', 'c', 'q'] })
    expect(r.score).toBeGreaterThan(0)
    expect(r.score).toBeLessThan(100)
    expect(r.passed).toBe(false)
    const flow = r.breakdown.find((d) => d.id === 'flow')
    expect(flow?.score).toBe(67)
  })

  it('scores a full reversal far below a near miss', () => {
    const reversed = simulateOrdering({ steps: STEPS, given: [...ids].reverse() })
    const nearMiss = simulateOrdering({ steps: STEPS, given: ['s', 'c', 'a', 'q'] })
    expect(reversed.score).toBeLessThan(nearMiss.score)
  })

  it('caps an incomplete answer, however good the part that was placed', () => {
    const r = simulateOrdering({ steps: STEPS, given: ['s', 'c'] })
    expect(r.incomplete).toBe(true)
    expect(r.score).toBeLessThanOrEqual(50)
    expect(r.passed).toBe(false)
    expect(r.feedback[0]?.tone).toBe('warning')
  })

  it('names where a misplaced step belongs, and explains why', () => {
    const r = simulateOrdering({ steps: STEPS, given: ['c', 's', 'q', 'a'] })
    const note = r.feedback.find((f) => f.title.includes('Situation'))
    expect(note?.title).toContain('position 1')
    expect(note?.body).toContain('starting point')
  })

  it('ignores unknown ids and duplicates rather than trusting the input', () => {
    const r = simulateOrdering({ steps: STEPS, given: ['s', 's', 'nope', 'c', 'q', 'a'] })
    expect(r.score).toBe(100)
    expect(r.incomplete).toBe(false)
  })

  it('handles the degenerate cases without throwing', () => {
    expect(simulateOrdering({ steps: [], given: [] }).score).toBe(0)
    expect(simulateOrdering({ steps: [], given: ['x'] }).passed).toBe(false)
    const one = simulateOrdering({ steps: [STEPS[0]!], given: ['s'] })
    expect(one.score).toBe(100)
    expect(simulateOrdering({ steps: STEPS, given: [] }).score).toBeLessThanOrEqual(50)
  })

  it('is deterministic', () => {
    const input = { steps: STEPS, given: ['c', 'a', 's', 'q'] }
    expect(simulateOrdering(input)).toEqual(simulateOrdering(input))
  })
})

describe('parseOrder', () => {
  it('accepts a bare array and an { order } object', () => {
    expect(parseOrder(['a', 'b'])).toEqual(['a', 'b'])
    expect(parseOrder({ order: ['a'] })).toEqual(['a'])
  })

  it('never throws on malformed input', () => {
    for (const junk of [undefined, null, 42, 'text', {}, { order: 'nope' }, [1, 'a', null]]) {
      expect(() => parseOrder(junk)).not.toThrow()
    }
    expect(parseOrder([1, 'a', null])).toEqual(['a'])
    expect(parseOrder({ order: 'nope' })).toEqual([])
  })
})
