import { makeCompositeChallenge } from '../../../lessons/factories/compositeChallenge'
import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { makeSortingChallenge } from '../../../lessons/factories/sortingChallenge'
import { sdlcScenario } from '../data/scenarios'
import { agentBuckets, agentItems, skillBuckets, skillItems } from '../data/sorting'
import { teamSetupSpec } from '../data/teamSetup'

export const assistantOrAgentChallenge = makeSortingChallenge({
  title: 'Assistant or production agent?',
  brief: 'Same model, very different responsibilities. Sort each situation or requirement.',
  buckets: agentBuckets,
  items: agentItems,
  passScore: 70,
})

export const sdlcChallenge = makeScenarioChallenge({ scenario: sdlcScenario, replayLabel: 'Replay the week' })

export const skillSortChallenge = makeSortingChallenge({
  title: 'Built-in, custom or community?',
  brief: 'Not every skill comes from Anthropic, and not everything that changes Claude’s behaviour is a skill. Sort them.',
  buckets: skillBuckets,
  items: skillItems,
  passScore: 70,
})

export const teamSetupChallenge = makeCompositeChallenge({
  title: 'Your team’s Claude setup',
  brief: 'A five-person team starts at Northwind Logistics on Monday. Put together how it will work with Claude.',
  spec: teamSetupSpec,
  submitLabel: 'Check the setup',
})
