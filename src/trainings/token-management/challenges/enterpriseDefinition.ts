import { makeScenarioChallenge } from '../../../lessons/factories/scenarioChallenge'
import { enterpriseScenario } from '../data/enterpriseScenario'

export const enterpriseChallenge = makeScenarioChallenge({ scenario: enterpriseScenario, replayLabel: 'Replay the week' })
