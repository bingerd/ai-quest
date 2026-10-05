import { describe, expect, it } from 'vitest'
import type { ChallengeDefinition } from '../../../engine/types'
import { validateTrainingData } from '../../testing/validateTrainingData'
import { workshopBuildersTraining } from '../training'
import { assistantOrAgentChallenge, sdlcChallenge, skillSortChallenge, teamSetupChallenge } from './definitions'

const challenges: [string, ChallengeDefinition][] = [
  ['Assistant or agent', assistantOrAgentChallenge],
  ['SDLC week', sdlcChallenge],
  ['Skill sort', skillSortChallenge],
  ['Team setup', teamSetupChallenge],
]

const garbage: unknown[] = [undefined, null, 42, 'text', [], {}, { choices: null }, { placements: 'x' }, { checks: 7 }]

describe.each(challenges)('%s definition', (_name, challenge) => {
  it.each(garbage.map((g) => [JSON.stringify(g) ?? 'undefined', g]))('handles malformed answer %s', (_label, answer) => {
    const r = challenge.evaluate(answer)
    expect(Number.isFinite(r.score)).toBe(true)
    expect(r.passed).toBe(false)
  })
})

describe('Workshop part 2', () => {
  it('is internally consistent', () => {
    expect(validateTrainingData(workshopBuildersTraining)).toEqual([])
  })

  const good = {
    choices: { shape: 'assistant', method: 'spec', review: 'human' },
    checks: { repo: ['claude-md', 'skills', 'deny'], community: ['read', 'pilot', 'measure'] },
  }

  it('passes a sound team setup', () => {
    expect(teamSetupChallenge.evaluate(good).passed).toBe(true)
  })

  it('caps the setup for a committed secret, an unattended agent or tests-only review', () => {
    expect(teamSetupChallenge.evaluate({ ...good, checks: { ...good.checks, repo: [...good.checks.repo, 'api-key'] } }).score).toBeLessThanOrEqual(30)
    expect(teamSetupChallenge.evaluate({ ...good, choices: { ...good.choices, shape: 'agent' } }).score).toBeLessThanOrEqual(60)
    expect(teamSetupChallenge.evaluate({ ...good, choices: { ...good.choices, review: 'tests' } }).score).toBeLessThanOrEqual(60)
  })

  it('separates community skills from Anthropic-provided ones', () => {
    const placements = { pptx: 'anthropic', xlsx: 'anthropic', proposal: 'custom', 'repo-skill': 'custom', superpowers: 'community', caveman: 'community', ponytail: 'community', speckit: 'community', 'claude-md': 'not-skill', hook: 'not-skill' }
    expect(skillSortChallenge.evaluate({ placements }).score).toBe(100)
    expect(skillSortChallenge.evaluate({ placements: { ...placements, superpowers: 'anthropic', caveman: 'anthropic', ponytail: 'anthropic', speckit: 'anthropic' } }).passed).toBe(false)
  })
})
