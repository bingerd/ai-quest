import { describe, expect, it } from 'vitest'
import type { ChallengeDefinition } from '../../../engine/types'
import { claudeMdOriginal } from '../data/claudeMd'
import {
  claudeMdChallenge,
  extensionPointChallenge,
  hookLabChallenge,
  longSessionChallenge,
  permissionPuzzleChallenge,
  routeSessionChallenge,
  teamSetupChallenge,
} from './definitions'

const challenges: [string, ChallengeDefinition][] = [
  ['CLAUDE.md Surgery', claudeMdChallenge],
  ['Permission Puzzle', permissionPuzzleChallenge],
  ['Hook Lab', hookLabChallenge],
  ['Which extension point?', extensionPointChallenge],
  ['Route the session', routeSessionChallenge],
  ['Three-hour session', longSessionChallenge],
  ['Team setup', teamSetupChallenge],
]

const garbage: unknown[] = [undefined, null, 42, 'text', [], {}, { text: 7 }, { answers: 'x' }, { answers: { format: null, notify: 3 } }, { choices: null, checks: 'y' }, { placements: [] }]

describe.each(challenges)('%s definition', (_name, challenge) => {
  it.each(garbage.map((g) => [JSON.stringify(g) ?? 'undefined', g]))('handles malformed answer %s', (_label, answer) => {
    const r = challenge.evaluate(answer)
    expect(Number.isFinite(r.score)).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.passed).toBe(false)
  })
})

describe('CLAUDE.md Surgery', () => {
  it('passes a lean model answer and fails the untouched file', () => {
    const lean = `# Acme Billing\n\nTypeScript monorepo that generates and sends invoices.\n\n## Commands\n- Install: pnpm install\n- Test: pnpm test\n- Lint: pnpm lint\n\n## Conventions\n- Tests use Vitest, colocated as *.test.ts\n- Money is stored as integer cents, never floats\n\n## Reference\n- API: @docs/api.md\n`
    expect(claudeMdChallenge.evaluate({ text: lean }).score).toBe(100)
    expect(claudeMdChallenge.evaluate({ text: claudeMdOriginal }).passed).toBe(false)
  })
})

describe('Permission Puzzle', () => {
  const ideal = { permissions: { allow: ['Bash(npm test *)', 'Bash(npm run lint *)', 'Edit(src/**)', 'WebFetch(domain:docs.stripe.com)'], ask: ['Bash(git push *)'], deny: ['Read(.env)', 'Bash(curl *)'] } }
  it('passes the model answer with 100', () => {
    expect(permissionPuzzleChallenge.evaluate({ text: JSON.stringify(ideal) }).score).toBe(100)
  })
  it('fails blanket allows and the empty starter', () => {
    expect(permissionPuzzleChallenge.evaluate({ text: JSON.stringify({ permissions: { allow: ['Bash', 'Edit', 'WebFetch'], deny: ['Read(.env)'] } }) }).passed).toBe(false)
    expect(permissionPuzzleChallenge.evaluate({ text: '{"permissions":{"allow":[],"ask":[],"deny":[]}}' }).passed).toBe(false)
  })
  it('shows that allowing npm does not allow the chained curl', () => {
    const r = permissionPuzzleChallenge.evaluate({ text: JSON.stringify({ permissions: { ...ideal.permissions, deny: ['Read(.env)'] } }) })
    expect(r.feedback[0]?.title).toContain('curl')
  })
})

describe('Hook Lab', () => {
  const ideal = {
    format: { event: 'PostToolUse', matcher: 'Edit|Write', behaviour: 'format' },
    'protect-env': { event: 'PreToolUse', matcher: 'Edit|Write', behaviour: 'block-env' },
    'session-context': { event: 'SessionStart', matcher: 'startup', behaviour: 'print-context' },
    notify: { event: 'Notification', matcher: 'permission_prompt', behaviour: 'notify' },
  }
  it('passes the correct configuration', () => {
    expect(hookLabChallenge.evaluate({ answers: ideal }).score).toBe(100)
  })
  it('fails classic mistakes', () => {
    const wrong = {
      format: { event: 'PreToolUse', matcher: '*', behaviour: 'format' },
      'protect-env': { event: 'PostToolUse', matcher: 'Edit', behaviour: 'warn-env' },
      'session-context': { event: 'UserPromptSubmit', matcher: '', behaviour: 'print-context' },
      notify: { event: 'Stop', matcher: '', behaviour: 'notify' },
    }
    expect(hookLabChallenge.evaluate({ answers: wrong }).passed).toBe(false)
    expect(hookLabChallenge.evaluate({ answers: { ...ideal, 'protect-env': { event: 'PreToolUse', matcher: 'Edit', behaviour: 'block-env' } } }).breakdown.find((d) => d.id === 'protect-env')?.score).toBeLessThan(100)
  })
})

describe('sorting, routing, scenario and final', () => {
  it('Which extension point: correct answer passes, CLAUDE.md-for-everything fails', () => {
    const correct = { pnpm: 'claude-md', 'no-env': 'settings', prettier: 'hook', 'release-notes': 'skill', 'security-review': 'subagent', linear: 'mcp', teaching: 'output-style', opusplan: 'settings', cents: 'claude-md', 'deprecated-search': 'subagent', 'deploy-cmd': 'skill' }
    expect(extensionPointChallenge.evaluate({ placements: correct }).score).toBe(100)
    expect(extensionPointChallenge.evaluate({ placements: Object.fromEntries(Object.keys(correct).map((k) => [k, 'claude-md'])) }).passed).toBe(false)
  })
  it('Route the session: opus to plan, sonnet to build, haiku for volume', () => {
    const best = routeSessionChallenge.evaluate({ choices: { architecture: 'opus', implement: 'sonnet', rename: 'haiku', search: 'haiku' } })
    expect(best.score).toBeGreaterThanOrEqual(90)
    expect(routeSessionChallenge.evaluate({ choices: { architecture: 'opus', implement: 'opus', rename: 'opus', search: 'opus' } }).score).toBeLessThan(best.score)
    expect(routeSessionChallenge.evaluate({ choices: { architecture: 'haiku', implement: 'haiku', rename: 'haiku', search: 'haiku' } }).score).toBeLessThan(best.score)
  })
  it('Three-hour session: good habits pass', () => {
    expect(longSessionChallenge.evaluate({ choices: { 'new-task': 'clear', 'mid-feature': 'focused-compact', 'big-search': 'subagent', 'what-is-in-there': 'context' } }).passed).toBe(true)
    expect(longSessionChallenge.evaluate({ choices: { 'new-task': 'continue', 'mid-feature': 'clear', 'big-search': 'paste', 'what-is-in-there': 'delete' } }).passed).toBe(false)
  })
  it('Team setup: ideal passes; a committed key or bypass mode sinks it', () => {
    const ideal = { choices: { 'rules-location': 'project', rules: 'balanced', formatting: 'post-hook', model: 'opusplan' }, checks: { 'claude-md': ['commands', 'cents', 'import'], mcp: ['tracker', 'github'] } }
    expect(teamSetupChallenge.evaluate(ideal).score).toBe(100)
    expect(teamSetupChallenge.evaluate({ ...ideal, checks: { ...ideal.checks, 'claude-md': ['commands', 'cents', 'import', 'key'] } }).score).toBeLessThanOrEqual(30)
    expect(teamSetupChallenge.evaluate({ ...ideal, choices: { ...ideal.choices, rules: 'bypass' } }).passed).toBe(false)
    expect(teamSetupChallenge.evaluate({ ...ideal, choices: { ...ideal.choices, 'rules-location': 'claude-md' } }).passed).toBe(false)
  })
})
