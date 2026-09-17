import { describe, expect, it } from 'vitest'
import { expectedQuality, getModel, MODELS, requestCost, requestLatency } from './models'

describe('models', () => {
  it('has unique ids and sane ordering of cost', () => {
    expect(new Set(MODELS.map((m) => m.id)).size).toBe(MODELS.length)
    expect(getModel('sparrow').inputCostPerMillion).toBeLessThan(getModel('albatross').inputCostPerMillion)
    expect(() => getModel('nope')).toThrow()
  })
  it('computes cost and latency linearly', () => {
    const m = getModel('heron')
    expect(requestCost(m, 1_000_000, 0)).toBeCloseTo(2.5)
    expect(requestCost(m, 0, 1_000_000)).toBeCloseTo(10)
    expect(requestLatency(m, 1000, 1000)).toBeCloseTo(0.8 + 0.12 + 1.4)
  })
  it('quality drops steeply when a model is below the task complexity', () => {
    const sparrow = getModel('sparrow')
    expect(expectedQuality(sparrow, 0.2)).toBeGreaterThan(0.9)
    expect(expectedQuality(sparrow, 0.8)).toBeLessThan(0.5)
    expect(expectedQuality(getModel('albatross'), 0.8)).toBeGreaterThan(0.9)
  })
})
