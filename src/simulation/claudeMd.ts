import type { ChallengeResult } from '../engine/types'
import { duplicateLines, fail, pass, runRules, sensitiveMatches, type Rule } from './ruleChecker'
import { round } from './scoring'
import { estimateTokens, formatTokens } from './tokens'

/**
 * Rule-based review of a CLAUDE.md. CLAUDE.md loads into every session, so every
 * line is paid for every time. Placeholders like "[Full API reference pasted here]"
 * stand for large pasted content and carry a simulated token weight.
 * Source: https://code.claude.com/docs/en/memory
 */

export interface ClaudeMdExercise {
  original: string
  /** Text that must remain (project-specific facts Claude cannot guess). */
  requiredMarkers: { marker: string; label: string }[]
  /** Pasted blocks that should be replaced by an @import, with their simulated token weight. */
  pastedBlocks: { marker: string; label: string; tokens: number }[]
  /** Personal preferences that belong in ~/.claude/CLAUDE.md or CLAUDE.local.md. */
  personalMarkers: string[]
  /** Generic advice that adds tokens but no information. */
  fillerPhrases: string[]
  /** Simulated tokens per session considered lean for this project. */
  tokenBudget: number
}

export function sessionTokens(text: string, exercise: ClaudeMdExercise): number {
  const lower = text.toLowerCase()
  return estimateTokens(text) + exercise.pastedBlocks.filter((b) => lower.includes(b.marker.toLowerCase())).reduce((s, b) => s + b.tokens, 0)
}

const SECRET_RE = /\b(sk_(live|test)_[A-Za-z0-9]+|[A-Z_]*SECRET[A-Z_]*\s*=\s*\S+)/

export function evaluateClaudeMd(text: string, exercise: ClaudeMdExercise): ChallengeResult {
  const lower = text.toLowerCase()
  const rules: Rule<string>[] = [
    {
      id: 'facts',
      label: 'Project facts kept',
      weight: 3,
      run: () => {
        const missing = exercise.requiredMarkers.filter((m) => !lower.includes(m.marker.toLowerCase()))
        return missing.length === 0
          ? pass('Commands and conventions are still there', 'These are the things Claude cannot guess from the code: exactly the right content for CLAUDE.md.')
          : fail(`Removed something Claude needs: ${missing.map((m) => m.label).join(', ')}`, 'Trim the noise, not the facts. Commands and project conventions are why CLAUDE.md exists.', 'claude-md')
      },
    },
    {
      id: 'secrets',
      label: 'No secrets',
      weight: 3,
      run: (t) => {
        const found = SECRET_RE.test(t) || sensitiveMatches(t).length > 0
        return found
          ? fail('A secret is in CLAUDE.md', 'CLAUDE.md is committed and loaded into every session. Keys belong in your environment or a secrets manager, never in memory files.', 'security')
          : pass('No secrets', 'Nothing sensitive is committed or loaded into context.')
      },
    },
    {
      id: 'imports',
      label: 'Long docs imported, not pasted',
      weight: 2,
      run: () => {
        const pasted = exercise.pastedBlocks.filter((b) => lower.includes(b.marker.toLowerCase()))
        const hasImport = /(^|\s)@[\w./-]+\.md\b/m.test(text)
        if (pasted.length > 0) return fail(`Still pasted: ${pasted.map((b) => b.label).join(', ')}`, `That is ${formatTokens(pasted.reduce((s, b) => s + b.tokens, 0))} simulated tokens in every session. Move it to its own file and reference it with an @path import.`, 'claude-md-imports')
        if (!hasImport) return fail('The reference docs are gone entirely', 'Removing the paste is good, but point Claude at the docs with an @path import (for example @docs/api.md) so they stay reachable.', 'claude-md-imports')
        return pass('Referenced with an @import', 'The details live in their own file and CLAUDE.md stays short.')
      },
    },
    {
      id: 'personal',
      label: 'Personal preferences moved out',
      weight: 1,
      run: () => {
        const found = exercise.personalMarkers.filter((m) => lower.includes(m.toLowerCase()))
        return found.length > 0
          ? fail('Personal preferences in the team file', 'Your editor and theme are not your teammates’. Put personal notes in ~/.claude/CLAUDE.md or CLAUDE.local.md.', 'claude-md-scope')
          : pass('Team file, team content', 'Personal preferences are out of the shared project memory.')
      },
    },
    {
      id: 'filler',
      label: 'No generic filler',
      weight: 2,
      run: () => {
        const found = exercise.fillerPhrases.filter((p) => lower.includes(p.toLowerCase()))
        return found.length > 0
          ? fail('Generic advice that adds nothing', `"${found[0]}" tells Claude nothing about this project. Every session pays for it.`, 'claude-md')
          : pass('Every line is specific', 'No generic advice that Claude would follow anyway.')
      },
    },
    {
      id: 'repetition',
      label: 'No repetition',
      weight: 1,
      run: (t) => (duplicateLines(t).length > 0 ? fail('Something is said twice', 'Repeating an instruction does not make it stronger. Say it once.') : pass('Nothing repeated', 'Each instruction appears once.')),
    },
    {
      id: 'budget',
      label: 'Lean enough to load every session',
      weight: 2,
      run: (t) => {
        const tokens = sessionTokens(t, exercise)
        return tokens <= exercise.tokenBudget
          ? pass(`${formatTokens(tokens)} simulated tokens per session`, 'Short memory files load fast and leave room for the actual work.')
          : fail(`${formatTokens(tokens)} simulated tokens per session`, `Aim for under ${formatTokens(exercise.tokenBudget)}. Anthropic suggests keeping each CLAUDE.md under about 200 lines.`, 'claude-md')
      },
    },
  ]
  const before = sessionTokens(exercise.original, exercise)
  const after = sessionTokens(text, exercise)
  const result = runRules(text, rules, { passScore: 80 })
  return {
    ...result,
    metrics: { tokensBefore: before, tokensAfter: after, savedPercent: before === 0 ? 0 : round(((before - after) / before) * 100) },
  }
}
