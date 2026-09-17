// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { registerTraining } from '../../../engine/registry'
import type { Training } from '../../../engine/types'
import { ChallengeLesson } from '../../../lessons/ChallengeLesson'
import { enterpriseChallenge } from './enterpriseDefinition'

registerTraining({
  id: 'token-management-stub',
  title: 'stub',
  description: '',
  estimatedMinutes: 1,
  modules: [
    {
      id: 'm',
      title: 'm',
      lessons: [{ id: 'enterprise-scenario', title: 'Enterprise', type: 'challenge', challenge: enterpriseChallenge }],
    },
  ],
} satisfies Training)

describe('EnterpriseScenario', () => {
  it('walks through every situation with a Decide step each time', () => {
    const evaluate = (a: unknown) => enterpriseChallenge.evaluate(a)
    const result = render(
      <ChallengeLesson challenge={enterpriseChallenge} attempts={0} bestScore={null} submit={evaluate} onContinue={() => {}} />,
    )
    for (let i = 0; i < 4; i++) {
      const radios = result.container.querySelectorAll('input[type="radio"]')
      expect(radios.length).toBeGreaterThan(0)
      fireEvent.click(radios[0] as Element)
      const decide = screen.queryByRole('button', { name: 'Decide' })
      expect(decide, `situation ${i + 1} must require a Decide step`).not.toBeNull()
      fireEvent.click(decide!)
      const nextName = i === 3 ? 'See the outcome' : 'Next situation'
      const next = screen.getByRole('button', { name: nextName })
      expect(next).not.toBeNull()
      fireEvent.click(next)
    }
    expect(result.baseElement.querySelector('[aria-label="Scenario outcome"]')).not.toBeNull()
  })
})