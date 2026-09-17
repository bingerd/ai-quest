import { defineChallenge } from '../../../engine/types'
import { evaluateScenario } from '../../../simulation/scenario'
import { enterpriseScenario } from '../data/enterpriseScenario'
import { EnterpriseScenario, type ScenarioAnswer } from './EnterpriseScenario'

export const enterpriseChallenge = defineChallenge<ScenarioAnswer>({
  kind: 'scenario',
  component: EnterpriseScenario,
  evaluate(answer) {
    const choices = typeof answer === 'object' && answer !== null && typeof (answer as ScenarioAnswer).choices === 'object' ? (answer as ScenarioAnswer).choices : {}
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(choices)) if (typeof v === 'string') clean[k] = v
    return evaluateScenario(enterpriseScenario, clean)
  },
})
