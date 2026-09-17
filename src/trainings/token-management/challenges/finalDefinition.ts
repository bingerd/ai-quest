import { defineChallenge } from '../../../engine/types'
import { simulateFinalChallenge, type FinalAnswer } from '../../../simulation/finalChallenge'
import { finalScenario } from '../data/finalScenario'
import { FinalChallenge } from './FinalChallenge'

function sanitize(a: unknown): FinalAnswer {
  const o = (typeof a === 'object' && a !== null ? a : {}) as Partial<FinalAnswer>
  return {
    modelId: typeof o.modelId === 'string' ? o.modelId : finalScenario.modelIds[0] ?? 'heron',
    selectedIds: Array.isArray(o.selectedIds) ? o.selectedIds.filter((x): x is string => typeof x === 'string') : [],
    useRetrieval: o.useRetrieval === true,
    toolIds: Array.isArray(o.toolIds) ? o.toolIds.filter((x): x is string => typeof x === 'string') : [],
    outputTokens: typeof o.outputTokens === 'number' && Number.isFinite(o.outputTokens) ? o.outputTokens : 600,
  }
}

export const finalChallenge = defineChallenge<FinalAnswer>({
  kind: 'final-workflow',
  component: FinalChallenge,
  evaluate: (answer) => simulateFinalChallenge(finalScenario, sanitize(answer)),
})
