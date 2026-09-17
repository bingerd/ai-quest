import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { clamp, round, weightedTotal } from './scoring'

/**
 * Generic decision-point scenario engine. A scenario is an ordered list of
 * decisions; each option carries a fixed simulated outcome. Deterministic.
 */

export interface ScenarioDimension {
  id: string
  label: string
  weight?: number
}

export interface DecisionOption {
  id: string
  label: string
  detail?: string
  outcome: {
    /** 0..100 how good this decision is. */
    score: number
    /** What happens next, shown after deciding. */
    consequence: string
    /** Dimensions this decision affects. */
    dimensions: string[]
    concept?: string
  }
}

export interface DecisionPoint {
  id: string
  title: string
  situation: string
  question: string
  options: DecisionOption[]
}

export interface Scenario {
  id: string
  title: string
  intro: string
  dimensions: ScenarioDimension[]
  decisions: DecisionPoint[]
}

export interface ScenarioStep {
  decisionId: string
  optionId: string | null
  score: number
  consequence: string
}

export interface ScenarioResult extends ChallengeResult {
  steps: ScenarioStep[]
}

export function evaluateScenario(scenario: Scenario, choices: Record<string, string>): ScenarioResult {
  const steps: ScenarioStep[] = []
  const perDimension = new Map<string, number[]>()
  const feedback: Feedback[] = []

  for (const decision of scenario.decisions) {
    const optionId = choices[decision.id]
    const option = decision.options.find((o) => o.id === optionId)
    if (!option) {
      steps.push({ decisionId: decision.id, optionId: null, score: 0, consequence: 'No decision was made.' })
      for (const d of scenario.dimensions) perDimension.set(d.id, [...(perDimension.get(d.id) ?? []), 0])
      feedback.push({ tone: 'warning', title: `${decision.title}: no decision`, body: 'Not deciding is a decision too, usually the most expensive one.' })
      continue
    }
    const score = clamp(option.outcome.score)
    steps.push({ decisionId: decision.id, optionId: option.id, score, consequence: option.outcome.consequence })
    for (const dim of option.outcome.dimensions) perDimension.set(dim, [...(perDimension.get(dim) ?? []), score])
    feedback.push({
      tone: score >= 80 ? 'positive' : score >= 50 ? 'neutral' : 'warning',
      title: `${decision.title}: ${option.label}`,
      body: option.outcome.consequence,
      ...(option.outcome.concept ? { concept: option.outcome.concept } : {}),
    })
  }

  const breakdown: ScoreDimension[] = scenario.dimensions.map((d) => {
    const values = perDimension.get(d.id) ?? []
    const score = values.length === 0 ? 100 : values.reduce((a, b) => a + b, 0) / values.length
    return { id: d.id, label: d.label, score: round(score), ...(d.weight !== undefined ? { weight: d.weight } : {}) }
  })
  const decided = steps.filter((s) => s.optionId !== null).length
  const score = weightedTotal(breakdown)
  return {
    score,
    passed: score >= 60,
    breakdown,
    feedback,
    summary:
      decided < steps.length
        ? `${decided} of ${steps.length} situations handled.`
        : score >= 85
          ? 'Your organisation is in good hands.'
          : score >= 60
            ? 'Reasonable calls, with a few expensive habits left in place.'
            : 'Several of these decisions would cost the organisation dearly.',
    steps,
  }
}
