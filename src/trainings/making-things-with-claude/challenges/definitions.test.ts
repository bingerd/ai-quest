import { describe, expect, it } from 'vitest'
import type { ChallengeDefinition } from '../../../engine/types'
import { validateTrainingData } from '../../testing/validateTrainingData'
import { claimItems, titleItems } from '../data/sorting'
import { makingThingsTraining } from '../training'
import { actionTitlesChallenge, designRunChallenge, factCheckChallenge, qbrPackChallenge } from './definitions'

const challenges: [string, ChallengeDefinition][] = [
  ['Action titles', actionTitlesChallenge],
  ['A week on the deck', designRunChallenge],
  ['The fact-check pass', factCheckChallenge],
  ['The QBR pack', qbrPackChallenge],
]

const garbage: unknown[] = [undefined, null, 42, 'text', [], {}, { choices: null }, { placements: 'x' }, { checks: 'nope' }, { choices: 3, checks: [] }]

describe.each(challenges)('%s definition', (_name, challenge) => {
  it.each(garbage.map((g) => [JSON.stringify(g) ?? 'undefined', g]))('handles malformed answer %s', (_label, answer) => {
    const r = challenge.evaluate(answer)
    expect(Number.isFinite(r.score)).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.passed).toBe(false)
  })
})

const placeAll = (items: { id: string; correctBucket: string }[]) => Object.fromEntries(items.map((i) => [i.id, i.correctBucket]))

describe('Action titles', () => {
  it('passes a correct sort and fails one where everything is called an action title', () => {
    expect(actionTitlesChallenge.evaluate({ placements: placeAll(titleItems) }).score).toBe(100)
    const lazy = actionTitlesChallenge.evaluate({ placements: Object.fromEntries(titleItems.map((i) => [i.id, 'action'])) })
    expect(lazy.passed).toBe(false)
  })
})

describe('The fact-check pass', () => {
  it('passes a correct triage', () => {
    const r = factCheckChallenge.evaluate({ placements: placeAll(claimItems) })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
  })

  it('fails an answer that would publish personal data', () => {
    const reckless = factCheckChallenge.evaluate({ placements: Object.fromEntries(claimItems.map((i) => [i.id, 'publish'])) })
    expect(reckless.passed).toBe(false)
  })
})

const idealPack = {
  choices: { storyline: 'titles', surface: 'addin', changes: 'batched' },
  checks: { sources: ['finance', 'lastqbr', 'template'], before: ['recompute', 'read', 'brand'] },
}

describe('The QBR pack', () => {
  it('passes the ideal setup with a high score', () => {
    const r = qbrPackChallenge.evaluate(idealPack)
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.passed).toBe(true)
  })

  it('caps the score when personal data goes into the project, however good the rest is', () => {
    for (const leak of ['salaries', 'customers']) {
      const r = qbrPackChallenge.evaluate({ ...idealPack, checks: { ...idealPack.checks, sources: [...idealPack.checks.sources, leak] } })
      expect(r.score, leak).toBeLessThanOrEqual(40)
      expect(r.passed, leak).toBe(false)
    }
  })

  it('caps the score when the numbers are never independently recomputed', () => {
    const r = qbrPackChallenge.evaluate({ ...idealPack, checks: { ...idealPack.checks, before: ['read', 'brand'] } })
    expect(r.score).toBeLessThanOrEqual(55)
    expect(r.passed).toBe(false)
  })

  it('does not accept asking Claude to check its own numbers as verification', () => {
    const selfCheck = qbrPackChallenge.evaluate({ ...idealPack, checks: { ...idealPack.checks, before: [...idealPack.checks.before, 'askclaude'] } })
    expect(selfCheck.score).toBeLessThan(qbrPackChallenge.evaluate(idealPack).score)
  })

  it('caps a pack that was polished before the argument was agreed', () => {
    const r = qbrPackChallenge.evaluate({ ...idealPack, choices: { ...idealPack.choices, storyline: 'polished' } })
    expect(r.score).toBeLessThanOrEqual(60)
  })

  it('is deterministic', () => {
    expect(qbrPackChallenge.evaluate(idealPack)).toEqual(qbrPackChallenge.evaluate(idealPack))
  })
})

describe('the training itself', () => {
  it('is internally consistent', () => {
    expect(validateTrainingData(makingThingsTraining)).toEqual([])
  })
})
