import { defineChallenge } from '../../../engine/types'
import { makeCompositeChallenge } from '../../../lessons/factories/compositeChallenge'
import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { makeSortingChallenge } from '../../../lessons/factories/sortingChallenge'
import { parseToolIds, simulateAgentRun } from '../../../simulation/agent'
import { simulateCacheArchitect, MAX_BREAKPOINTS, type CachingInput } from '../../../simulation/caching'
import { simulateEvalSuite, type CaseType, type Grader, type SampleSize } from '../../../simulation/evals'
import { parseWorkloadAnswer, simulateWorkloadPlan } from '../../../simulation/workload'
import { supportAgentSpec } from '../data/agent'
import { cacheScenario } from '../data/caching'
import { failureModes } from '../data/evals'
import { platformScenario } from '../data/scenarios'
import { privilegeBuckets, privilegeItems } from '../data/sorting'
import { shipItSpec } from '../data/shipIt'
import { workloads } from '../data/workloads'
import { AgentToolbox, type AgentAnswer } from './AgentToolbox'
import { CacheArchitect, type CacheAnswer } from './CacheArchitect'
import { EvalLab, type EvalAnswer } from './EvalLab'
import { WorkloadPlanner, type WorkloadPlannerAnswer } from './WorkloadPlanner'

const CASE_TYPES: CaseType[] = ['happy', 'edge', 'adversarial', 'regression']
const GRADERS: Grader[] = ['code', 'llm', 'human']
const SIZES: SampleSize[] = ['small', 'medium', 'large']

export const cacheArchitectChallenge = defineChallenge<CacheAnswer>({
  kind: 'cache-architect',
  component: CacheArchitect,
  passScore: 75,
  evaluate(answer) {
    const a = (typeof answer === 'object' && answer !== null ? answer : {}) as Partial<CacheAnswer>
    const validIds = new Set(cacheScenario.blocks.map((b) => b.id))
    const order = Array.isArray(a.order) ? a.order.filter((x): x is string => typeof x === 'string' && validIds.has(x)) : []
    const breakpoints = Array.isArray(a.breakpoints) ? a.breakpoints.filter((x): x is string => typeof x === 'string' && validIds.has(x)).slice(0, MAX_BREAKPOINTS) : []
    const input: CachingInput = { ...cacheScenario, order: order.length > 0 ? order : cacheScenario.order, breakpoints, ttl: a.ttl === '1h' ? '1h' : '5m' }
    return simulateCacheArchitect(input)
  },
})

export const workloadChallenge = defineChallenge<WorkloadPlannerAnswer>({
  kind: 'workload-planner',
  component: WorkloadPlanner,
  passScore: 75,
  evaluate: (answer) => simulateWorkloadPlan(workloads, parseWorkloadAnswer(answer)),
})

export const agentToolboxChallenge = defineChallenge<AgentAnswer>({
  kind: 'agent-toolbox',
  component: AgentToolbox,
  passScore: 70,
  evaluate: (answer) => simulateAgentRun(supportAgentSpec, parseToolIds(answer)),
})

export const leastPrivilegeChallenge = makeSortingChallenge({
  title: 'Least privilege',
  brief: 'The same support agent, in production. Decide what it may do by itself, what needs a human in the loop, and what it should never be given.',
  buckets: privilegeBuckets,
  items: privilegeItems,
  passScore: 75,
})

export const evalLabChallenge = defineChallenge<EvalAnswer>({
  kind: 'eval-lab',
  component: EvalLab,
  passScore: 75,
  evaluate(answer) {
    const a = (typeof answer === 'object' && answer !== null ? answer : {}) as Partial<EvalAnswer>
    const caseTypes = Array.isArray(a.caseTypes) ? a.caseTypes.filter((c): c is CaseType => CASE_TYPES.includes(c as CaseType)) : []
    const grader = GRADERS.includes(a.grader as Grader) ? (a.grader as Grader) : 'code'
    const sampleSize = SIZES.includes(a.sampleSize as SampleSize) ? (a.sampleSize as SampleSize) : 'small'
    return simulateEvalSuite({ failureModes, caseTypes, grader, sampleSize })
  },
})

export const platformWeekChallenge = makeScenarioChallenge({ scenario: platformScenario, replayLabel: 'Replay the week' })

export const shipItChallenge = makeCompositeChallenge({
  title: 'Final Challenge: ship an AI feature',
  brief: 'Automatic ticket classification, 200,000 tickets a day, with an assistant that drafts replies. Design the whole thing: model, request layout, delivery, evals, agent scope and rollout.',
  spec: shipItSpec,
  submitLabel: 'Ship it',
})
