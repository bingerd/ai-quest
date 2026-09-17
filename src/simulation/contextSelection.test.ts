import { describe, expect, it } from 'vitest'
import { idealSelection, simulateContextSelection, type ContextItemSpec } from './contextSelection'

const items: ContextItemSpec[] = [
  { id: 'sales', label: 'Q3 Sales Report', tokens: 2800, relevance: 1, required: true },
  { id: 'customers', label: 'Customer Data', tokens: 4200, relevance: 0.8 },
  { id: 'hr', label: 'HR Handbook', tokens: 8100, relevance: 0.05 },
  { id: 'history', label: 'Company History', tokens: 1900, relevance: 0.1 },
  { id: 'faq', label: 'Customer FAQ', tokens: 3100, relevance: 0.3 },
  { id: 'ceo', label: 'CEO Biography', tokens: 1200, relevance: 0.05 },
  { id: 'prev', label: 'Previous Conversation', tokens: 3400, relevance: 0.6 },
]

const base = { items, tokenLimit: 12_000, modelId: 'heron' as const }

describe('idealSelection', () => {
  it('picks required and useful items within budget', () => {
    expect(idealSelection(items, 12_000)).toEqual(['sales', 'customers', 'prev'])
  })
  it('always includes required items even over budget', () => {
    expect(idealSelection(items, 1000)).toEqual(['sales'])
  })
})

describe('simulateContextSelection', () => {
  it('scores the ideal selection very highly', () => {
    const r = simulateContextSelection({ ...base, selectedIds: ['sales', 'customers', 'prev'] })
    expect(r.score).toBeGreaterThanOrEqual(95)
    expect(r.passed).toBe(true)
    expect(r.metrics.overBudget).toBe(0)
    expect(r.feedback[0]?.tone).toBe('positive')
  })

  it('punishes an empty selection with low completeness and clear feedback', () => {
    const r = simulateContextSelection({ ...base, selectedIds: [] })
    expect(r.metrics.completeness).toBeLessThanOrEqual(40)
    expect(r.score).toBeLessThan(60)
    expect(r.feedback.some((f) => f.title.includes('Q3 Sales Report was essential'))).toBe(true)
  })

  it('caps the score and names the overage when over budget', () => {
    const r = simulateContextSelection({ ...base, selectedIds: items.map((i) => i.id) })
    expect(r.metrics.tokensUsed).toBe(24_700)
    expect(r.metrics.overBudget).toBe(12_700)
    expect(r.score).toBeLessThanOrEqual(55)
    expect(r.feedback[0]?.title).toContain('12,700 tokens')
  })

  it('flags irrelevant items by name and sums the waste', () => {
    const r = simulateContextSelection({ ...base, selectedIds: ['sales', 'customers', 'hr'] })
    const noise = r.feedback.find((f) => f.title.includes('unnecessary'))
    expect(noise?.title).toContain('8,100 tokens')
    expect(noise?.body).toContain('HR Handbook')
    expect(r.metrics.relevance).toBeLessThan(50)
  })

  it('mentions a useful item that was left out', () => {
    const r = simulateContextSelection({ ...base, selectedIds: ['sales'] })
    expect(r.feedback.some((f) => f.title.startsWith('Customer Data would have helped'))).toBe(true)
    expect(r.metrics.completeness).toBeLessThan(60)
  })

  it('ignores unknown and duplicate ids', () => {
    const r = simulateContextSelection({ ...base, selectedIds: ['sales', 'sales', 'nope'] })
    expect(r.metrics.tokensUsed).toBe(2800)
  })

  it('handles zero-token items and a single item', () => {
    const r = simulateContextSelection({
      items: [{ id: 'a', label: 'A', tokens: 0, relevance: 1, required: true }],
      selectedIds: ['a'],
      tokenLimit: 100,
      modelId: 'sparrow',
    })
    expect(r.metrics.tokensUsed).toBe(0)
    expect(r.metrics.completeness).toBe(100)
    expect(r.score).toBeGreaterThan(50)
  })

  it('costs more on an expensive model for the same selection', () => {
    const cheap = simulateContextSelection({ ...base, modelId: 'sparrow', selectedIds: ['sales', 'customers'] })
    const pricey = simulateContextSelection({ ...base, modelId: 'albatross', selectedIds: ['sales', 'customers'] })
    expect(pricey.metrics.cost).toBeGreaterThan(cheap.metrics.cost)
    expect(pricey.metrics.latency).toBeGreaterThan(cheap.metrics.latency)
  })

  it('is deterministic', () => {
    const a = simulateContextSelection({ ...base, selectedIds: ['sales', 'faq', 'prev'] })
    const b = simulateContextSelection({ ...base, selectedIds: ['sales', 'faq', 'prev'] })
    expect(a).toEqual(b)
  })

  it('reveals relevance for every item', () => {
    const r = simulateContextSelection({ ...base, selectedIds: ['sales'] })
    expect(Object.keys(r.reveal)).toHaveLength(items.length)
    expect(r.reveal['hr']).toBe(0.05)
  })
})
