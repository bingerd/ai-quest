import { describe, expect, it } from 'vitest'
import { evaluatePrompt, parseSections, type PromptExercise } from './promptEvaluator'

const original = `SYSTEM
You are a helpful assistant.
You are a helpful assistant.

CONTEXT
[Q3 regional revenue table]
[Entire employee handbook, 120 pages]
[Every Slack message from #sales this year]
Analyst login password: hunter2

TASK
Answer the user's question.
`

const exercise: PromptExercise = {
  irrelevantMarkers: ['[Entire employee handbook, 120 pages]', '[Every Slack message from #sales this year]'],
  requiredMarkers: ['[Q3 regional revenue table]'],
  originalText: original,
}

const clean = `SYSTEM
You are a sales analyst. Answer with figures and cite the source row.

CONTEXT
[Q3 regional revenue table]

TASK
What was Q3 revenue in EMEA, and how did it compare with the EMEA target?

OUTPUT
Two sentences, with the numbers.
`

describe('parseSections', () => {
  it('splits on upper-case headings', () => {
    const s = parseSections(clean)
    expect(s.system).toContain('sales analyst')
    expect(s.context).toBe('[Q3 regional revenue table]')
    expect(s.task).toContain('EMEA')
    expect(s.output).toContain('Two sentences')
  })
})

describe('evaluatePrompt', () => {
  it('fails the original on every count except retained context', () => {
    const r = evaluatePrompt(original, exercise)
    expect(r.score).toBeLessThan(40)
    const failed = r.breakdown.filter((d) => d.score === 0).map((d) => d.id)
    expect(failed).toEqual(expect.arrayContaining(['irrelevant', 'task', 'output', 'repetition', 'sensitive']))
    expect(r.breakdown.find((d) => d.id === 'retained')?.score).toBe(100)
  })
  it('passes a clean prompt with tokens saved', () => {
    const r = evaluatePrompt(clean, exercise)
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
    expect(r.metrics?.['tokensSaved']).toBeGreaterThan(0)
    expect(r.summary).toContain('saved')
  })
  it('catches removal of the required source', () => {
    const r = evaluatePrompt(clean.replace('[Q3 regional revenue table]', ''), exercise)
    expect(r.breakdown.find((d) => d.id === 'retained')?.score).toBe(0)
    expect(r.feedback[0]?.title).toContain('Missing')
  })
  it('detects several kinds of secrets', () => {
    expect(evaluatePrompt(`${clean}\nkey: api_ABCDEFGHIJKLMNOP`, exercise).breakdown.find((d) => d.id === 'sensitive')?.score).toBe(0)
    expect(evaluatePrompt(`${clean}\nNL91 ABNA 0417 1643 00`, exercise).breakdown.find((d) => d.id === 'sensitive')?.score).toBe(0)
  })
  it('accepts format words in the task instead of an OUTPUT section', () => {
    const noOutput = clean.replace(/OUTPUT[\s\S]*$/, '').replace('EMEA target?', 'EMEA target? Answer in two sentences.')
    expect(evaluatePrompt(noOutput, exercise).breakdown.find((d) => d.id === 'output')?.score).toBe(100)
  })
  it('handles empty input', () => {
    const r = evaluatePrompt('', exercise)
    expect(r.score).toBeLessThan(60)
    expect(r.passed).toBe(false)
  })
  it('is deterministic', () => {
    expect(evaluatePrompt(clean, exercise)).toEqual(evaluatePrompt(clean, exercise))
  })
})
