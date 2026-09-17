import { defineChallenge } from '../../../engine/types'
import { evaluatePrompt } from '../../../simulation/promptEvaluator'
import { promptExercise } from '../data/promptExercise'
import { PromptSurgery, type PromptAnswer } from './PromptSurgery'

export const promptSurgeryChallenge = defineChallenge<PromptAnswer>({
  kind: 'prompt-editor',
  component: PromptSurgery,
  evaluate(answer) {
    const text = typeof answer === 'object' && answer !== null && typeof (answer as PromptAnswer).text === 'string' ? (answer as PromptAnswer).text : ''
    return evaluatePrompt(text, promptExercise)
  },
})
