import { describe, expect, it } from 'vitest'
import type { ChallengeDefinition } from '../../../engine/types'
import { validateTrainingData } from '../../testing/validateTrainingData'
import { suggestTrack } from '../data/audience'
import { workshopAtWorkTraining } from '../training'
import { contextRoundsChallenge, contextSortChallenge, designSystemChallenge, policyChallenge, workflowChallenge } from './definitions'

const challenges: [string, ChallengeDefinition][] = [
  ['Policy calls', policyChallenge],
  ['Where does it go?', contextSortChallenge],
  ['Four rounds', contextRoundsChallenge],
  ['Design system', designSystemChallenge],
  ['Workflows', workflowChallenge],
]

const garbage: unknown[] = [undefined, null, 42, 'text', [], {}, { choices: null }, { placements: 'x' }, { checks: 7 }]

describe.each(challenges)('%s definition', (_name, challenge) => {
  it.each(garbage.map((g) => [JSON.stringify(g) ?? 'undefined', g]))('handles malformed answer %s', (_label, answer) => {
    const r = challenge.evaluate(answer)
    expect(Number.isFinite(r.score)).toBe(true)
    expect(r.passed).toBe(false)
  })
})

describe('Workshop part 1', () => {
  it('is internally consistent', () => {
    expect(validateTrainingData(workshopAtWorkTraining)).toEqual([])
  })

  it('passes the best rounds and fails sharing the client project', () => {
    const best = { 'round-1': 'brief', 'round-2': 'set-up', 'round-3': 'design-system', 'round-4': 'skill' }
    expect(contextRoundsChallenge.evaluate({ choices: best }).passed).toBe(true)
    expect(contextRoundsChallenge.evaluate({ choices: { ...best, 'round-2': 'everything', 'round-4': 'share-project', 'round-1': 'dump' } }).passed).toBe(false)
  })

  it('caps the design setup when client data goes into the source or nobody reviews', () => {
    const good = { choices: { home: 'org', iterate: 'comment', review: 'human' }, checks: { source: ['logos', 'palette', 'type', 'good-examples'] } }
    expect(designSystemChallenge.evaluate(good).passed).toBe(true)
    expect(designSystemChallenge.evaluate({ ...good, checks: { source: [...good.checks.source, 'client-deck'] } }).score).toBeLessThanOrEqual(50)
    expect(designSystemChallenge.evaluate({ ...good, choices: { ...good.choices, review: 'trust' } }).passed).toBe(false)
  })

  it('suggests a track from the audience answers', () => {
    expect(suggestTrack({}).id).toBe('non-technical')
    expect(suggestTrack({ role: 'code', usage: 'daily', projects: 'yes', agents: 'built' }).id).toBe('technical')
    expect(suggestTrack({ role: 'mixed', usage: 'weekly', projects: 'once' }).id).toBe('mixed')
  })
})
