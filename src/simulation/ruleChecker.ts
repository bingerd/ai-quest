import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { weightedTotal } from './scoring'

/**
 * Data-driven checks: each rule inspects the input and returns pass/fail with
 * feedback. Used for prompts, briefs and CLAUDE.md files. Deterministic, no LLM.
 */

export interface RuleOutcome {
  ok: boolean
  feedback: Feedback
  /** Optional partial credit 0..100. Defaults to 100 when ok, 0 otherwise. */
  score?: number
}

export interface Rule<TInput> {
  id: string
  label: string
  /** Relative weight in the total. Defaults to 1. */
  weight?: number
  run(input: TInput): RuleOutcome
}

export interface RuleRunOptions {
  passScore?: number
  /** Optional summary builder; receives the number of passed rules. */
  summary?: (passed: number, total: number, score: number) => string
}

export function pass(title: string, body: string, concept?: string): RuleOutcome {
  return { ok: true, feedback: { tone: 'positive', title, body, ...(concept ? { concept } : {}) } }
}

export function fail(title: string, body: string, concept?: string): RuleOutcome {
  return { ok: false, feedback: { tone: 'warning', title, body, ...(concept ? { concept } : {}) } }
}

/** Not wrong, not right: half credit by default. */
export function partial(title: string, body: string, score = 50, concept?: string): RuleOutcome {
  return { ok: false, score, feedback: { tone: 'neutral', title, body, ...(concept ? { concept } : {}) } }
}

/** Build a rule from a boolean test plus fixed pass/fail messages. */
export function simpleRule<TInput>(
  id: string,
  label: string,
  weight: number,
  test: (input: TInput) => boolean,
  passMsg: [string, string],
  failMsg: [string, string],
  concept?: string,
): Rule<TInput> {
  return {
    id,
    label,
    weight,
    run: (input) => (test(input) ? pass(passMsg[0], passMsg[1], concept) : fail(failMsg[0], failMsg[1], concept)),
  }
}

export function runRules<TInput>(input: TInput, rules: Rule<TInput>[], options: RuleRunOptions = {}): ChallengeResult {
  const outcomes = rules.map((r) => ({ rule: r, outcome: r.run(input) }))
  const breakdown: ScoreDimension[] = outcomes.map(({ rule, outcome }) => ({
    id: rule.id,
    label: rule.label,
    score: outcome.score ?? (outcome.ok ? 100 : 0),
    weight: rule.weight ?? 1,
  }))
  const score = weightedTotal(breakdown)
  const passed = outcomes.filter((o) => o.outcome.ok).length
  // Failures first, keeping rule order within each group.
  const feedback = [...outcomes.filter((o) => !o.outcome.ok), ...outcomes.filter((o) => o.outcome.ok)].map((o) => o.outcome.feedback)
  return {
    score,
    passed: score >= (options.passScore ?? 60),
    breakdown,
    feedback,
    summary: options.summary ? options.summary(passed, rules.length, score) : `${passed} of ${rules.length} checks passed.`,
  }
}

/** Lines longer than `minLength` that appear more than once (case-insensitive). */
export function duplicateLines(text: string, minLength = 20): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l.length > minLength)
  return [...new Set(lines.filter((l, i) => lines.indexOf(l) !== i))]
}

export const SENSITIVE_PATTERNS: { label: string; re: RegExp }[] = [
  { label: 'a password', re: /password\s*[:=]\s*\S+/i },
  { label: 'an API key', re: /\b(sk|api|key|token)[-_][A-Za-z0-9]{12,}\b/i },
  { label: 'an IBAN', re: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/ },
  { label: 'a card number', re: /\b(?:\d[ -]?){15,16}\b/ },
]

export function sensitiveMatches(text: string): string[] {
  return SENSITIVE_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.label)
}
