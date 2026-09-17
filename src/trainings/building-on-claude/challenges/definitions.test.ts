import { describe, expect, it } from 'vitest'
import type { ChallengeDefinition } from '../../../engine/types'
import {
  agentToolboxChallenge,
  cacheArchitectChallenge,
  evalLabChallenge,
  leastPrivilegeChallenge,
  platformWeekChallenge,
  shipItChallenge,
  workloadChallenge,
} from './definitions'

const challenges: [string, ChallengeDefinition][] = [
  ['Cache Architect', cacheArchitectChallenge],
  ['Workload Planner', workloadChallenge],
  ['Agent Toolbox', agentToolboxChallenge],
  ['Least privilege', leastPrivilegeChallenge],
  ['Eval Lab', evalLabChallenge],
  ['Platform week', platformWeekChallenge],
  ['Ship it', shipItChallenge],
]

const garbage: unknown[] = [undefined, null, 42, 'text', [], {}, { order: 'x', breakpoints: 3 }, { toolIds: 'all' }, { caseTypes: 'happy', grader: 9 }, { choices: null }, { placements: [] }]

describe.each(challenges)('%s definition', (_name, challenge) => {
  it.each(garbage.map((g) => [JSON.stringify(g) ?? 'undefined', g]))('handles malformed answer %s', (_label, answer) => {
    const r = challenge.evaluate(answer)
    expect(Number.isFinite(r.score)).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.passed).toBe(false)
  })
})

describe('Cache Architect', () => {
  const stableFirst = ['tools', 'system', 'policies', 'examples', 'history', 'question']
  it('passes with stable blocks first and a breakpoint after them', () => {
    const r = cacheArchitectChallenge.evaluate({ order: stableFirst, breakpoints: ['examples'], ttl: '5m' })
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.metrics?.['savedPercent']).toBeGreaterThan(60)
  })
  it('fails when the volatile blocks come first or no breakpoint is set', () => {
    expect(cacheArchitectChallenge.evaluate({ order: ['question', 'history', 'tools', 'system', 'policies', 'examples'], breakpoints: ['examples'], ttl: '5m' }).passed).toBe(false)
    expect(cacheArchitectChallenge.evaluate({ order: stableFirst, breakpoints: [], ttl: '5m' }).passed).toBe(false)
  })
  it('is deterministic', () => {
    const a = { order: stableFirst, breakpoints: ['examples'], ttl: '1h' as const }
    expect(cacheArchitectChallenge.evaluate(a)).toEqual(cacheArchitectChallenge.evaluate(a))
  })
})

describe('the rest', () => {
  it('Workload Planner: cached chat, batched async work', () => {
    expect(workloadChallenge.evaluate({ choices: { 'support-chat': 'realtime-cached', 'nightly-tagging': 'batch', 'onboarding-summary': 'batch' } }).score).toBe(100)
    expect(workloadChallenge.evaluate({ choices: { 'support-chat': 'batch', 'nightly-tagging': 'realtime', 'onboarding-summary': 'realtime' } }).passed).toBe(false)
  })
  it('Agent Toolbox: minimal read-only set passes, dangerous tools cap it', () => {
    const good = agentToolboxChallenge.evaluate({ toolIds: ['billing-read', 'policy-search', 'tickets'] })
    expect(good.passed).toBe(true)
    expect(agentToolboxChallenge.evaluate({ toolIds: ['billing-read', 'policy-search', 'refund'] }).score).toBeLessThanOrEqual(40)
    expect(agentToolboxChallenge.evaluate({ toolIds: ['billing-read'] }).passed).toBe(false)
    const vague = agentToolboxChallenge.evaluate({ toolIds: ['data-service', 'policy-search', 'tickets', 'web'] })
    expect(vague.score).toBeLessThan(good.score)
  })
  it('Least privilege: correct sorting passes, automating everything fails', () => {
    const correct = { 'read-invoice': 'auto', 'search-policy': 'auto', 'draft-reply': 'auto', 'send-email': 'approve', 'refund-small': 'approve', 'close-ticket': 'approve', sql: 'never', 'prod-deploy': 'never', credentials: 'never' }
    expect(leastPrivilegeChallenge.evaluate({ placements: correct }).score).toBe(100)
    expect(leastPrivilegeChallenge.evaluate({ placements: Object.fromEntries(Object.keys(correct).map((k) => [k, 'auto'])) }).passed).toBe(false)
  })
  it('Eval Lab: broad, large, code-graded suite passes; ten happy cases do not', () => {
    const good = evalLabChallenge.evaluate({ caseTypes: ['happy', 'edge', 'adversarial', 'regression'], sampleSize: 'large', grader: 'code' })
    expect(good.passed).toBe(true)
    expect(evalLabChallenge.evaluate({ caseTypes: ['happy'], sampleSize: 'small', grader: 'code' }).passed).toBe(false)
    const human = evalLabChallenge.evaluate({ caseTypes: ['happy', 'edge', 'adversarial', 'regression'], sampleSize: 'large', grader: 'human' })
    expect(human.score).toBeLessThan(good.score)
  })
  it('Platform week and Ship it: best answers pass, worst fail', () => {
    expect(platformWeekChallenge.evaluate({ choices: { rollout: 'managed', 'ci-agent': 'constrain', 'cost-spike': 'measure-fix', 'mcp-request': 'reviewed' } }).score).toBeGreaterThanOrEqual(90)
    expect(platformWeekChallenge.evaluate({ choices: { rollout: 'wiki', 'ci-agent': 'delete', 'cost-spike': 'quota', 'mcp-request': 'yes' } }).passed).toBe(false)
    const ideal = { choices: { model: 'small', 'prompt-shape': 'cached-prefix', delivery: 'split', 'agent-scope': 'draft', rollout: 'staged' }, checks: { evals: ['happy', 'edge', 'adversarial', 'regression'] } }
    expect(shipItChallenge.evaluate(ideal).score).toBe(100)
    expect(shipItChallenge.evaluate({ ...ideal, choices: { ...ideal.choices, 'agent-scope': 'refund' } }).passed).toBe(false)
    expect(shipItChallenge.evaluate({ ...ideal, choices: { ...ideal.choices, 'prompt-shape': 'ticket-first' } }).passed).toBe(false)
  })
})
