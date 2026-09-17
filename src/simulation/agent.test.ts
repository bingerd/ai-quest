import { describe, expect, it } from 'vitest'
import { parseToolIds, simulateAgentRun, type AgentTaskSpec } from './agent'

const spec: AgentTaskSpec = {
  task: 'Answer a billing question',
  contextLimit: 30_000,
  baseContextTokens: 5_000,
  forbiddenRisks: ['dangerous'],
  steps: [
    { id: 'lookup', label: 'Find the account', needs: 'billing', required: true },
    { id: 'history', label: 'Read past tickets', needs: 'tickets', required: false },
  ],
  tools: [
    { id: 'billing', label: 'Billing lookup', capability: 'billing', description: 'Fetch invoices for an account.', resultTokens: 800, latencySeconds: 0.6, costPerCall: 0.002, risk: 'read' },
    { id: 'billing-vague', label: 'Data service', capability: 'billing', description: 'Gets data.', vague: true, resultTokens: 900, latencySeconds: 0.7, costPerCall: 0.003, risk: 'read' },
    { id: 'tickets', label: 'Ticket search', capability: 'tickets', description: 'Search past tickets.', resultTokens: 1_200, latencySeconds: 0.8, costPerCall: 0.002, risk: 'read' },
    { id: 'web', label: 'Web search', capability: 'web', description: 'Search the web.', resultTokens: 6_000, latencySeconds: 2.5, costPerCall: 0.01, risk: 'read' },
    { id: 'refund', label: 'Issue refund', capability: 'refund', description: 'Refunds money.', resultTokens: 200, latencySeconds: 1, costPerCall: 0, risk: 'dangerous', riskNote: 'It can move money without a human.' },
  ],
}

describe('simulateAgentRun', () => {
  it('scores a minimal, complete toolbox highly', () => {
    const r = simulateAgentRun(spec, ['billing', 'tickets'])
    expect(r.completed).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(85)
    expect(r.feedback[0]?.tone).toBe('positive')
    expect(r.metrics['contextTokens']).toBe(7_000)
  })
  it('caps the score when a dangerous tool is included', () => {
    const r = simulateAgentRun(spec, ['billing', 'tickets', 'refund'])
    expect(r.score).toBeLessThanOrEqual(40)
    expect(r.feedback[0]?.title).toContain('Issue refund')
  })
  it('fails when a required capability is missing', () => {
    const r = simulateAgentRun(spec, ['tickets'])
    expect(r.completed).toBe(false)
    expect(r.score).toBeLessThanOrEqual(45)
    expect(r.feedback.some((f) => f.title.includes('Find the account'))).toBe(true)
  })
  it('charges an extra call for a vague description and flags unused tools', () => {
    const r = simulateAgentRun(spec, ['billing-vague', 'tickets', 'web'])
    expect(r.metrics['wrongCalls']).toBe(1)
    expect(r.feedback.some((f) => f.title.includes('vague tool description'))).toBe(true)
    expect(r.feedback.some((f) => f.title.includes('Web search') && f.title.includes('never used'))).toBe(true)
  })
  it('flags context overflow and parses malformed answers, deterministically', () => {
    const big: AgentTaskSpec = { ...spec, contextLimit: 6_000 }
    expect(simulateAgentRun(big, ['billing', 'tickets']).feedback.some((f) => f.title.includes('overflowed'))).toBe(true)
    expect(parseToolIds({ toolIds: ['a', 2] })).toEqual(['a'])
    expect(parseToolIds(null)).toEqual([])
    expect(simulateAgentRun(spec, ['billing', 'tickets'])).toEqual(simulateAgentRun(spec, ['billing', 'tickets']))
  })
})
