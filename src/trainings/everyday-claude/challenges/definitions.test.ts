import { describe, expect, it } from 'vitest'
import type { ChallengeDefinition } from '../../../engine/types'
import { validateTrainingData } from '../../testing/validateTrainingData'
import { everydayClaudeTraining } from '../training'
import { boardDeckChallenge, deckDoctorChallenge, mondayChallenge, whereDoesItGoChallenge } from './definitions'

const challenges: [string, ChallengeDefinition][] = [
  ['Deck Doctor', deckDoctorChallenge],
  ['Monday at the office', mondayChallenge],
  ['Where does it go?', whereDoesItGoChallenge],
  ['Client steering deck', boardDeckChallenge],
]

const garbage: unknown[] = [undefined, null, 42, 'text', [], {}, { choices: null }, { placements: 'x' }, { selectedIds: 'nope', briefChoices: 3 }, { workspace: 1, review: {} }]

describe.each(challenges)('%s definition', (_name, challenge) => {
  it.each(garbage.map((g) => [JSON.stringify(g) ?? 'undefined', g]))('handles malformed answer %s', (_label, answer) => {
    const r = challenge.evaluate(answer)
    expect(Number.isFinite(r.score)).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.passed).toBe(false)
  })
})

const bestBrief = { goal: 'decision', audience: 'leadership', length: 'tight', sources: 'attached', structure: 'story', format: 'pptx' }
const ideal = { workspace: 'project', selectedIds: ['report', 'targets', 'last-deck'], briefChoices: bestBrief, review: 'verify' }

describe('Client steering deck outcomes', () => {
  it('passes the ideal workflow with a high score', () => {
    const r = boardDeckChallenge.evaluate(ideal)
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.passed).toBe(true)
  })
  it('caps the score when the salary sheet is included', () => {
    const r = boardDeckChallenge.evaluate({ ...ideal, selectedIds: [...ideal.selectedIds, 'salaries'] })
    expect(r.score).toBeLessThanOrEqual(40)
    expect(r.feedback[0]?.title).toContain('Team rate card and salaries')
    expect(r.feedback.filter((f) => `${f.title} ${f.body}`.includes('Team rate card and salaries'))).toHaveLength(1)
    expect(r.feedback.some((f) => f.body.includes('€'))).toBe(false)
  })
  it('fails without a real review, even when everything else is perfect', () => {
    expect(boardDeckChallenge.evaluate({ ...ideal, review: 'none' }).passed).toBe(false)
    expect(boardDeckChallenge.evaluate({ ...ideal, review: 'ask' }).passed).toBe(false)
  })
  it('fails without the Q3 report, and when everything is dumped in', () => {
    expect(boardDeckChallenge.evaluate({ ...ideal, selectedIds: ['targets', 'last-deck'] }).passed).toBe(false)
    expect(boardDeckChallenge.evaluate({ ...ideal, selectedIds: ['report', 'targets', 'last-deck', 'survey', 'wiki'] }).passed).toBe(false)
  })
  it('passes a single chat but scores it lower than a project', () => {
    const chat = boardDeckChallenge.evaluate({ ...ideal, workspace: 'chat' })
    expect(chat.passed).toBe(true)
    expect(chat.score).toBeLessThan(boardDeckChallenge.evaluate(ideal).score)
  })
  it('fails with a vague brief', () => {
    expect(boardDeckChallenge.evaluate({ ...ideal, briefChoices: { goal: 'topic' } }).passed).toBe(false)
  })
  it('is deterministic', () => {
    expect(boardDeckChallenge.evaluate(ideal)).toEqual(boardDeckChallenge.evaluate(ideal))
  })
})

describe('scenario and sorting outcomes', () => {
  it('Deck Doctor: specific follow-ups pass, vague ones fail', () => {
    expect(deckDoctorChallenge.evaluate({ choices: { 'wall-of-text': 'specific', 'wrong-number': 'targeted', 'off-brand': 'template', 'before-sending': 'check' } }).score).toBeGreaterThanOrEqual(90)
    expect(deckDoctorChallenge.evaluate({ choices: { 'wall-of-text': 'better', 'wrong-number': 'regenerate', 'off-brand': 'fix-by-hand', 'before-sending': 'send' } }).passed).toBe(false)
  })
  it('Monday: safe habits pass, risky ones fail', () => {
    expect(mondayChallenge.evaluate({ choices: { 'customer-export': 'strip', 'surprising-number': 'check', 'usage-limit': 'smart', sharing: 'project' } }).passed).toBe(true)
    expect(mondayChallenge.evaluate({ choices: { 'customer-export': 'paste-all', 'surprising-number': 'use', 'usage-limit': 'personal', sharing: 'nothing' } }).passed).toBe(false)
  })
  it('Where does it go: correct sorting passes, everything-in-chat fails', () => {
    const correct = { brand: 'knowledge', british: 'instructions', 'template-report': 'knowledge', synonym: 'chat', salaries: 'never', audience: 'instructions', survey: 'knowledge', reformat: 'chat', passwords: 'never' }
    expect(whereDoesItGoChallenge.evaluate({ placements: correct }).score).toBe(100)
    const lazy = Object.fromEntries(Object.keys(correct).map((k) => [k, 'chat']))
    expect(whereDoesItGoChallenge.evaluate({ placements: lazy }).passed).toBe(false)
  })
})

describe('training data', () => {
  it('is internally consistent', () => {
    expect(validateTrainingData(everydayClaudeTraining)).toEqual([])
  })
})
