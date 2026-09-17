import { describe, expect, it } from 'vitest'
import { evaluateClaudeMd, sessionTokens, type ClaudeMdExercise } from './claudeMd'

const exercise: ClaudeMdExercise = {
  original: '# X\nAlways write clean code.\n[Full API reference]\nSTRIPE_SECRET_KEY=sk_live_abc123\nI use Neovim.\npnpm test\nMoney is integer cents.',
  requiredMarkers: [{ marker: 'pnpm test', label: 'test command' }, { marker: 'integer cents', label: 'money convention' }],
  pastedBlocks: [{ marker: '[Full API reference]', label: 'API reference', tokens: 30_000 }],
  personalMarkers: ['Neovim'],
  fillerPhrases: ['write clean code'],
  tokenBudget: 400,
}
const clean = '# Acme Billing\n\n## Commands\n- Test: pnpm test\n\n## Conventions\n- Money is integer cents.\n\nAPI details: @docs/api.md\n'

describe('evaluateClaudeMd', () => {
  it('fails the bloated original on almost everything', () => {
    const r = evaluateClaudeMd(exercise.original, exercise)
    expect(r.passed).toBe(false)
    expect(r.breakdown.filter((d) => d.score === 0).map((d) => d.id)).toEqual(['secrets', 'imports', 'personal', 'filler', 'budget'])
  })
  it('passes a lean, specific file', () => {
    const r = evaluateClaudeMd(clean, exercise)
    expect(r.score).toBe(100)
    expect(r.metrics?.['savedPercent']).toBeGreaterThan(90)
  })
  it('catches removing the facts or the docs entirely', () => {
    expect(evaluateClaudeMd(clean.replace('pnpm test', 'tests'), exercise).feedback[0]?.title).toContain('test command')
    expect(evaluateClaudeMd(clean.replace('API details: @docs/api.md', ''), exercise).feedback[0]?.title).toContain('gone entirely')
  })
  it('counts pasted blocks in session tokens and handles empty text', () => {
    expect(sessionTokens(exercise.original, exercise)).toBeGreaterThan(30_000)
    expect(evaluateClaudeMd('', exercise).passed).toBe(false)
  })
  it('is deterministic', () => {
    expect(evaluateClaudeMd(clean, exercise)).toEqual(evaluateClaudeMd(clean, exercise))
  })
})
