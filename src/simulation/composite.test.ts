import { describe, expect, it } from 'vitest'
import { parseCompositeAnswer, simulateComposite, type CompositeSpec } from './composite'

const spec: CompositeSpec = {
  passScore: 70,
  parts: [
    {
      kind: 'choice', id: 'model', label: 'Model', question: 'Pick', weight: 1,
      options: [
        { id: 'good', label: 'Good', score: 100, explanation: 'Right.' },
        { id: 'meh', label: 'Meh', score: 60, explanation: 'Okay.' },
        { id: 'bad', label: 'Bad', score: 0, explanation: 'Wrong.', cap: 30 },
      ],
    },
    {
      kind: 'checklist', id: 'md', label: 'CLAUDE.md', question: 'Include', weight: 1,
      items: [
        { id: 'cmds', label: 'Commands', shouldInclude: true, explanation: 'Needed.' },
        { id: 'secret', label: 'API key', shouldInclude: false, explanation: 'Never.', cap: 40 },
      ],
    },
  ],
}

describe('simulateComposite', () => {
  it('scores a perfect answer', () => {
    const r = simulateComposite(spec, { choices: { model: 'good' }, checks: { md: ['cmds'] } })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
    expect(r.narrative).toHaveLength(2)
  })
  it('applies caps from options and checklist items', () => {
    expect(simulateComposite(spec, { choices: { model: 'bad' }, checks: { md: ['cmds'] } }).score).toBe(30)
    const r = simulateComposite(spec, { choices: { model: 'good' }, checks: { md: ['cmds', 'secret'] } })
    expect(r.score).toBe(40)
    expect(r.feedback[0]?.title).toContain('should be left out')
  })
  it('averages partial choices and fails missing ones', () => {
    expect(simulateComposite(spec, { choices: { model: 'meh' }, checks: { md: ['cmds'] } }).score).toBe(80)
    const r = simulateComposite(spec, { choices: {}, checks: {} })
    expect(r.passed).toBe(false)
    expect(r.feedback[0]?.title).toContain('no choice')
  })
  it('parses malformed answers and is deterministic', () => {
    expect(parseCompositeAnswer(null)).toEqual({ choices: {}, checks: {} })
    expect(parseCompositeAnswer({ choices: { a: 1, b: 'x' }, checks: { c: ['y', 2], d: 'z' } })).toEqual({ choices: { b: 'x' }, checks: { c: ['y'] } })
    const a = { choices: { model: 'meh' }, checks: { md: ['secret'] } }
    expect(simulateComposite(spec, a)).toEqual(simulateComposite(spec, a))
  })
})
