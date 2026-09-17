import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { round, weightedTotal } from './scoring'

/**
 * Generic "assemble a setup" scoring: single-choice parts and include/exclude
 * checklists, each weighted, with gates so one critical mistake cannot be averaged away.
 */

export interface CompositeOption {
  id: string
  label: string
  detail?: string
  score: number
  explanation: string
  /** Cap the total at this score when chosen. */
  cap?: number
}

export interface ChoicePart {
  kind: 'choice'
  id: string
  label: string
  question: string
  weight: number
  options: CompositeOption[]
}

export interface ChecklistItem {
  id: string
  label: string
  detail?: string
  shouldInclude: boolean
  explanation: string
  /** Getting this item wrong caps the total. */
  cap?: number
}

export interface ChecklistPart {
  kind: 'checklist'
  id: string
  label: string
  question: string
  weight: number
  items: ChecklistItem[]
}

export type CompositePart = ChoicePart | ChecklistPart

export interface CompositeSpec {
  parts: CompositePart[]
  passScore?: number
  summaries?: { excellent: string; pass: string; fail: string }
}

export interface CompositeAnswer {
  choices: Record<string, string>
  checks: Record<string, string[]>
}

export interface CompositeResult extends ChallengeResult {
  narrative: string[]
}

export function simulateComposite(spec: CompositeSpec, answer: CompositeAnswer): CompositeResult {
  const breakdown: ScoreDimension[] = []
  const warnings: Feedback[] = []
  const notes: Feedback[] = []
  const positives: Feedback[] = []
  const narrative: string[] = []
  let cap = 100

  for (const part of spec.parts) {
    if (part.kind === 'choice') {
      const option = part.options.find((o) => o.id === answer.choices[part.id])
      breakdown.push({ id: part.id, label: part.label, score: option?.score ?? 0, weight: part.weight })
      if (!option) {
        warnings.push({ tone: 'warning', title: `${part.label}: no choice made`, body: part.question })
        cap = Math.min(cap, (spec.passScore ?? 70) - 1)
        continue
      }
      if (option.cap !== undefined) cap = Math.min(cap, option.cap)
      narrative.push(`${part.label}: ${option.label}.`)
      const fb: Feedback = { tone: option.score >= 80 ? 'positive' : option.score >= 50 ? 'neutral' : 'warning', title: `${part.label}: ${option.label}`, body: option.explanation }
      ;(fb.tone === 'warning' ? warnings : fb.tone === 'neutral' ? notes : positives).push(fb)
    } else {
      const selected = new Set(answer.checks[part.id] ?? [])
      let right = 0
      for (const item of part.items) {
        const included = selected.has(item.id)
        if (included === item.shouldInclude) {
          right += 1
          continue
        }
        if (item.cap !== undefined) cap = Math.min(cap, item.cap)
        warnings.push({
          tone: 'warning',
          title: included ? `${part.label}: "${item.label}" should be left out` : `${part.label}: "${item.label}" is missing`,
          body: item.explanation,
        })
      }
      const score = part.items.length === 0 ? 100 : round((right / part.items.length) * 100)
      breakdown.push({ id: part.id, label: part.label, score, weight: part.weight })
      narrative.push(`${part.label}: ${selected.size} item${selected.size === 1 ? '' : 's'} included, ${right} of ${part.items.length} decisions right.`)
      if (score === 100) positives.push({ tone: 'positive', title: `${part.label}: spot on`, body: 'Every item is in or out for the right reason.' })
    }
  }

  const passScore = spec.passScore ?? 70
  const score = Math.min(weightedTotal(breakdown), cap)
  const s = spec.summaries ?? { excellent: 'Excellent setup.', pass: 'A solid setup with room to improve.', fail: 'This setup would cause problems.' }
  return {
    score,
    passed: score >= passScore,
    breakdown,
    feedback: [...warnings, ...notes, ...positives],
    summary: score >= 90 ? s.excellent : score >= passScore ? s.pass : s.fail,
    narrative,
  }
}

export function parseCompositeAnswer(answer: unknown): CompositeAnswer {
  const o = (typeof answer === 'object' && answer !== null ? answer : {}) as { choices?: unknown; checks?: unknown }
  const choices: Record<string, string> = {}
  if (typeof o.choices === 'object' && o.choices !== null) for (const [k, v] of Object.entries(o.choices)) if (typeof v === 'string') choices[k] = v
  const checks: Record<string, string[]> = {}
  if (typeof o.checks === 'object' && o.checks !== null)
    for (const [k, v] of Object.entries(o.checks)) if (Array.isArray(v)) checks[k] = v.filter((x): x is string => typeof x === 'string')
  return { choices, checks }
}
