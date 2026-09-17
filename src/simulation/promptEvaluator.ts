import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { round, weightedTotal } from './scoring'
import { estimateTokens, formatTokens } from './tokens'

/**
 * Deterministic, rule-based evaluation of a structured prompt.
 * Sections are upper-case headings on their own line: SYSTEM, CONTEXT, TASK, OUTPUT.
 * No LLM is involved: every check is a plain string rule.
 */

export interface PromptExercise {
  /** Placeholders that stand for irrelevant material and must be removed, e.g. "[Employee handbook, 120 pages]". */
  irrelevantMarkers: string[]
  /** Placeholders that must remain. */
  requiredMarkers: string[]
  /** Token count of the original prompt, for the "tokens saved" metric. */
  originalText: string
}

export interface PromptSections {
  system: string
  context: string
  task: string
  output: string
  other: string
}

const SECTION_NAMES = ['SYSTEM', 'CONTEXT', 'TASK', 'OUTPUT'] as const

export function parseSections(text: string): PromptSections {
  const out: PromptSections = { system: '', context: '', task: '', output: '', other: '' }
  let current: keyof PromptSections = 'other'
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    const heading = SECTION_NAMES.find((n) => line === n || line === `${n}:`)
    if (heading) {
      current = heading.toLowerCase() as keyof PromptSections
      continue
    }
    out[current] += `${rawLine}\n`
  }
  for (const k of Object.keys(out) as (keyof PromptSections)[]) out[k] = out[k].trim()
  return out
}

const SENSITIVE_PATTERNS: { label: string; re: RegExp }[] = [
  { label: 'a password', re: /password\s*[:=]\s*\S+/i },
  { label: 'an API key', re: /\b(sk|api|key|token)[-_][A-Za-z0-9]{12,}\b/i },
  { label: 'an IBAN', re: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/ },
  { label: 'a card number', re: /\b(?:\d[ -]?){15,16}\b/ },
]

const FORMAT_WORDS = /\b(bullet|bullets|table|json|words|sentences|paragraph|paragraphs|list|format|number|one line|markdown|csv)\b/i

export function evaluatePrompt(text: string, exercise: PromptExercise): ChallengeResult {
  const s = parseSections(text)
  const lower = text.toLowerCase()
  const feedback: Feedback[] = []
  const dims: ScoreDimension[] = []

  const check = (id: string, label: string, ok: boolean, weight: number, good: Feedback, bad: Feedback) => {
    dims.push({ id, label, score: ok ? 100 : 0, weight })
    feedback.push(ok ? good : bad)
  }

  const missingRequired = exercise.requiredMarkers.filter((m) => !lower.includes(m.toLowerCase()))
  check(
    'retained',
    'Relevant context kept',
    missingRequired.length === 0,
    3,
    { tone: 'positive', title: 'The relevant source is still there', body: 'The one document that actually answers the question stayed in context.' },
    { tone: 'warning', title: `Missing: ${missingRequired.join(', ')}`, body: 'Trimming is only a win if the answer is still in context. Put the relevant source back.', concept: 'completeness' },
  )

  const leftover = exercise.irrelevantMarkers.filter((m) => lower.includes(m.toLowerCase()))
  check(
    'irrelevant',
    'Irrelevant context removed',
    leftover.length === 0,
    3,
    { tone: 'positive', title: 'Irrelevant material removed', body: 'Nothing in the context is there "just in case".' },
    { tone: 'warning', title: `Still included: ${leftover.join(', ')}`, body: 'These do not help answer the question. Every request would pay for them.', concept: 'context-pollution' },
  )

  check(
    'task',
    'Task clearly specified',
    s.task.replace(/\s+/g, ' ').length >= 40,
    2,
    { tone: 'positive', title: 'The task is specific', body: 'A clear task keeps the answer on target and short.' },
    { tone: 'warning', title: 'The task is vague or missing', body: 'Say exactly what you want answered. "Answer the user\'s question" leaves the model guessing.', concept: 'task-clarity' },
  )

  const hasOutput = s.output.length >= 8 || FORMAT_WORDS.test(s.task)
  check(
    'output',
    'Output requirements set',
    hasOutput,
    2,
    { tone: 'positive', title: 'Output shape is defined', body: 'Constraining the answer length and format is the cheapest way to save output tokens.' },
    { tone: 'warning', title: 'No output requirements', body: 'Add an OUTPUT section: how long, what format, what to include. Unbounded answers cost the most.', concept: 'output-tokens' },
  )

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l.length > 20)
  const dupes = lines.filter((l, i) => lines.indexOf(l) !== i)
  check(
    'repetition',
    'No repetition',
    dupes.length === 0,
    1,
    { tone: 'positive', title: 'Nothing is said twice', body: 'Repeated instructions add tokens, not emphasis.' },
    { tone: 'warning', title: 'Repeated content', body: `"${dupes[0]?.slice(0, 60)}…" appears more than once. Say it once, clearly.`, concept: 'repetition' },
  )

  const sensitive = SENSITIVE_PATTERNS.filter((p) => p.re.test(text))
  check(
    'sensitive',
    'No sensitive data',
    sensitive.length === 0,
    3,
    { tone: 'positive', title: 'No secrets in the prompt', body: 'Credentials and personal data never belong in context.' },
    { tone: 'warning', title: `The prompt contains ${sensitive.map((p) => p.label).join(' and ')}`, body: 'Anything you put in a prompt may be logged or retained. Remove secrets and personal identifiers.', concept: 'security' },
  )

  const before = estimateTokens(exercise.originalText)
  const after = estimateTokens(text)
  const score = weightedTotal(dims)
  feedback.sort((a, b) => Number(a.tone === 'positive') - Number(b.tone === 'positive'))

  return {
    score,
    passed: score >= 60,
    breakdown: dims,
    feedback,
    summary:
      score === 100
        ? `Clean prompt. ${formatTokens(before - after)} simulated tokens saved per request.`
        : `${dims.filter((d) => d.score === 100).length} of ${dims.length} checks passed.`,
    metrics: { tokensBefore: before, tokensAfter: after, tokensSaved: Math.max(0, before - after), savedPercent: before === 0 ? 0 : round(((before - after) / before) * 100) },
  }
}
