import { useState } from 'react'
import type { Scenario as ScenarioData } from '../simulation/scenario'
import { DecisionPoint } from './DecisionPoint'
import { ProgressBar } from './ProgressBar'

export interface ScenarioProps {
  scenario: ScenarioData
  onComplete: (choices: Record<string, string>) => void
}

/** Walks through a scenario's decisions in order and reports the choices. */
export function Scenario({ scenario, onComplete }: ScenarioProps) {
  const [index, setIndex] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const decision = scenario.decisions[index]
  if (!decision) return null
  return (
    <div className="space-y-4">
      <ProgressBar value={(index / scenario.decisions.length) * 100} label="Scenario progress" size="sm" />
      <DecisionPoint
        key={decision.id}
        decision={decision}
        index={index}
        total={scenario.decisions.length}
        isLast={index === scenario.decisions.length - 1}
        onDecide={(optionId) => setChoices((c) => ({ ...c, [decision.id]: optionId }))}
        onNext={() => {
          if (index === scenario.decisions.length - 1) onComplete(choices)
          else setIndex((i) => i + 1)
        }}
      />
    </div>
  )
}
