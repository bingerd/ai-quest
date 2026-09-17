import type { ChallengeProps } from '../../../engine/types'
import { Feedback } from '../../../ui/Feedback'
import { Scenario } from '../../../ui/Scenario'
import { ScoreBreakdown } from '../../../ui/ScoreBreakdown'
import { enterpriseScenario } from '../data/enterpriseScenario'

export interface ScenarioAnswer {
  choices: Record<string, string>
}

export function EnterpriseScenario({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<ScenarioAnswer>) {
  if (result) {
    return (
      <div className="space-y-4" role="region" aria-label="Scenario outcome">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{enterpriseScenario.title}: outcome</h2>
          <div className="flex gap-2 text-xs ink-3">
            <span className="chip surface-2">Attempt {attempts}</span>
            {bestScore !== null && <span className="chip surface-2">Best {bestScore}</span>}
          </div>
        </div>
        {result.summary && <p className="text-lg font-semibold animate-rise">{result.summary}</p>}
        <ScoreBreakdown total={result.score} dimensions={result.breakdown} />
        <Feedback items={result.feedback} heading="Your decisions" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary" onClick={retry}>
            Replay the week
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
        <h2 className="text-xl font-bold">{enterpriseScenario.title}</h2>
        <p className="card p-4 text-sm ink-2">{enterpriseScenario.intro}</p>
      </header>
      <Scenario key={attempts} scenario={enterpriseScenario} onComplete={(choices) => submit({ choices })} />
    </div>
  )
}
