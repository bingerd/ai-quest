import { describe, expect, it } from 'vitest'
import { duplicateLines, fail, partial, pass, runRules, sensitiveMatches, simpleRule, type Rule } from './ruleChecker'

const rules: Rule<string>[] = [
  simpleRule<string>('long', 'Long enough', 3, (t) => t.length >= 10, ['Long', 'ok'], ['Too short', 'add more']),
  { id: 'hello', label: 'Says hello', weight: 1, run: (t) => (t.includes('hello') ? pass('Hello', 'ok') : fail('No hello', 'say hello')) },
]

describe('runRules', () => {
  it('weights rules and puts failures first', () => {
    const r = runRules('hello', rules)
    expect(r.breakdown.map((d) => d.score)).toEqual([0, 100])
    expect(r.score).toBe(25)
    expect(r.passed).toBe(false)
    expect(r.feedback.map((f) => f.title)).toEqual(['Too short', 'Hello'])
    expect(r.summary).toBe('1 of 2 checks passed.')
  })
  it('passes when all rules pass and respects a custom pass score and summary', () => {
    const r = runRules('hello world!', rules, { passScore: 100, summary: (p, t, s) => `${p}/${t}/${s}` })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
    expect(r.summary).toBe('2/2/100')
  })
  it('supports partial credit', () => {
    const r = runRules('x', [{ id: 'p', label: 'Partial', run: () => partial('Half', 'meh') }])
    expect(r.score).toBe(50)
    expect(r.feedback[0]?.tone).toBe('neutral')
  })
  it('handles an empty rule list', () => {
    expect(runRules('x', []).score).toBe(0)
  })
})

describe('helpers', () => {
  it('finds duplicate long lines once', () => {
    expect(duplicateLines('You are a helpful assistant.\nfoo\nYOU ARE A HELPFUL ASSISTANT.\nYou are a helpful assistant.')).toEqual(['you are a helpful assistant.'])
  })
  it('detects secrets', () => {
    expect(sensitiveMatches('password: hunter2')).toEqual(['a password'])
    expect(sensitiveMatches('nothing here')).toEqual([])
  })
})
