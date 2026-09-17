import { describe, expect, it } from 'vitest'
import { evaluateScenario, type Scenario } from './scenario'

const scenario: Scenario = {
  id: 's',
  title: 'Test',
  intro: '',
  dimensions: [
    { id: 'cost', label: 'Cost', weight: 2 },
    { id: 'security', label: 'Security' },
  ],
  decisions: [
    {
      id: 'd1',
      title: 'Decision one',
      situation: '',
      question: '',
      options: [
        { id: 'good', label: 'Good', outcome: { score: 90, consequence: 'Nice.', dimensions: ['cost', 'security'] } },
        { id: 'bad', label: 'Bad', outcome: { score: 20, consequence: 'Ouch.', dimensions: ['security'] } },
      ],
    },
    {
      id: 'd2',
      title: 'Decision two',
      situation: '',
      question: '',
      options: [{ id: 'ok', label: 'OK', outcome: { score: 60, consequence: 'Fine.', dimensions: ['cost'] } }],
    },
  ],
}

describe('evaluateScenario', () => {
  it('averages per dimension and weights the total', () => {
    const r = evaluateScenario(scenario, { d1: 'good', d2: 'ok' })
    expect(r.breakdown).toEqual([
      { id: 'cost', label: 'Cost', score: 75, weight: 2 },
      { id: 'security', label: 'Security', score: 90 },
    ])
    expect(r.score).toBe(80)
    expect(r.passed).toBe(true)
    expect(r.feedback[0]?.tone).toBe('positive')
    expect(r.steps.map((s) => s.consequence)).toEqual(['Nice.', 'Fine.'])
  })
  it('penalises missing or unknown choices', () => {
    const r = evaluateScenario(scenario, { d1: 'nope' })
    expect(r.steps[0]?.optionId).toBeNull()
    expect(r.steps[1]?.optionId).toBeNull()
    expect(r.score).toBe(0)
    expect(r.summary).toContain('0 of 2')
  })
  it('flags bad decisions with warnings', () => {
    const r = evaluateScenario(scenario, { d1: 'bad', d2: 'ok' })
    expect(r.feedback[0]?.tone).toBe('warning')
    expect(r.breakdown.find((d) => d.id === 'security')?.score).toBe(20)
  })
  it('is deterministic', () => {
    expect(evaluateScenario(scenario, { d1: 'good', d2: 'ok' })).toEqual(evaluateScenario(scenario, { d1: 'good', d2: 'ok' }))
  })
})
