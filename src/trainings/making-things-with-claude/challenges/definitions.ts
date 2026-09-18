import { makeCompositeChallenge } from '../../../lessons/factories/compositeChallenge'
import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { makeSortingChallenge } from '../../../lessons/factories/sortingChallenge'
import { qbrPackSpec } from '../data/composite'
import { designRunScenario } from '../data/scenarios'
import { claimBuckets, claimItems, titleBuckets, titleItems } from '../data/sorting'

export const actionTitlesChallenge = makeSortingChallenge({
  title: 'Action titles',
  brief:
    'Nine titles from a draft board deck. Decide which ones carry the message, which only name the subject, and which make a claim the slide could not possibly back up. Use the buttons on each item; arrow keys work too.',
  buckets: titleBuckets,
  items: titleItems,
  passScore: 70,
})

export const designRunChallenge = makeScenarioChallenge({
  scenario: designRunScenario,
  replayLabel: 'Run the week again',
  decisionsHeading: 'Your decisions',
})

export const factCheckChallenge = makeSortingChallenge({
  title: 'The fact-check pass',
  brief:
    'Claude has drafted the quarterly report and every sentence sounds reasonable. That is the problem. Read each one and decide what can actually go out.',
  buckets: claimBuckets,
  items: claimItems,
  passScore: 70,
  minAttemptsToContinue: 2,
})

export const qbrPackChallenge = makeCompositeChallenge({
  title: 'The quarterly business review pack',
  brief:
    'Everything at once. The CFO needs a QBR pack for the board, it has to match the corporate template, finance must be able to edit it next quarter, and your usage limit is shared with the rest of your week.',
  spec: qbrPackSpec,
  submitLabel: 'Build the pack',
  minAttemptsToContinue: 2,
})
