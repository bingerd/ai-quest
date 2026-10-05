import { describe, expect, it } from 'vitest'
import { candidates, greedyPicks, runPicks, type NextTokenTable } from './nextToken'

const table: NextTokenTable = {
  start: [
    { token: ' cat', p: 0.2, next: 'cat' },
    { token: ' report', p: 0.6, next: 'report' },
  ],
  report: [{ token: ' is due.', p: 0.9 }],
  cat: [{ token: ' sat.', p: 0.5 }],
}

describe('nextToken', () => {
  it('sorts candidates by probability', () => {
    expect(candidates(table, 'start').map((c) => c.token)).toEqual([' report', ' cat'])
    expect(candidates(table, 'nope')).toEqual([])
  })

  it('follows the greedy path', () => {
    expect(greedyPicks(table, 'start')).toEqual([' report', ' is due.'])
    const r = runPicks(table, 'start', 'The', greedyPicks(table, 'start'))
    expect(r.text).toBe('The report is due.')
    expect(r.finished).toBe(true)
    expect(r.likelihoodVsGreedy).toBe(100)
    expect(r.steps.every((s) => s.greedy)).toBe(true)
  })

  it('scores a less likely path lower', () => {
    const r = runPicks(table, 'start', 'The', [' cat', ' sat.'])
    expect(r.text).toBe('The cat sat.')
    expect(r.likelihoodVsGreedy).toBeLessThan(100)
    expect(r.steps[0]?.greedy).toBe(false)
  })

  it('stops at an invalid pick and is deterministic', () => {
    const r = runPicks(table, 'start', 'The', [' report', ' banana'])
    expect(r.steps).toHaveLength(1)
    expect(r.finished).toBe(false)
    expect(runPicks(table, 'start', 'The', [' cat'])).toEqual(runPicks(table, 'start', 'The', [' cat']))
  })
})
