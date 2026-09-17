import type { ChallengeResult } from '../engine/types'
import { fail, partial, pass, runRules, type Rule } from './ruleChecker'

/**
 * A request ("brief") assembled from blocks, each with a chosen option.
 * Options carry a quality level; rules score the brief deterministically and a
 * templated outline shows what a request like this tends to produce.
 * No model is involved: the outline is picked from fixed templates.
 */

export type OptionQuality = 'missing' | 'weak' | 'strong'

export interface BriefOption {
  id: string
  /** The text this option adds to the request. Empty for "missing". */
  text: string
  quality: OptionQuality
}

export interface BriefBlock {
  id: string
  label: string
  weight: number
  options: BriefOption[]
  /** Feedback when the block is strong / weak / missing. */
  strong: [string, string]
  weak: [string, string]
  missing: [string, string]
  concept?: string
}

export interface BriefSpec {
  blocks: BriefBlock[]
  /** Outline lines keyed by quality of the block that most shapes the output. */
  outline: { generic: string[]; partial: string[]; specific: string[] }
  passScore?: number
}

export type BriefChoices = Record<string, string>

export function optionFor(block: BriefBlock, choices: BriefChoices): BriefOption {
  const chosen = block.options.find((o) => o.id === choices[block.id])
  return chosen ?? block.options.find((o) => o.quality === 'missing') ?? block.options[0]!
}

export function briefText(spec: BriefSpec, choices: BriefChoices): string {
  return spec.blocks
    .map((b) => optionFor(b, choices).text)
    .filter((t) => t.length > 0)
    .join(' ')
}

export function evaluateBrief(spec: BriefSpec, choices: BriefChoices): ChallengeResult & { outline: string[]; text: string } {
  const rules: Rule<BriefChoices>[] = spec.blocks.map((block) => ({
    id: block.id,
    label: block.label,
    weight: block.weight,
    run: (c) => {
      const q = optionFor(block, c).quality
      if (q === 'strong') return pass(block.strong[0], block.strong[1], block.concept)
      if (q === 'weak') return partial(block.weak[0], block.weak[1], 50, block.concept)
      return fail(block.missing[0], block.missing[1], block.concept)
    },
  }))
  const result = runRules(choices, rules, { passScore: spec.passScore ?? 70 })
  const outline = result.score >= 80 ? spec.outline.specific : result.score >= 45 ? spec.outline.partial : spec.outline.generic
  return { ...result, outline, text: briefText(spec, choices) }
}

export function parseBriefChoices(answer: unknown): BriefChoices {
  const raw = typeof answer === 'object' && answer !== null ? (answer as { choices?: unknown }).choices : null
  if (typeof raw !== 'object' || raw === null) return {}
  const out: BriefChoices = {}
  for (const [k, v] of Object.entries(raw)) if (typeof v === 'string') out[k] = v
  return out
}
