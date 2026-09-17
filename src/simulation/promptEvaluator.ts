import type { ChallengeResult } from '../engine/types'
import { duplicateLines, fail, pass, runRules, sensitiveMatches, simpleRule, type Rule } from './ruleChecker'
import { round } from './scoring'
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

const FORMAT_WORDS = /\b(bullet|bullets|table|json|words|sentences|paragraph|paragraphs|list|format|number|one line|markdown|csv)\b/i

interface PromptInput {
  text: string
  lower: string
  sections: PromptSections
  exercise: PromptExercise
}

const PROMPT_RULES: Rule<PromptInput>[] = [
  {
    id: 'retained',
    label: 'Relevant context kept',
    weight: 3,
    run: ({ lower, exercise }) => {
      const missing = exercise.requiredMarkers.filter((m) => !lower.includes(m.toLowerCase()))
      return missing.length === 0
        ? pass('The relevant source is still there', 'The one document that actually answers the question stayed in context.')
        : fail(`Missing: ${missing.join(', ')}`, 'Trimming is only a win if the answer is still in context. Put the relevant source back.', 'completeness')
    },
  },
  {
    id: 'irrelevant',
    label: 'Irrelevant context removed',
    weight: 3,
    run: ({ lower, exercise }) => {
      const leftover = exercise.irrelevantMarkers.filter((m) => lower.includes(m.toLowerCase()))
      return leftover.length === 0
        ? pass('Irrelevant material removed', 'Nothing in the context is there "just in case".')
        : fail(`Still included: ${leftover.join(', ')}`, 'These do not help answer the question. Every request would pay for them.', 'context-pollution')
    },
  },
  simpleRule<PromptInput>(
    'task',
    'Task clearly specified',
    2,
    ({ sections }) => sections.task.replace(/\s+/g, ' ').length >= 40,
    ['The task is specific', 'A clear task keeps the answer on target and short.'],
    ['The task is vague or missing', 'Say exactly what you want answered. "Answer the user\'s question" leaves the model guessing.'],
    'task-clarity',
  ),
  simpleRule<PromptInput>(
    'output',
    'Output requirements set',
    2,
    ({ sections }) => sections.output.length >= 8 || FORMAT_WORDS.test(sections.task),
    ['Output shape is defined', 'Constraining the answer length and format is the cheapest way to save output tokens.'],
    ['No output requirements', 'Add an OUTPUT section: how long, what format, what to include. Unbounded answers cost the most.'],
    'output-tokens',
  ),
  {
    id: 'repetition',
    label: 'No repetition',
    weight: 1,
    run: ({ text }) => {
      const dupes = duplicateLines(text)
      return dupes.length === 0
        ? pass('Nothing is said twice', 'Repeated instructions add tokens, not emphasis.')
        : fail('Repeated content', `"${dupes[0]?.slice(0, 60)}…" appears more than once. Say it once, clearly.`, 'repetition')
    },
  },
  {
    id: 'sensitive',
    label: 'No sensitive data',
    weight: 3,
    run: ({ text }) => {
      const found = sensitiveMatches(text)
      return found.length === 0
        ? pass('No secrets in the prompt', 'Credentials and personal data never belong in context.')
        : fail(`The prompt contains ${found.join(' and ')}`, 'Anything you put in a prompt may be logged or retained. Remove secrets and personal identifiers.', 'security')
    },
  },
]

export function evaluatePrompt(text: string, exercise: PromptExercise): ChallengeResult {
  const before = estimateTokens(exercise.originalText)
  const after = estimateTokens(text)
  const result = runRules({ text, lower: text.toLowerCase(), sections: parseSections(text), exercise }, PROMPT_RULES, {
    summary: (passed, total, score) =>
      score === 100 ? `Clean prompt. ${formatTokens(before - after)} simulated tokens saved per request.` : `${passed} of ${total} checks passed.`,
  })
  return {
    ...result,
    metrics: { tokensBefore: before, tokensAfter: after, tokensSaved: Math.max(0, before - after), savedPercent: before === 0 ? 0 : round(((before - after) / before) * 100) },
  }
}
