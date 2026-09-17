import { defineChallenge, type ChallengeResult, type Feedback } from '../../../engine/types'
import { simulateModelSelection } from '../../../simulation/modelSelection'
import { getModel } from '../../../simulation/models'
import { modelScenarios } from '../data/modelScenarios'
import { ModelSelectionChallenge, type ModelSelectionAnswer } from './ModelSelectionChallenge'

function isAnswer(a: unknown): a is ModelSelectionAnswer {
  const choices = typeof a === 'object' && a !== null ? (a as ModelSelectionAnswer).choices : null
  return typeof choices === 'object' && choices !== null
}

/** Aggregate: each scenario is scored by the model simulation; the total is the mean. */
export function evaluateModelChoices(answer: unknown): ChallengeResult {
  const choices = isAnswer(answer) ? answer.choices : {}
  const rounds = modelScenarios.map((s) => {
    const modelId = choices[s.id]
    const valid = typeof modelId === 'string' && (() => {
      try {
        getModel(modelId)
        return true
      } catch {
        return false
      }
    })()
    return { scenario: s, result: valid ? simulateModelSelection(s, modelId) : null }
  })
  const breakdown = rounds.map((r) => ({ id: r.scenario.id, label: r.scenario.title, score: r.result?.score ?? 0 }))
  const score = Math.round(breakdown.reduce((s, d) => s + d.score, 0) / Math.max(1, breakdown.length))
  const fits = rounds.filter((r) => r.result?.outcome.viable).length
  const feedback: Feedback[] = [
    {
      tone: fits === rounds.length ? 'positive' : 'neutral',
      title: `${fits} of ${rounds.length} workloads landed on a model that met every constraint`,
      body: 'Neither "always the cheapest" nor "always the best" wins. The right model is the cheapest one that clears the quality bar within the latency and budget limits.',
      concept: 'model-selection',
    },
    ...rounds
      .filter((r) => r.result && !r.result.outcome.viable)
      .map<Feedback>((r) => ({
        tone: 'warning',
        title: `${r.scenario.title}: ${getModel(r.result!.outcome.modelId).name} did not fit`,
        body: r.result!.feedback[0]?.body ?? '',
        concept: 'model-selection',
      })),
  ]
  return { score, passed: score >= 60, breakdown, feedback, summary: `Average simulation score across ${rounds.length} workloads: ${score}` }
}

export const modelSelectionChallenge = defineChallenge<ModelSelectionAnswer>({
  kind: 'model-selection',
  component: ModelSelectionChallenge,
  evaluate: evaluateModelChoices,
})
