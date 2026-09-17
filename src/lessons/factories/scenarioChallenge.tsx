import { defineChallenge, type ChallengeDefinition, type ChallengeProps } from '../../engine/types'
import { evaluateScenario, type Scenario as ScenarioData } from '../../simulation/scenario'
import { Feedback } from '../../ui/Feedback'
import { Scenario } from '../../ui/Scenario'
import { ScoreBreakdown } from '../../ui/ScoreBreakdown'

export interface ScenarioChallengeConfig {
  scenario: ScenarioData
  replayLabel?: string
  decisionsHeading?: string
}

interface ScenarioAnswer {
  choices: Record<string, string>
}

export function parseChoices(answer: unknown): Record<string, string> {
  const raw = typeof answer === 'object' && answer !== null ? (answer as { choices?: unknown }).choices : null
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) if (typeof v === 'string') out[k] = v
  return out
}

/** Build a complete decision-point scenario challenge from data. */
export function makeScenarioChallenge({ scenario, replayLabel = 'Replay', decisionsHeading = 'Your decisions' }: ScenarioChallengeConfig): ChallengeDefinition {
  function ScenarioChallenge({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<ScenarioAnswer>) {
    if (result) {
      return (
        <div className="space-y-4" role="region" aria-label="Scenario outcome">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{scenario.title}: outcome</h2>
            <div className="flex gap-2 text-xs ink-3">
              <span className="chip surface-2">Attempt {attempts}</span>
              {bestScore !== null && <span className="chip surface-2">Best {bestScore}</span>}
            </div>
          </div>
          {result.summary && <p className="text-lg font-semibold animate-rise">{result.summary}</p>}
          <ScoreBreakdown total={result.score} dimensions={result.breakdown} />
          <Feedback items={result.feedback} heading={decisionsHeading} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary" onClick={retry}>
              {replayLabel}
            </button>
            <button type="button" className="btn btn-primary" onClick={onContinue}>
              {result.passed ? 'Continue' : 'Continue anyway'}
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-bold">{scenario.title}</h2>
          <p className="card p-4 text-sm ink-2">{scenario.intro}</p>
        </header>
        <Scenario key={attempts} scenario={scenario} onComplete={(choices) => submit({ choices })} />
      </div>
    )
  }
  return defineChallenge<ScenarioAnswer>({
    kind: 'scenario',
    component: ScenarioChallenge,
    evaluate: (answer) => evaluateScenario(scenario, parseChoices(answer)),
  })
}
