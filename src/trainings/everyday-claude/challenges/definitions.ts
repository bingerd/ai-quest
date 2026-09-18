import { defineChallenge } from '../../../engine/types'
import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { makeSortingChallenge } from '../../../lessons/factories/sortingChallenge'
import { parseDeckWorkflowAnswer, simulateDeckWorkflow, type DeckWorkflowAnswer } from '../../../simulation/deckWorkflow'
import { deckDoctorScenario, mondayScenario } from '../data/scenarios'
import { placeBuckets, placeItems } from '../data/sorting'
import { boardDeckWorkflow } from '../data/workflow'
import { BoardDeck } from './BoardDeck'

export const deckDoctorChallenge = makeScenarioChallenge({ scenario: deckDoctorScenario, replayLabel: 'Try the draft again', decisionsHeading: 'Your follow-ups' })

export const mondayChallenge = makeScenarioChallenge({ scenario: mondayScenario, replayLabel: 'Replay the day' })

export const whereDoesItGoChallenge = makeSortingChallenge({
  title: 'Where does it go?',
  brief: 'You are setting up a project for the Meridian Retail account. Decide where each thing belongs. Use the buttons on each item; arrow keys work too.',
  buckets: placeBuckets,
  items: placeItems,
  passScore: 70,
})

export const boardDeckChallenge = defineChallenge<DeckWorkflowAnswer>({
  kind: 'deck-workflow',
  component: BoardDeck,
  passScore: boardDeckWorkflow.passScore ?? 70,
  evaluate: (answer) => simulateDeckWorkflow(boardDeckWorkflow, parseDeckWorkflowAnswer(answer)),
})
