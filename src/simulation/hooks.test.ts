import { describe, expect, it } from 'vitest'
import { hookEffect, matcherMatches, simulateHookLab, type HookBehaviour, type HookGoal, type Occurrence } from './hooks'

const always0: HookBehaviour = { id: 'ok', label: 'exit 0', exitCode: () => 0 }
const blockEnv: HookBehaviour = { id: 'env', label: 'exit 2 on .env', exitCode: (o) => (o.target?.endsWith('.env') ? 2 : 0) }
const context: HookBehaviour = { id: 'ctx', label: 'print branch', exitCode: () => 0, printsContext: true }

const pre = (target: string): Occurrence => ({ id: `pre-${target}`, event: 'PreToolUse', subject: 'Edit', target, label: `edit ${target}` })

describe('matcherMatches', () => {
  it('handles all, exact lists and regex', () => {
    expect(matcherMatches('', 'Bash')).toBe(true)
    expect(matcherMatches('*', undefined)).toBe(true)
    expect(matcherMatches('Edit|Write', 'Write')).toBe(true)
    expect(matcherMatches('Edit|Write', 'MultiEditX')).toBe(false)
    expect(matcherMatches('mcp__.*', 'mcp__github__create_issue')).toBe(true)
    expect(matcherMatches('Edit', undefined)).toBe(false)
    expect(matcherMatches('([', 'x')).toBe(false)
  })
})

describe('hookEffect', () => {
  it('blocks only on PreToolUse, ignores exit 2 on PostToolUse, continues on Stop', () => {
    expect(hookEffect({ event: 'PreToolUse', matcher: 'Edit', behaviour: blockEnv }, pre('.env'))).toBe('blocked')
    expect(hookEffect({ event: 'PostToolUse', matcher: 'Edit', behaviour: blockEnv }, { ...pre('.env'), event: 'PostToolUse' })).toBe('exit2-ignored')
    expect(hookEffect({ event: 'Stop', matcher: 'ignored', behaviour: { id: 's', label: 's', exitCode: () => 2 } }, { id: 's', event: 'Stop', label: 'stop' })).toBe('continued')
  })
  it('adds context on SessionStart and skips other events', () => {
    expect(hookEffect({ event: 'SessionStart', matcher: 'startup', behaviour: context }, { id: 'a', event: 'SessionStart', subject: 'startup', label: 'start' })).toBe('context')
    expect(hookEffect({ event: 'SessionStart', matcher: 'startup', behaviour: context }, pre('x'))).toBe('skipped')
    expect(hookEffect({ event: 'PreToolUse', matcher: 'Edit', behaviour: { id: 'e', label: 'e', exitCode: () => 1 } }, pre('x'))).toBe('error')
  })
})

describe('simulateHookLab', () => {
  const goal: HookGoal = {
    id: 'env',
    title: 'Protect .env',
    description: '',
    matcherOptions: ['Edit|Write', '*'],
    behaviours: [always0, blockEnv],
    stream: [
      { ...pre('.env'), expect: 'blocks' },
      { ...pre('src/app.ts'), expect: 'not-blocked' },
      { id: 'post', event: 'PostToolUse', subject: 'Edit', target: 'src/app.ts', label: 'after edit', expect: 'not-blocked' },
    ],
    lesson: 'Use PreToolUse with exit 2.',
  }
  it('scores a correct hook 100', () => {
    const r = simulateHookLab([goal], { env: { event: 'PreToolUse', matcher: 'Edit|Write', behaviour: 'env' } })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
  })
  it('explains the PostToolUse mistake', () => {
    const r = simulateHookLab([goal], { env: { event: 'PostToolUse', matcher: 'Edit|Write', behaviour: 'env' } })
    expect(r.score).toBe(67)
    expect(r.feedback[0]?.body).toContain('never ran')
  })
  it('handles missing and malformed answers deterministically', () => {
    expect(simulateHookLab([goal], {}).score).toBe(0)
    expect(simulateHookLab([goal], { env: { event: 'Nope', matcher: '*', behaviour: 'env' } }).feedback[0]?.title).toContain('not configured')
    expect(simulateHookLab([], {}).score).toBe(0)
  })
})
