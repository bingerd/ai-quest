import { makeCompositeChallenge } from '../../../lessons/factories/compositeChallenge'
import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { makeSortingChallenge } from '../../../lessons/factories/sortingChallenge'
import { designSystemSpec } from '../data/designSystem'
import { contextRoundsScenario, policyScenario } from '../data/scenarios'
import { contextBuckets, contextItems, workflowBuckets, workflowItems } from '../data/sorting'

export const policyChallenge = makeScenarioChallenge({ scenario: policyScenario, replayLabel: 'Replay the week' })

export const contextSortChallenge = makeSortingChallenge({
  title: 'Where does it go?',
  brief: 'You are working on the Meridian Retail engagement in your new project. Decide where each thing belongs. Use the buttons on each item; arrow keys work too.',
  buckets: contextBuckets,
  items: contextItems,
  passScore: 70,
})

export const contextRoundsChallenge = makeScenarioChallenge({ scenario: contextRoundsScenario, replayLabel: 'Run the rounds again', decisionsHeading: 'Your rounds' })

export const designSystemChallenge = makeCompositeChallenge({
  title: 'Set up the brand once',
  brief: 'Your firm wants every deck and one-pager on brand without anyone restyling by hand. Make four calls.',
  spec: designSystemSpec,
  submitLabel: 'Check my setup',
})

export const workflowChallenge = makeSortingChallenge({
  title: 'Pick the right tool for the workflow',
  brief: 'Ten real workflows from around the firm. Which Claude feature fits each one best?',
  buckets: workflowBuckets,
  items: workflowItems,
  passScore: 70,
})
