import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { clamp, round, weightedTotal } from './scoring'

/**
 * Eval suite simulation: you change a prompt or model, and a set of regressions is
 * introduced. Whether your suite catches them depends on which case types you
 * included, how many cases you run, and how they are graded.
 * Guidance source: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
 */

export type CaseType = 'happy' | 'edge' | 'adversarial' | 'regression'
export type Grader = 'code' | 'llm' | 'human'
export type SampleSize = 'small' | 'medium' | 'large'

export const SAMPLE_CASES: Record<SampleSize, number> = { small: 10, medium: 100, large: 1_000 }

export interface FailureMode {
  id: string
  label: string
  /** Which kind of case surfaces it. */
  surfacedBy: CaseType
  /** Share of inputs affected, 0..1. */
  frequency: number
  /** Graders able to detect it. */
  detectableBy: Grader[]
  critical: boolean
  consequence: string
}

export interface EvalSuiteInput {
  failureModes: FailureMode[]
  caseTypes: CaseType[]
  sampleSize: SampleSize
  grader: Grader
  /** Minutes and cost per graded case, per grader. */
  passScore?: number
}

export const GRADER_COST: Record<Grader, { perCase: number; minutesPerCase: number; label: string }> = {
  code: { perCase: 0.0002, minutesPerCase: 0.001, label: 'Code-based checks' },
  llm: { perCase: 0.01, minutesPerCase: 0.02, label: 'A model grading the output' },
  human: { perCase: 1.5, minutesPerCase: 3, label: 'A person reading every case' },
}

export interface EvalResult extends ChallengeResult {
  caught: FailureMode[]
  missed: FailureMode[]
  metrics: Record<string, number>
}

export function simulateEvalSuite(input: EvalSuiteInput): EvalResult {
  const cases = SAMPLE_CASES[input.sampleSize]
  const types = new Set(input.caseTypes)
  const caught: FailureMode[] = []
  const missed: FailureMode[] = []

  for (const mode of input.failureModes) {
    const inSuite = types.has(mode.surfacedBy)
    const enoughCases = mode.frequency * cases >= 1
    const canDetect = mode.detectableBy.includes(input.grader)
    if (inSuite && enoughCases && canDetect) caught.push(mode)
    else missed.push(mode)
  }

  const criticals = input.failureModes.filter((m) => m.critical)
  const criticalCaught = caught.filter((m) => m.critical)
  const coverage = criticals.length === 0 ? 100 : (criticalCaught.length / criticals.length) * 100
  const allCoverage = input.failureModes.length === 0 ? 100 : (caught.length / input.failureModes.length) * 100
  const cost = cases * GRADER_COST[input.grader].perCase
  const minutes = cases * GRADER_COST[input.grader].minutesPerCase
  // A suite you cannot run on every change is a suite you will skip.
  const practicality = clamp(minutes <= 10 ? 100 : minutes <= 60 ? 70 : minutes <= 240 ? 35 : 10)

  const breakdown: ScoreDimension[] = [
    { id: 'critical', label: 'Critical regressions caught', score: round(coverage), weight: 4 },
    { id: 'coverage', label: 'All regressions caught', score: round(allCoverage), weight: 2 },
    { id: 'practicality', label: 'Fast enough to run every time', score: practicality, weight: 2 },
  ]
  let score = weightedTotal(breakdown)
  if (criticalCaught.length < criticals.length) score = Math.min(score, 55)

  const feedback: Feedback[] = []
  for (const m of missed.filter((x) => x.critical)) {
    const why = !types.has(m.surfacedBy)
      ? `Your suite has no ${m.surfacedBy} cases, which is where this shows up.`
      : m.frequency * cases < 1
        ? `It affects about ${Math.round(m.frequency * 1000) / 10}% of inputs, so ${cases} cases are unlikely to include one.`
        : `${GRADER_COST[input.grader].label} cannot tell the difference here.`
    feedback.push({ tone: 'warning', title: `Shipped: ${m.label}`, body: `${why} ${m.consequence}`, concept: 'evals' })
  }
  for (const m of missed.filter((x) => !x.critical)) {
    feedback.push({ tone: 'neutral', title: `Missed: ${m.label}`, body: m.consequence, concept: 'evals' })
  }
  if (practicality < 70) {
    feedback.push({ tone: 'warning', title: `The suite takes about ${Math.round(minutes)} minutes per run`, body: 'A suite that slow gets run "when there is time", which means before releases at best. Prefer many code-graded cases, and keep a small human-reviewed sample.', concept: 'evals' })
  }
  if (caught.length === input.failureModes.length && practicality >= 70) {
    feedback.push({ tone: 'positive', title: 'Every regression was caught before release', body: 'Specific, measurable cases that mirror real traffic, graded automatically, cheap enough to run on every change.', concept: 'evals' })
  }
  return {
    score,
    passed: score >= (input.passScore ?? 75),
    breakdown,
    feedback,
    summary: `${caught.length} of ${input.failureModes.length} regressions caught, ${criticals.length - criticalCaught.length} critical one${criticals.length - criticalCaught.length === 1 ? '' : 's'} reached production.`,
    caught,
    missed,
    metrics: { cases, cost: round(cost, 4), minutes: round(minutes, 2), caught: caught.length },
  }
}
