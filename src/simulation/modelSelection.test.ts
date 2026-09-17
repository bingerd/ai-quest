import { describe, expect, it } from 'vitest'
import { bestModel, evaluateModel, simulateModelSelection, type ModelSelectionScenario } from './modelSelection'
import { getModel } from './models'

const tickets: ModelSelectionScenario = {
  id: 'tickets',
  title: 'Classify support tickets',
  description: '',
  requests: 50_000,
  avgInputTokens: 150,
  avgOutputTokens: 10,
  complexity: 0.3,
  budget: 20,
  maxLatencySeconds: 2,
  qualityTarget: 0.9,
}

const contracts: ModelSelectionScenario = {
  id: 'contracts',
  title: 'Summarise contracts',
  description: '',
  requests: 200,
  avgInputTokens: 60_000,
  avgOutputTokens: 1_500,
  complexity: 0.85,
  budget: 300,
  maxLatencySeconds: 120,
  qualityTarget: 0.9,
}

describe('evaluateModel', () => {
  it('computes batch cost and per-request latency', () => {
    const o = evaluateModel(tickets, getModel('sparrow'))
    expect(o.cost).toBeCloseTo(1.9, 2)
    expect(o.meetsBudget).toBe(true)
    expect(o.meetsQuality).toBe(true)
    expect(o.viable).toBe(true)
  })
  it('fails models whose context is too small', () => {
    const o = evaluateModel(contracts, getModel('sparrow'))
    expect(o.fitsContext).toBe(false)
    expect(o.viable).toBe(false)
  })
})

describe('bestModel', () => {
  it('prefers the cheapest viable model for simple bulk work', () => {
    expect(bestModel(tickets)?.modelId).toBe('sparrow')
  })
  it('requires the premium model for hard, long-context work', () => {
    expect(bestModel(contracts)?.modelId).toBe('albatross')
  })
  it('returns null when nothing fits', () => {
    expect(bestModel({ ...tickets, budget: 0.01 })).toBeNull()
  })
})

describe('simulateModelSelection', () => {
  it('scores the right fit highly with positive feedback', () => {
    const r = simulateModelSelection(tickets, 'sparrow')
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.feedback.some((f) => f.tone === 'positive')).toBe(true)
    expect(r.bestModelId).toBe('sparrow')
  })
  it('caps the score when the premium model blows the budget', () => {
    const r = simulateModelSelection(tickets, 'albatross')
    expect(r.outcome.meetsBudget).toBe(false)
    expect(r.score).toBeLessThanOrEqual(50)
    expect(r.feedback[0]?.title).toContain('exceeds')
  })
  it('caps the score when the cheap model misses the quality bar', () => {
    const r = simulateModelSelection(contracts, 'kestrel')
    expect(r.outcome.meetsQuality).toBe(false)
    expect(r.score).toBeLessThanOrEqual(50)
    expect(r.feedback.some((f) => f.title.includes('below the'))).toBe(true)
  })
  it('passes a viable but over-specified choice with a nudge', () => {
    const r = simulateModelSelection(tickets, 'kestrel')
    expect(r.outcome.viable).toBe(true)
    expect(r.passed).toBe(true)
    expect(r.score).toBeLessThan(90)
    expect(r.feedback.some((f) => f.title.includes('would also have met'))).toBe(true)
  })
  it('is deterministic and returns outcomes for all models', () => {
    const a = simulateModelSelection(contracts, 'albatross')
    const b = simulateModelSelection(contracts, 'albatross')
    expect(a).toEqual(b)
    expect(a.all).toHaveLength(4)
  })
})
