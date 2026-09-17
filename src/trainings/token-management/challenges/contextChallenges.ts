import { defineChallenge, type ChallengeProps } from '../../../engine/types'
import { simulateContextSelection } from '../../../simulation/contextSelection'
import { contextSurgeonScenario, tokenHeistScenario, type ContextScenario } from '../data/contextScenarios'
import { ContextSelectionChallenge, type ContextSelectionAnswer } from './ContextSelectionChallenge'

function isAnswer(a: unknown): a is ContextSelectionAnswer {
  return typeof a === 'object' && a !== null && Array.isArray((a as ContextSelectionAnswer).selectedIds)
}

function makeContextChallenge(scenario: ContextScenario, board: boolean) {
  return defineChallenge<ContextSelectionAnswer>({
    kind: 'context-selection',
    component: (props: ChallengeProps<ContextSelectionAnswer>) => ContextSelectionChallenge({ ...props, scenario, board }),
    evaluate(answer) {
      const selectedIds = isAnswer(answer) ? answer.selectedIds.filter((id): id is string => typeof id === 'string') : []
      return simulateContextSelection({ items: scenario.items, selectedIds, tokenLimit: scenario.tokenLimit, modelId: scenario.modelId })
    },
  })
}

export const tokenHeistChallenge = makeContextChallenge(tokenHeistScenario, true)
export const contextSurgeonChallenge = makeContextChallenge(contextSurgeonScenario, false)
