import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { round } from './scoring'

/**
 * Deterministic model of Claude Code hooks (a teaching subset).
 * - Tool events match on tool name; SessionStart on how the session started; Notification on
 *   notification type; UserPromptSubmit and Stop have no matcher.
 * - Matcher: "" or "*" matches all; letters/digits/_ and | lists match exactly; anything else is a regex.
 * - Exit 2: PreToolUse blocks the call; PostToolUse cannot (the tool already ran); Stop keeps Claude going.
 * - Exit 0 stdout on SessionStart / UserPromptSubmit is added to Claude's context.
 * Source: https://code.claude.com/docs/en/hooks
 */

export type HookEvent = 'SessionStart' | 'UserPromptSubmit' | 'PreToolUse' | 'PostToolUse' | 'Stop' | 'Notification'

export const HOOK_EVENTS: HookEvent[] = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop', 'Notification']

export const NO_MATCHER_EVENTS: ReadonlySet<HookEvent> = new Set(['UserPromptSubmit', 'Stop'])

export interface Occurrence {
  id: string
  event: HookEvent
  /** Tool name, session source, or notification type, depending on the event. */
  subject?: string
  /** File path or command, for display and conditional behaviours. */
  target?: string
  label: string
}

export interface HookBehaviour {
  id: string
  label: string
  /** Exit code the script returns for an occurrence. */
  exitCode: (o: Occurrence) => 0 | 1 | 2
  /** Whether the script prints something useful on stdout (becomes context where supported). */
  printsContext?: boolean
}

export interface HookConfig {
  event: HookEvent
  matcher: string
  behaviour: HookBehaviour
}

export type Effect = 'skipped' | 'ran' | 'blocked' | 'context' | 'continued' | 'exit2-ignored' | 'error'

export function matcherMatches(matcher: string, subject: string | undefined): boolean {
  const m = matcher.trim()
  if (m === '' || m === '*') return true
  if (subject === undefined) return false
  if (/^[A-Za-z0-9_|]+$/.test(m)) return m.split('|').includes(subject)
  try {
    return new RegExp(`^(?:${m})$`).test(subject)
  } catch {
    return false
  }
}

export function hookEffect(hook: HookConfig, o: Occurrence): Effect {
  if (hook.event !== o.event) return 'skipped'
  if (!NO_MATCHER_EVENTS.has(o.event) && !matcherMatches(hook.matcher, o.subject)) return 'skipped'
  const code = hook.behaviour.exitCode(o)
  if (code === 2) {
    if (o.event === 'PreToolUse') return 'blocked'
    if (o.event === 'Stop') return 'continued'
    if (o.event === 'PostToolUse') return 'exit2-ignored'
    return 'error'
  }
  if (code === 1) return 'error'
  if (hook.behaviour.printsContext && (o.event === 'SessionStart' || o.event === 'UserPromptSubmit')) return 'context'
  return 'ran'
}

export type Expectation = 'runs' | 'blocks' | 'adds-context' | 'silent' | 'not-blocked'

export function meets(effect: Effect, expectation: Expectation): boolean {
  switch (expectation) {
    case 'runs':
      return effect === 'ran' || effect === 'context'
    case 'blocks':
      return effect === 'blocked'
    case 'adds-context':
      return effect === 'context'
    case 'silent':
      return effect === 'skipped'
    case 'not-blocked':
      return effect !== 'blocked' && effect !== 'error'
  }
}

export interface HookGoal {
  id: string
  title: string
  description: string
  matcherOptions: string[]
  behaviours: HookBehaviour[]
  stream: (Occurrence & { expect: Expectation })[]
  /** Shown when the goal is not met. */
  lesson: string
}

export interface HookGoalAnswer {
  event: string
  matcher: string
  behaviour: string
}

export interface HookLabResult extends ChallengeResult {
  goals: { goalId: string; effects: { occurrenceId: string; effect: Effect; ok: boolean }[]; score: number }[]
}

export function simulateHookLab(goals: HookGoal[], answers: Record<string, HookGoalAnswer | undefined>, passScore = 75): HookLabResult {
  const feedback: Feedback[] = []
  const breakdown: ScoreDimension[] = []
  const results = goals.map((goal) => {
    const a = answers[goal.id]
    const behaviour = goal.behaviours.find((b) => b.id === a?.behaviour)
    const event = HOOK_EVENTS.find((e) => e === a?.event)
    const hook: HookConfig | null = a && behaviour && event ? { event, matcher: a.matcher ?? '', behaviour } : null
    const effects = goal.stream.map((o) => {
      const effect: Effect = hook ? hookEffect(hook, o) : 'skipped'
      return { occurrenceId: o.id, effect, ok: meets(effect, o.expect) }
    })
    const score = !hook || goal.stream.length === 0 ? 0 : round((effects.filter((e) => e.ok).length / goal.stream.length) * 100)
    breakdown.push({ id: goal.id, label: goal.title, score })
    if (!hook) {
      feedback.push({ tone: 'warning', title: `${goal.title}: not configured`, body: goal.lesson, concept: 'hooks' })
    } else if (score === 100) {
      feedback.push({ tone: 'positive', title: `${goal.title}: works`, body: `${event} with matcher "${hook.matcher || '*'}" does exactly this.`, concept: 'hooks' })
    } else {
      const firstBad = effects.findIndex((e) => !e.ok)
      const o = goal.stream[firstBad]!
      const e = effects[firstBad]!.effect
      const what: Record<Effect, string> = {
        skipped: 'the hook never ran',
        ran: 'the hook ran',
        context: 'its output was added to the context',
        blocked: 'the action was blocked',
        continued: 'Claude was kept working',
        'exit2-ignored': 'exit code 2 was ignored because the tool had already run',
        error: 'the hook reported an error but did not block anything',
      }
      feedback.push({ tone: 'warning', title: `${goal.title}: not quite`, body: `On "${o.label}", ${what[e]}. ${goal.lesson}`, concept: 'hooks' })
    }
    return { goalId: goal.id, effects, score }
  })
  const score = goals.length === 0 ? 0 : round(results.reduce((s, r) => s + r.score, 0) / goals.length)
  const order = { warning: 0, neutral: 1, positive: 2 } as const
  feedback.sort((x, y) => order[x.tone] - order[y.tone])
  return {
    score,
    passed: score >= passScore,
    breakdown,
    feedback,
    summary: `${results.filter((r) => r.score === 100).length} of ${goals.length} hooks behave exactly as intended.`,
    goals: results,
  }
}
