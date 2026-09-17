import { describe, expect, it } from 'vitest'
import type { ChallengeDefinition } from '../../../engine/types'
import { contextSurgeonChallenge, tokenHeistChallenge } from './contextChallenges'
import { enterpriseChallenge } from './enterpriseDefinition'
import { finalChallenge } from './finalDefinition'
import { modelSelectionChallenge } from './modelSelectionDefinition'
import { promptSurgeryChallenge } from './promptSurgeryDefinition'

const challenges: [string, ChallengeDefinition][] = [
  ['Context Surgeon', contextSurgeonChallenge],
  ['Token Heist', tokenHeistChallenge],
  ['Prompt Surgery', promptSurgeryChallenge],
  ['Model Selection', modelSelectionChallenge],
  ['Enterprise Scenario', enterpriseChallenge],
  ['Final Challenge', finalChallenge],
]

const garbage: unknown[] = [undefined, null, 42, 'text', [], {}, { selectedIds: 'nope' }, { choices: null }, { text: 7 }, { modelId: 3, toolIds: {} }]

describe.each(challenges)('%s definition', (_name, challenge) => {
  it.each(garbage.map((g) => [JSON.stringify(g) ?? 'undefined', g]))('handles malformed answer %s without throwing', (_label, answer) => {
    const r = challenge.evaluate(answer)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(Number.isFinite(r.score)).toBe(true)
    expect(Array.isArray(r.breakdown)).toBe(true)
    expect(Array.isArray(r.feedback)).toBe(true)
  })

  it('is deterministic for the same answer', () => {
    expect(challenge.evaluate({})).toEqual(challenge.evaluate({}))
  })
})

describe('challenge outcomes', () => {
  it('Context Surgeon: removing only the noise passes, removing the required contract fails', () => {
    const lean = contextSurgeonChallenge.evaluate({ selectedIds: ['refund', 'contract', 'tickets', 'pricing', 'macros'] })
    const noContract = contextSurgeonChallenge.evaluate({ selectedIds: ['refund', 'tickets', 'pricing', 'macros'] })
    const untouched = contextSurgeonChallenge.evaluate({ selectedIds: ['refund', 'contract', 'tickets', 'pricing', 'macros', 'roadmap', 'hrpolicy', 'history', 'ceo', 'brochure', 'allhands'] })
    expect(lean.passed).toBe(true)
    expect(noContract.passed).toBe(false)
    expect(untouched.passed).toBe(false)
  })

  it('Token Heist: selecting everything is over budget; nothing fails', () => {
    const all = tokenHeistChallenge.evaluate({ selectedIds: ['sales', 'regional', 'customers', 'prev', 'faq', 'history', 'ceo', 'hr'] })
    expect(all.score).toBeLessThanOrEqual(55)
    expect(tokenHeistChallenge.evaluate({ selectedIds: [] }).passed).toBe(false)
    expect(tokenHeistChallenge.evaluate({ selectedIds: ['sales', 'regional', 'customers', 'prev'] }).score).toBeGreaterThanOrEqual(90)
  })

  it('Model Selection: best fits score higher than one-size-fits-all choices', () => {
    const fits = modelSelectionChallenge.evaluate({ choices: { tickets: 'sparrow', contracts: 'albatross', 'hr-assistant': 'heron' } })
    const allPremium = modelSelectionChallenge.evaluate({ choices: { tickets: 'albatross', contracts: 'albatross', 'hr-assistant': 'albatross' } })
    const allCheap = modelSelectionChallenge.evaluate({ choices: { tickets: 'sparrow', contracts: 'sparrow', 'hr-assistant': 'sparrow' } })
    expect(fits.score).toBeGreaterThan(allPremium.score)
    expect(fits.score).toBeGreaterThan(allCheap.score)
    expect(fits.passed).toBe(true)
  })

  it('Enterprise Scenario: best decisions pass, worst decisions fail', () => {
    const best = enterpriseChallenge.evaluate({ choices: { 'database-paste': 'guide', 'expensive-classifier': 'tiers', 'repeated-documents': 'project-context', 'agent-tools': 'least-privilege' } })
    const worst = enterpriseChallenge.evaluate({ choices: { 'database-paste': 'ignore', 'expensive-classifier': 'leave', 'repeated-documents': 'bigger', 'agent-tools': 'more-capable' } })
    expect(best.score).toBeGreaterThanOrEqual(90)
    expect(worst.passed).toBe(false)
  })
})
