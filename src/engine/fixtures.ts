import type { ChallengeResult, Training } from './types'

/** A tiny subject-free training used by engine tests. */
export function makeStubTraining(): Training {
  const Noop = () => null
  return {
    id: 'stub',
    title: 'Stub training',
    description: 'For tests',
    estimatedMinutes: 5,
    modules: [
      {
        id: 'm1',
        title: 'Module 1',
        lessons: [
          { id: 'l1', title: 'Intro', type: 'explanation', component: Noop },
          {
            id: 'l2',
            title: 'Quiz',
            type: 'quiz',
            questions: [
              {
                id: 'q1',
                prompt: 'Pick A',
                options: [
                  { id: 'a', label: 'A' },
                  { id: 'b', label: 'B' },
                ],
                correctOptionId: 'a',
                explanation: 'A is correct.',
              },
            ],
          },
        ],
      },
      {
        id: 'm2',
        title: 'Module 2',
        lessons: [
          {
            id: 'l3',
            title: 'Challenge',
            type: 'challenge',
            challenge: {
              kind: 'stub',
              component: Noop,
              evaluate(answer: unknown): ChallengeResult {
                const n = typeof answer === 'number' ? answer : Number.NaN
                return {
                  score: n,
                  passed: n >= 60,
                  breakdown: [{ id: 'n', label: 'Number', score: n }],
                  feedback: [],
                }
              },
            },
          },
        ],
      },
    ],
  }
}
