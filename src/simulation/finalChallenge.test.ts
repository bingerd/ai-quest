import { describe, expect, it } from 'vitest'
import { simulateFinalChallenge, type FinalScenario } from './finalChallenge'

const scenario: FinalScenario = {
  id: 'final',
  task: 'Analyse a customer issue',
  framing: '',
  tokenLimit: 12_000,
  modelIds: ['heron', 'albatross'],
  complexity: 0.6,
  idealOutputTokens: 600,
  retrievalKeepShare: 0.3,
  retrievalLatencySeconds: 0.5,
  items: [
    { id: 'ticket', label: 'Ticket', tokens: 1_500, relevance: 1, required: true },
    { id: 'contract', label: 'Contract', tokens: 6_000, relevance: 0.9 },
    { id: 'policy', label: 'Policy', tokens: 3_000, relevance: 0.8 },
    { id: 'faq', label: 'FAQ', tokens: 2_500, relevance: 0.3 },
    { id: 'roadmap', label: 'Roadmap', tokens: 5_000, relevance: 0.05 },
    { id: 'history', label: 'History', tokens: 2_000, relevance: 0.05 },
    { id: 'prev', label: 'Previous chat', tokens: 3_000, relevance: 0.5 },
    { id: 'project', label: 'Project context', tokens: 1_000, relevance: 0.6 },
  ],
  tools: [
    { id: 'crm', label: 'CRM lookup', description: 'Fetch the account record.', resultTokens: 800, latencySeconds: 0.6, costPerCall: 0.002, relevance: 0.9, required: true },
    { id: 'web', label: 'Web search', description: 'Search the public web.', resultTokens: 4_000, latencySeconds: 2.5, costPerCall: 0.01, relevance: 0.1 },
    { id: 'calc', label: 'Calculator', description: 'Arithmetic.', resultTokens: 50, latencySeconds: 0.1, costPerCall: 0, relevance: 0.2 },
  ],
}

const good = { modelId: 'heron', selectedIds: ['ticket', 'contract', 'policy', 'prev', 'project'], useRetrieval: true, toolIds: ['crm'], outputTokens: 600 }

describe('simulateFinalChallenge', () => {
  it('scores the ideal workflow very highly', () => {
    const r = simulateFinalChallenge(scenario, good)
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.passed).toBe(true)
    expect(r.feedback[0]?.tone).toBe('positive')
  })
  it('caps the score when tools and documents blow the budget', () => {
    const r = simulateFinalChallenge(scenario, { ...good, useRetrieval: false, selectedIds: scenario.items.map((i) => i.id), toolIds: ['crm', 'web'] })
    expect(r.metrics['overBudget']).toBeGreaterThan(0)
    expect(r.score).toBeLessThanOrEqual(50)
    expect(r.feedback[0]?.title).toContain('exceed')
  })
  it('flags a missing required tool and a useless one', () => {
    const r = simulateFinalChallenge(scenario, { ...good, toolIds: ['web'] })
    expect(r.feedback.some((f) => f.title === 'CRM lookup was needed')).toBe(true)
    expect(r.feedback.some((f) => f.title.includes('Web search') && f.title.includes('added nothing'))).toBe(true)
    expect(r.breakdown.find((d) => d.id === 'coverage')?.score).toBeLessThan(60)
  })
  it('penalises a starved output budget', () => {
    const r = simulateFinalChallenge(scenario, { ...good, outputTokens: 100 })
    expect(r.breakdown.find((d) => d.id === 'output')?.score).toBeLessThan(50)
    expect(r.feedback.some((f) => f.title.includes('cut short'))).toBe(true)
  })
  it('nudges when the premium model is unnecessary', () => {
    const r = simulateFinalChallenge(scenario, { ...good, modelId: 'albatross' })
    expect(r.feedback.some((f) => f.title.startsWith('Heron would have handled'))).toBe(true)
    expect(r.breakdown.find((d) => d.id === 'cost')?.score).toBeLessThan(80)
    expect(r.passed).toBe(true)
  })
  it('falls back to an allowed model for unknown ids and ignores unknown tools', () => {
    const r = simulateFinalChallenge(scenario, { ...good, modelId: 'nope', toolIds: ['crm', 'ghost'] })
    expect(r.score).toBeGreaterThanOrEqual(90)
  })
  it('is deterministic', () => {
    expect(simulateFinalChallenge(scenario, good)).toEqual(simulateFinalChallenge(scenario, good))
  })
})
