import { describe, expect, it } from 'vitest'
import { briefText, evaluateBrief, parseBriefChoices, type BriefSpec } from './brief'

const spec: BriefSpec = {
  blocks: [
    {
      id: 'goal', label: 'Goal', weight: 3,
      options: [
        { id: 'none', text: 'Make slides.', quality: 'missing' },
        { id: 'vague', text: 'Make slides about Q3.', quality: 'weak' },
        { id: 'specific', text: 'Help leadership decide on EMEA hiring.', quality: 'strong' },
      ],
      strong: ['Clear goal', 'good'], weak: ['Vague goal', 'sharpen'], missing: ['No goal', 'add one'],
    },
    {
      id: 'source', label: 'Sources', weight: 1,
      options: [
        { id: 'none', text: '', quality: 'missing' },
        { id: 'attached', text: 'Use the attached report.', quality: 'strong' },
      ],
      strong: ['Grounded', 'good'], weak: ['', ''], missing: ['No sources', 'attach the report'],
    },
  ],
  outline: { generic: ['Introduction'], partial: ['Q3 overview'], specific: ['EMEA: hire or wait?'] },
}

describe('evaluateBrief', () => {
  it('scores a strong brief and shows the specific outline', () => {
    const r = evaluateBrief(spec, { goal: 'specific', source: 'attached' })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
    expect(r.outline).toEqual(['EMEA: hire or wait?'])
    expect(r.text).toBe('Help leadership decide on EMEA hiring. Use the attached report.')
  })
  it('scores weak and missing blocks as failures with the matching message', () => {
    const r = evaluateBrief(spec, { goal: 'vague' })
    expect(r.score).toBe(38)
    expect(r.breakdown.map((d) => d.score)).toEqual([50, 0])
    expect(r.feedback.map((f) => [f.title, f.tone])).toEqual([['Vague goal', 'neutral'], ['No sources', 'warning']])
    expect(r.outline).toEqual(['Introduction'])
  })
  it('uses the partial outline for a middling brief', () => {
    expect(evaluateBrief(spec, { goal: 'vague', source: 'attached' }).score).toBe(63)
    expect(evaluateBrief(spec, { goal: 'vague', source: 'attached' }).outline).toEqual(['Q3 overview'])
    expect(evaluateBrief(spec, { goal: 'none', source: 'none' }).outline).toEqual(['Introduction'])
  })
  it('falls back to the missing option for unknown ids and is deterministic', () => {
    expect(briefText(spec, { goal: 'nope' })).toBe('Make slides.')
    expect(evaluateBrief(spec, { goal: 'nope' })).toEqual(evaluateBrief(spec, { goal: 'nope' }))
  })
  it('parses malformed answers safely', () => {
    expect(parseBriefChoices(undefined)).toEqual({})
    expect(parseBriefChoices({ choices: { goal: 'x', source: 5 } })).toEqual({ goal: 'x' })
  })
})
