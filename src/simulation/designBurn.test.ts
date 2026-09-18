import { describe, expect, it } from 'vitest'
import { simulateDesignBurn, type DesignBurnInput } from './designBurn'

const WORST: DesignBurnInput = { slides: 20, fidelity: 'polished', changeStyle: 'one-at-a-time', designSystem: false, reviewRounds: 3 }
const BEST: DesignBurnInput = { slides: 20, fidelity: 'outline', changeStyle: 'batched', designSystem: true, reviewRounds: 3 }

describe('simulateDesignBurn', () => {
  it('treats the polished, drip-fed, no-design-system run as the baseline', () => {
    const r = simulateDesignBurn(WORST)
    expect(r.total).toBe(r.baseline)
    expect(r.savedPercent).toBe(0)
  })

  it('rewards structure first, batched changes and a design system already in place', () => {
    const r = simulateDesignBurn(BEST)
    expect(r.total).toBeLessThan(r.baseline)
    expect(r.savedPercent).toBeGreaterThan(60)
  })

  it('makes each of the three habits pay on its own', () => {
    const base = simulateDesignBurn(WORST).total
    expect(simulateDesignBurn({ ...WORST, changeStyle: 'batched' }).total).toBeLessThan(base)
    expect(simulateDesignBurn({ ...WORST, designSystem: true }).total).toBeLessThan(base)
    expect(simulateDesignBurn({ ...WORST, fidelity: 'outline' }).total).toBeLessThan(base)
  })

  it('still charges for polish that was deferred rather than skipped', () => {
    const outline = simulateDesignBurn({ ...BEST, reviewRounds: 0 })
    expect(outline.parts.find((p) => p.id === 'polish')?.tokens).toBeGreaterThan(0)
  })

  it('scales with scope and with the number of review rounds', () => {
    const small = simulateDesignBurn({ ...BEST, slides: 5 })
    const large = simulateDesignBurn({ ...BEST, slides: 40 })
    expect(large.total).toBeGreaterThan(small.total)
    expect(simulateDesignBurn({ ...BEST, reviewRounds: 8 }).total).toBeGreaterThan(simulateDesignBurn({ ...BEST, reviewRounds: 1 }).total)
  })

  it('counts three turns of drip-feeding for every batched round', () => {
    expect(simulateDesignBurn({ ...BEST, changeStyle: 'one-at-a-time', reviewRounds: 2 }).effectiveRounds).toBe(6)
    expect(simulateDesignBurn({ ...BEST, reviewRounds: 2 }).effectiveRounds).toBe(2)
  })

  it('handles zero and negative input without throwing or dividing by zero', () => {
    const zero = simulateDesignBurn({ ...BEST, slides: 0, reviewRounds: 0 })
    expect(zero.total).toBe(0)
    expect(zero.baseline).toBe(0)
    expect(zero.savedPercent).toBe(0)
    expect(zero.parts).toEqual([])
    expect(() => simulateDesignBurn({ ...BEST, slides: -5, reviewRounds: -2 })).not.toThrow()
    expect(simulateDesignBurn({ ...BEST, slides: -5, reviewRounds: -2 }).total).toBe(0)
  })

  it('never reports a negative saving', () => {
    expect(simulateDesignBurn({ ...WORST, reviewRounds: 0, slides: 1 }).savedPercent).toBeGreaterThanOrEqual(0)
  })

  // The Burn Meter lesson gates Continue at 60%. If any reachable slider position
  // made that unreachable, a learner doing everything right would be stuck.
  it('lets the three good habits clear 60% at every slider position the lesson offers', () => {
    for (let slides = 5; slides <= 40; slides += 1) {
      for (let reviewRounds = 1; reviewRounds <= 8; reviewRounds += 1) {
        const best = simulateDesignBurn({ slides, reviewRounds, fidelity: 'outline', changeStyle: 'batched', designSystem: true })
        expect(best.savedPercent, `slides=${slides} rounds=${reviewRounds}`).toBeGreaterThanOrEqual(60)
      }
    }
  })

  it('keeps the wasteful defaults below the gate, so the lesson has something to teach', () => {
    const defaults = simulateDesignBurn({ slides: 20, reviewRounds: 3, fidelity: 'polished', changeStyle: 'one-at-a-time', designSystem: false })
    expect(defaults.savedPercent).toBeLessThan(60)
  })

  it('is deterministic', () => {
    expect(simulateDesignBurn(BEST)).toEqual(simulateDesignBurn(BEST))
    expect(simulateDesignBurn(WORST)).toEqual(simulateDesignBurn(WORST))
  })
})
