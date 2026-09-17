import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { round } from './scoring'

/**
 * Deterministic model of Claude Code permission rules (a teaching subset).
 * - Rules are `Tool` or `Tool(specifier)`. Order: deny, then ask, then allow; first match wins.
 * - Bash: `*` matches any text, a trailing ` *` or `:*` also matches the bare command,
 *   compound commands are split on && || ; | & and newlines. Allow must match every part;
 *   deny/ask apply if any part matches.
 * - Read/Edit: gitignore-style paths. `*` within a segment, `**` across segments, a bare
 *   filename matches at any depth. Edit rules also cover Write.
 * - WebFetch(domain:host) matches that host.
 * - Unmatched: reads are allowed inside the project, Bash/edits/fetches ask.
 * Source: https://code.claude.com/docs/en/permissions
 */

export type Decision = 'allow' | 'ask' | 'deny'
export type ToolName = 'Bash' | 'Read' | 'Grep' | 'Edit' | 'Write' | 'WebFetch'

export interface ToolCall {
  id: string
  tool: ToolName
  /** Command for Bash, project-relative path for Read/Edit/Write/Grep, URL for WebFetch. */
  input: string
}

export interface ParsedRule {
  raw: string
  tool: string
  specifier: string | null
}

export interface PermissionRules {
  allow: string[]
  ask: string[]
  deny: string[]
}

export interface CallDecision {
  decision: Decision
  /** The rule that decided it, or null for the default. */
  rule: string | null
  list: Decision | 'default'
}

const RULE_RE = /^([A-Za-z][A-Za-z0-9_]*)(?:\((.*)\))?$/

export function parseRule(raw: string): ParsedRule | null {
  const m = RULE_RE.exec(raw.trim())
  if (!m) return null
  const specifier = m[2] === undefined ? null : m[2]
  if (specifier !== null && specifier.trim() === '') return null
  return { raw, tool: m[1]!, specifier }
}

export function splitCompound(command: string): string[] {
  return command
    .split(/&&|\|\||\|&|;|\||&|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function escapeRe(s: string): string {
  return s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
}

export function bashPatternMatches(pattern: string, command: string): boolean {
  let p = pattern.trim()
  if (p.endsWith(':*')) p = `${p.slice(0, -2)} *`
  const cmd = command.trim()
  // A trailing " *" as the only wildcard also matches the bare command.
  if (p.endsWith(' *') && p.indexOf('*') === p.length - 1 && cmd === p.slice(0, -2)) return true
  const re = new RegExp(`^${p.split('*').map(escapeRe).join('.*')}$`)
  return re.test(cmd)
}

export function pathPatternMatches(pattern: string, path: string): boolean {
  const p = pattern.trim().replace(/^\.\//, '')
  const target = path.trim().replace(/^\.\//, '')
  if (p.startsWith('//') || p.startsWith('~/')) return false // outside the project in this simulation
  const globToRe = (g: string) =>
    g
      .split(/(\*\*\/?|\*|\?)/)
      .map((part) => (part === '**/' ? '(?:.*/)?' : part === '**' ? '.*' : part === '*' ? '[^/]*' : part === '?' ? '[^/]' : escapeRe(part)))
      .join('')
  if (!p.includes('/')) return new RegExp(`^(?:.*/)?${globToRe(p)}$`).test(target)
  return new RegExp(`^${globToRe(p.replace(/^\//, ''))}$`).test(target)
}

function ruleMatches(rule: ParsedRule, call: ToolCall, subcommand?: string): boolean {
  const toolMatches = rule.tool === call.tool || (rule.tool === 'Edit' && call.tool === 'Write')
  if (!toolMatches) return false
  if (rule.specifier === null || rule.specifier === '*') return true
  switch (call.tool) {
    case 'Bash':
      return bashPatternMatches(rule.specifier, subcommand ?? call.input)
    case 'Read':
    case 'Grep':
    case 'Edit':
    case 'Write':
      return pathPatternMatches(rule.specifier, call.input)
    case 'WebFetch': {
      const m = /^domain:(.+)$/.exec(rule.specifier)
      if (!m) return false
      try {
        return new URL(call.input).hostname === m[1]
      } catch {
        return false
      }
    }
  }
}

function parsed(list: string[]): ParsedRule[] {
  return list.map(parseRule).filter((r): r is ParsedRule => r !== null)
}

export function decide(rules: PermissionRules, call: ToolCall): CallDecision {
  const deny = parsed(rules.deny)
  const ask = parsed(rules.ask)
  const allow = parsed(rules.allow)
  const parts = call.tool === 'Bash' ? splitCompound(call.input) : [call.input]

  const anyPart = (list: ParsedRule[]) => list.find((r) => parts.some((part) => ruleMatches(r, call, part)))
  const denied = anyPart(deny)
  if (denied) return { decision: 'deny', rule: denied.raw, list: 'deny' }
  const asked = anyPart(ask)
  if (asked) return { decision: 'ask', rule: asked.raw, list: 'ask' }
  if (parts.length > 0) {
    const perPart = parts.map((part) => allow.find((r) => ruleMatches(r, call, part)))
    if (perPart.every((r) => r !== undefined)) return { decision: 'allow', rule: perPart.map((r) => r!.raw).filter((v, i, a) => a.indexOf(v) === i).join(' + '), list: 'allow' }
  }
  const byDefault: Decision = call.tool === 'Read' || call.tool === 'Grep' ? 'allow' : 'ask'
  return { decision: byDefault, rule: null, list: 'default' }
}

export interface PuzzleCall extends ToolCall {
  label: string
  expected: Decision
  why: string
  /** Allowing this call would be dangerous: caps the score. */
  dangerous?: boolean
}

export interface PermissionPuzzleResult extends ChallengeResult {
  rows: { call: PuzzleCall; got: CallDecision; ok: boolean }[]
  parseError: string | null
  invalidRules: string[]
}

export function parseSettingsJson(text: string): { rules: PermissionRules; error: string | null; invalid: string[] } {
  const empty: PermissionRules = { allow: [], ask: [], deny: [] }
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (e) {
    return { rules: empty, error: e instanceof Error ? e.message : 'Invalid JSON', invalid: [] }
  }
  const perms = typeof data === 'object' && data !== null ? (data as { permissions?: unknown }).permissions : undefined
  if (typeof perms !== 'object' || perms === null) return { rules: empty, error: 'Missing a "permissions" object', invalid: [] }
  const invalid: string[] = []
  const list = (key: 'allow' | 'ask' | 'deny'): string[] => {
    const raw = (perms as Record<string, unknown>)[key]
    if (!Array.isArray(raw)) return []
    return raw.filter((r): r is string => {
      const ok = typeof r === 'string' && parseRule(r) !== null
      if (!ok) invalid.push(String(r))
      return ok
    })
  }
  return { rules: { allow: list('allow'), ask: list('ask'), deny: list('deny') }, error: null, invalid }
}

export function simulatePermissionPuzzle(settingsJson: string, calls: PuzzleCall[], passScore = 80): PermissionPuzzleResult {
  const { rules, error, invalid } = parseSettingsJson(settingsJson)
  if (error) {
    return {
      score: 0,
      passed: false,
      breakdown: [{ id: 'json', label: 'Valid settings', score: 0 }],
      feedback: [{ tone: 'warning', title: 'The settings file does not parse', body: `${error}. Claude Code would report invalid settings instead of applying your rules.`, concept: 'settings' }],
      summary: 'Fix the JSON first.',
      rows: [],
      parseError: error,
      invalidRules: [],
    }
  }
  const rows = calls.map((call) => {
    const got = decide(rules, call)
    return { call, got, ok: got.decision === call.expected }
  })
  const correct = rows.filter((r) => r.ok).length
  let score = calls.length === 0 ? 0 : round((correct / calls.length) * 100)
  const dangerous = rows.filter((r) => r.call.dangerous && r.got.decision === 'allow')
  if (dangerous.length > 0) score = Math.min(score, 50)

  const byDecision = (d: Decision): ScoreDimension => {
    const group = rows.filter((r) => r.call.expected === d)
    return { id: d, label: d === 'allow' ? 'Allowed as intended' : d === 'ask' ? 'Asks as intended' : 'Blocked as intended', score: group.length === 0 ? 100 : round((group.filter((r) => r.ok).length / group.length) * 100) }
  }
  const breakdown = (['allow', 'ask', 'deny'] as const).map(byDecision)

  const feedback: Feedback[] = []
  for (const r of dangerous) {
    feedback.push({ tone: 'warning', title: `Dangerous: "${r.call.label}" would run without asking`, body: `Allowed by ${r.got.rule ?? 'default'}. ${r.call.why}`, concept: 'permissions' })
  }
  for (const r of rows.filter((x) => !x.ok && !(x.call.dangerous && x.got.decision === 'allow'))) {
    const via = r.got.rule ? `matched ${r.got.rule}` : 'no rule matched, so the default applied'
    feedback.push({ tone: 'warning', title: `"${r.call.label}": ${r.got.decision}, expected ${r.call.expected}`, body: `It ${via}. ${r.call.why}`, concept: 'permissions' })
  }
  if (invalid.length > 0) feedback.push({ tone: 'neutral', title: `Ignored invalid rules: ${invalid.join(', ')}`, body: 'Rules look like Tool or Tool(specifier), for example Bash(npm test *) or Read(.env).' })
  if (feedback.length === 0) feedback.push({ tone: 'positive', title: 'Every call gets exactly the treatment you intended', body: 'Routine commands flow, risky ones ask, secrets and destructive commands are blocked. Remember: deny rules are a guardrail, not a sandbox.' })

  return {
    score,
    passed: score >= passScore,
    breakdown,
    feedback,
    summary: `${correct} of ${calls.length} calls handled as intended.`,
    rows,
    parseError: null,
    invalidRules: invalid,
  }
}
