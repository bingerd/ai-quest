import { describe, expect, it } from 'vitest'
import { composeContext, fillPercent } from './contextWindow'

describe('composeContext', () => {
  it('sums segments and computes remaining', () => {
    const c = composeContext(
      [
        { id: 'system', label: 'System', tokens: 1000 },
        { id: 'documents', label: 'Docs', tokens: 5000 },
        { id: 'output', label: 'Output', tokens: 2000 },
      ],
      16000,
    )
    expect(c.used).toBe(8000)
    expect(c.remaining).toBe(8000)
    expect(c.overflow).toBe(0)
    expect(fillPercent(c)).toBe(50)
    expect(c.outputSqueezed).toBe(false)
  })
  it('reports overflow and squeezed output', () => {
    const c = composeContext(
      [
        { id: 'documents', label: 'Docs', tokens: 15000 },
        { id: 'output', label: 'Output', tokens: 2000 },
      ],
      16000,
    )
    expect(c.overflow).toBe(1000)
    expect(c.remaining).toBe(0)
    expect(fillPercent(c)).toBe(106)
    expect(c.outputSqueezed).toBe(true)
  })
  it('handles zero and negative inputs safely', () => {
    const c = composeContext([{ id: 'system', label: 'S', tokens: -5 }], 0)
    expect(c.used).toBe(0)
    expect(c.fill).toBe(0)
  })
})
