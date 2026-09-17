import { describe, expect, it } from 'vitest'
import { resolveSettings } from './claudeSettings'

describe('resolveSettings', () => {
  it('takes scalars from the highest layer and records what lost', () => {
    const r = resolveSettings({ user: { model: 'opus' }, project: { model: 'sonnet' }, local: { model: 'haiku' } })
    expect(r.values['model']).toEqual({ value: 'haiku', source: 'local', shadowed: [{ layer: 'project', value: 'sonnet' }, { layer: 'user', value: 'opus' }] })
  })
  it('lets managed settings beat everything', () => {
    const r = resolveSettings({ managed: { model: 'sonnet' }, cli: { model: 'opus' } })
    expect(r.values['model']?.source).toBe('managed')
  })
  it('merges permission rules across layers without duplicates', () => {
    const r = resolveSettings({ user: { permissions: { allow: ['Bash(npm test *)'] } }, project: { permissions: { allow: ['Bash(npm test *)', 'Read(docs/**)'], deny: ['Read(.env)'] } }, managed: { permissions: { deny: ['WebFetch'] } } })
    expect(r.rules.allow).toEqual([{ rule: 'Bash(npm test *)', source: 'project' }, { rule: 'Read(docs/**)', source: 'project' }])
    expect(r.rules.deny.map((d) => d.source)).toEqual(['managed', 'project'])
  })
  it('ignores bypassPermissions and auto in project and local settings', () => {
    const r = resolveSettings({ user: { permissions: { defaultMode: 'acceptEdits' } }, project: { permissions: { defaultMode: 'bypassPermissions' } }, local: { permissions: { defaultMode: 'auto' } } })
    expect(r.values['permissions.defaultMode']).toMatchObject({ value: 'acceptEdits', source: 'user' })
    expect(r.warnings).toHaveLength(2)
  })
  it('merges env per key and handles empty input', () => {
    const r = resolveSettings({ user: { env: { A: '1', B: '1' } }, project: { env: { B: '2' } } })
    expect(r.values['env.A']?.value).toBe('1')
    expect(r.values['env.B']).toMatchObject({ value: '2', source: 'project' })
    expect(resolveSettings({})).toEqual({ values: {}, rules: { allow: [], ask: [], deny: [] }, warnings: [] })
  })
})
