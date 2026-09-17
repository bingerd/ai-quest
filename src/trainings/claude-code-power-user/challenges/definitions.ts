import { defineChallenge } from '../../../engine/types'
import { makeCompositeChallenge } from '../../../lessons/factories/compositeChallenge'
import { makeModelSelectionChallenge } from '../../../lessons/factories/modelSelectionChallenge'
import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { makeSortingChallenge } from '../../../lessons/factories/sortingChallenge'
import { evaluateClaudeMd } from '../../../simulation/claudeMd'
import { simulateHookLab, type HookGoalAnswer } from '../../../simulation/hooks'
import { simulatePermissionPuzzle } from '../../../simulation/permissions'
import { claudeMdExercise } from '../data/claudeMd'
import { hookGoals } from '../data/hooks'
import { permissionCalls } from '../data/permissions'
import { routingScenarios, tierCatalogue } from '../data/routing'
import { longSessionScenario } from '../data/scenarios'
import { extensionBuckets, extensionItems } from '../data/sorting'
import { teamSetupSpec } from '../data/teamSetup'
import { ClaudeMdSurgery, type ClaudeMdAnswer } from './ClaudeMdSurgery'
import { HookLab, type HookLabAnswer } from './HookLab'
import { PermissionPuzzle, type PermissionAnswer } from './PermissionPuzzle'

function textOf(answer: unknown): string {
  const t = typeof answer === 'object' && answer !== null ? (answer as { text?: unknown }).text : undefined
  return typeof t === 'string' ? t : ''
}

export const claudeMdChallenge = defineChallenge<ClaudeMdAnswer>({
  kind: 'claude-md-editor',
  component: ClaudeMdSurgery,
  passScore: 80,
  evaluate: (answer) => evaluateClaudeMd(textOf(answer), claudeMdExercise),
})

export const permissionPuzzleChallenge = defineChallenge<PermissionAnswer>({
  kind: 'permission-puzzle',
  component: PermissionPuzzle,
  passScore: 80,
  evaluate: (answer) => simulatePermissionPuzzle(textOf(answer), permissionCalls),
})

export const hookLabChallenge = defineChallenge<HookLabAnswer>({
  kind: 'hook-lab',
  component: HookLab,
  passScore: 75,
  evaluate(answer) {
    const raw = typeof answer === 'object' && answer !== null ? (answer as { answers?: unknown }).answers : null
    const answers: Record<string, HookGoalAnswer> = {}
    if (typeof raw === 'object' && raw !== null) {
      for (const [k, v] of Object.entries(raw)) {
        if (typeof v !== 'object' || v === null) continue
        const o = v as Record<string, unknown>
        answers[k] = { event: typeof o['event'] === 'string' ? o['event'] : '', matcher: typeof o['matcher'] === 'string' ? o['matcher'] : '', behaviour: typeof o['behaviour'] === 'string' ? o['behaviour'] : '' }
      }
    }
    return simulateHookLab(hookGoals, answers)
  },
})

export const extensionPointChallenge = makeSortingChallenge({
  title: 'Which extension point?',
  brief: 'Claude Code has many places to put things. Choosing the right one decides whether something is a suggestion or a guarantee, and whether it costs context in every session. Place each need.',
  buckets: extensionBuckets,
  items: extensionItems,
  passScore: 70,
})

export const routeSessionChallenge = makeModelSelectionChallenge({
  title: 'Route the session',
  question: 'Which model tier handles this part of the work?',
  scenarios: routingScenarios,
  catalogue: tierCatalogue,
  takeaway: 'Claude Code does not route by task for you. opusplan, subagent models and /model let you put the deep model where the thinking happens and the fast one where the volume is. Numbers here are simulated.',
})

export const longSessionChallenge = makeScenarioChallenge({ scenario: longSessionScenario, replayLabel: 'Replay the afternoon' })

export const teamSetupChallenge = makeCompositeChallenge({
  title: 'Final Challenge: set up the team repo',
  brief: 'Your team is adopting Claude Code on the billing service. Decide what gets committed so that every developer gets a fast, safe, consistent setup on day one.',
  spec: teamSetupSpec,
  submitLabel: 'Onboard the team',
})
