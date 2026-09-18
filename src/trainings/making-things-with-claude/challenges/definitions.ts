import { makeCompositeChallenge } from '../../../lessons/factories/compositeChallenge'
import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { makeSortingChallenge } from '../../../lessons/factories/sortingChallenge'
import { qbrPackSpec } from '../data/composite'
import { designRunScenario } from '../data/scenarios'
import { claimBuckets, claimItems, titleBuckets, titleItems } from '../data/sorting'

export const actionTitlesChallenge = makeSortingChallenge({
  title: 'Action titles',
  brief:
    'Nine titles from a draft client steering deck. Decide which ones carry the message, which only name the subject, and which make a claim the slide could not possibly back up. Use the buttons on each item; arrow keys work too.',
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
    'Claude has drafted the quarterly report for the client and every sentence sounds reasonable. That is the problem. Read each one and decide what can actually go out with your firm’s name on it.',
  buckets: claimBuckets,
  items: claimItems,
  passScore: 70,
  minAttemptsToContinue: 2,
})

export const qbrPackChallenge = makeCompositeChallenge({
  title: 'The quarterly business review pack',
  brief:
    'Everything at once. Your engagement partner needs a QBR pack for Meridian’s steering committee, it has to match the firm’s template, the client’s own team must be able to edit it after handover, and your usage limit is shared with the rest of your week.',
  spec: qbrPackSpec,
  submitLabel: 'Build the pack',
  minAttemptsToContinue: 2,
})
