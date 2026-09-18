import { round } from './scoring'

/**
 * How a run of visual work eats into a usage limit.
 *
 * A TRAINING SIMULATOR. Anthropic publishes no numbers for this, so none are
 * reproduced here. What it models is the mechanism the documentation does
 * describe: work is redone every time you ask for a change, so scope and the
 * number of iterations are what drive consumption, out of one shared pool.
 *
 * Three habits it is built to teach:
 *   - settle the structure at low fidelity before anything is made to look good
 *   - collect your changes and ask once, instead of one note at a time
 *   - have the design system in place first, or the styling gets redone
 */

export type Fidelity = 'outline' | 'draft' | 'polished'
export type ChangeStyle = 'one-at-a-time' | 'batched'

/** Simulated tokens to produce one slide at each fidelity. */
export const FIDELITY_COST: Record<Fidelity, number> = { outline: 400, draft: 1500, polished: 4000 }
/** Claude re-reads the deck to make any change. Simulated tokens per slide. */
export const CONTEXT_PER_SLIDE = 300
/** A revision redoes roughly this share of the deck. */
export const REVISION_SHARE = 0.3
/** Asking one change at a time takes this many times more turns than collecting them. */
export const DRIP_MULTIPLIER = 3
/** Polishing at the end, once the structure is agreed. */
export const FINAL_POLISH_SHARE = 0.6
/** Restyling the whole deck because the brand was never set up. */
export const BRAND_REWORK_SHARE = 0.5

export interface DesignBurnInput {
  slides: number
  /** The fidelity you ask for on the first pass. */
  fidelity: Fidelity
  changeStyle: ChangeStyle
  /** Whether the organisation's design system is already in place. */
  designSystem: boolean
  /** Rounds of feedback you expect from reviewers. */
  reviewRounds: number
}

export interface DesignBurnResult {
  /** Simulated tokens. */
  total: number
  /** The same job done the most wasteful sensible way. */
  baseline: number
  savedPercent: number
  /** Turns of work, after the drip penalty. */
  effectiveRounds: number
  parts: { id: string; label: string; tokens: number }[]
}

function burn(input: DesignBurnInput): { total: number; effectiveRounds: number; parts: { id: string; label: string; tokens: number }[] } {
  const slides = Math.max(0, Math.round(input.slides))
  const rounds = Math.max(0, Math.round(input.reviewRounds))
  const cost = FIDELITY_COST[input.fidelity]

  const firstPass = slides * cost
  const perRevision = slides * CONTEXT_PER_SLIDE + slides * cost * REVISION_SHARE
  const effectiveRounds = rounds * (input.changeStyle === 'one-at-a-time' ? DRIP_MULTIPLIER : 1)
  const revisions = perRevision * effectiveRounds
  // Anything that did not start polished has to be polished eventually.
  const finalPolish = input.fidelity === 'polished' ? 0 : slides * FIDELITY_COST.polished * FINAL_POLISH_SHARE
  const brandRework = input.designSystem ? 0 : slides * FIDELITY_COST.polished * BRAND_REWORK_SHARE

  const parts = [
    { id: 'first', label: 'First pass', tokens: Math.round(firstPass) },
    { id: 'revisions', label: `Revisions (${effectiveRounds} turn${effectiveRounds === 1 ? '' : 's'})`, tokens: Math.round(revisions) },
    { id: 'polish', label: 'Polishing at the end', tokens: Math.round(finalPolish) },
    { id: 'brand', label: 'Redoing the styling', tokens: Math.round(brandRework) },
  ].filter((p) => p.tokens > 0)

  return { total: Math.round(firstPass + revisions + finalPolish + brandRework), effectiveRounds, parts }
}

export function simulateDesignBurn(input: DesignBurnInput): DesignBurnResult {
  const run = burn(input)
  // The worst sensible way to do the same job: polished from the first prompt,
  // one note at a time, and no design system to hold the styling steady.
  const worst = burn({ ...input, fidelity: 'polished', changeStyle: 'one-at-a-time', designSystem: false })
  const savedPercent = worst.total > 0 ? round(((worst.total - run.total) / worst.total) * 100) : 0

  return {
    total: run.total,
    baseline: worst.total,
    savedPercent: Math.max(0, savedPercent),
    effectiveRounds: run.effectiveRounds,
    parts: run.parts,
  }
}
