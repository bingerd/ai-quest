/**
 * Claude Code settings layering (simplified, deterministic).
 * Precedence, highest first: managed › CLI (--settings) › local › project › user.
 * Scalars: the highest layer that sets a key wins. Permission rule arrays merge
 * across every layer. `permissions.defaultMode` values `bypassPermissions` and
 * `auto` are ignored when set in project or local settings.
 * Source: https://code.claude.com/docs/en/settings
 */

export type SettingsLayerId = 'managed' | 'cli' | 'local' | 'project' | 'user'

export const LAYER_ORDER: SettingsLayerId[] = ['managed', 'cli', 'local', 'project', 'user']

export const LAYER_INFO: Record<SettingsLayerId, { label: string; file: string; shared: string }> = {
  managed: { label: 'Managed', file: 'managed-settings.json', shared: 'Set by your organisation, cannot be overridden' },
  cli: { label: 'Command line', file: '--settings / flags', shared: 'This launch only' },
  local: { label: 'Local project', file: '.claude/settings.local.json', shared: 'Just you, this repo (gitignored)' },
  project: { label: 'Project', file: '.claude/settings.json', shared: 'Everyone on the repo (committed)' },
  user: { label: 'User', file: '~/.claude/settings.json', shared: 'Just you, every project' },
}

export interface SettingsFile {
  model?: string
  outputStyle?: string
  env?: Record<string, string>
  permissions?: {
    defaultMode?: string
    allow?: string[]
    ask?: string[]
    deny?: string[]
  }
}

export type SettingsLayers = Partial<Record<SettingsLayerId, SettingsFile>>

export interface ResolvedValue {
  value: string
  source: SettingsLayerId
  /** Lower-precedence layers that also set this key and lost. */
  shadowed: { layer: SettingsLayerId; value: string }[]
}

export interface ResolvedSettings {
  values: Record<string, ResolvedValue>
  rules: Record<'allow' | 'ask' | 'deny', { rule: string; source: SettingsLayerId }[]>
  warnings: string[]
}

const IGNORED_MODES_IN_REPO = new Set(['bypassPermissions', 'auto'])

export function resolveSettings(layers: SettingsLayers): ResolvedSettings {
  const values: Record<string, ResolvedValue> = {}
  const warnings: string[] = []
  const rules: ResolvedSettings['rules'] = { allow: [], ask: [], deny: [] }

  const offer = (key: string, value: string | undefined, layer: SettingsLayerId) => {
    if (value === undefined || value === '') return
    const existing = values[key]
    if (existing) existing.shadowed.push({ layer, value })
    else values[key] = { value, source: layer, shadowed: [] }
  }

  for (const layer of LAYER_ORDER) {
    const file = layers[layer]
    if (!file) continue
    offer('model', file.model, layer)
    offer('outputStyle', file.outputStyle, layer)
    for (const [k, v] of Object.entries(file.env ?? {})) offer(`env.${k}`, v, layer)
    const mode = file.permissions?.defaultMode
    if (mode && (layer === 'project' || layer === 'local') && IGNORED_MODES_IN_REPO.has(mode)) {
      warnings.push(`defaultMode "${mode}" in ${LAYER_INFO[layer].file} is ignored: a repository cannot switch off your permission prompts.`)
    } else {
      offer('permissions.defaultMode', mode, layer)
    }
    for (const kind of ['allow', 'ask', 'deny'] as const) {
      for (const rule of file.permissions?.[kind] ?? []) {
        if (!rules[kind].some((r) => r.rule === rule)) rules[kind].push({ rule, source: layer })
      }
    }
  }
  return { values, rules, warnings }
}
