import { describe, expect, it } from 'vitest'
import { simulateEvalSuite, type FailureMode } from './evals'

const modes: FailureMode[] = [
  { id: 'format', label: 'JSON sometimes wrapped in prose', surfacedBy: 'happy', frequency: 0.2, detectableBy: ['code', 'llm', 'human'], critical: true, consequence: 'The parser throws in production.' },
  { id: 'rare-currency', label: 'Wrong currency for one locale', surfacedBy: 'edge', frequency: 0.02, detectableBy: ['code', 'llm', 'human'], critical: true, consequence: 'Customers are charged in the wrong currency.' },
  { id: 'tone', label: 'Answers became curt', surfacedBy: 'happy', frequency: 0.5, detectableBy: ['llm', 'human'], critical: false, consequence: 'Support tone drifts.' },
  { id: 'injection', label: 'Follows instructions inside customer text', surfacedBy: 'adversarial', frequency: 0.3, detectableBy: ['code', 'llm', 'human'], critical: true, consequence: 'A customer can steer the agent.' },
]

const base = { failureModes: modes, caseTypes: ['happy', 'edge', 'adversarial', 'regression'] as const, sampleSize: 'large' as const, grader: 'llm' as const }

describe('simulateEvalSuite', () => {
  it('catches everything with broad coverage, enough cases and a capable grader', () => {
    const r = simulateEvalSuite({ ...base, caseTypes: [...base.caseTypes] })
    expect(r.missed).toHaveLength(0)
    expect(r.passed).toBe(true)
  })
  it('misses rare failures when the sample is small', () => {
    const r = simulateEvalSuite({ ...base, caseTypes: [...base.caseTypes], sampleSize: 'small' })
    expect(r.missed.map((m) => m.id)).toContain('rare-currency')
    expect(r.feedback[0]?.body).toContain('unlikely to include one')
    expect(r.passed).toBe(false)
  })
  it('misses what the case types do not cover', () => {
    const r = simulateEvalSuite({ ...base, caseTypes: ['happy'] })
    expect(r.missed.map((m) => m.id)).toEqual(expect.arrayContaining(['rare-currency', 'injection']))
    expect(r.score).toBeLessThanOrEqual(55)
  })
  it('code grading cannot see tone, human grading is too slow to run often', () => {
    const code = simulateEvalSuite({ ...base, caseTypes: [...base.caseTypes], grader: 'code' })
    expect(code.missed.map((m) => m.id)).toEqual(['tone'])
    expect(code.breakdown.find((d) => d.id === 'practicality')?.score).toBe(100)
    const human = simulateEvalSuite({ ...base, caseTypes: [...base.caseTypes], grader: 'human' })
    expect(human.breakdown.find((d) => d.id === 'practicality')?.score).toBeLessThan(40)
    expect(human.metrics['cost']).toBeGreaterThan(1000)
  })
  it('is deterministic and handles an empty suite', () => {
    const a = { ...base, caseTypes: [...base.caseTypes] }
    expect(simulateEvalSuite(a)).toEqual(simulateEvalSuite(a))
    expect(simulateEvalSuite({ ...a, failureModes: [], caseTypes: [] }).score).toBeGreaterThan(0)
  })
})
