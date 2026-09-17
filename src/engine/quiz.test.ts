import { describe, expect, it } from 'vitest'
import { scoreQuiz } from './quiz'
import type { QuizQuestion } from './types'

const q = (id: string): QuizQuestion => ({
  id,
  prompt: `Question ${id}`,
  options: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ],
  correctOptionId: 'a',
  explanation: `Because ${id}`,
})

describe('scoreQuiz', () => {
  const questions = [q('1'), q('2'), q('3')]

  it('scores the share of correct answers', () => {
    const r = scoreQuiz(questions, { '1': 'a', '2': 'b', '3': 'a' })
    expect(r.score).toBe(67)
    expect(r.passed).toBe(true)
    expect(r.summary).toBe('2 of 3 correct')
    expect(r.feedback.map((f) => f.tone)).toEqual(['positive', 'warning', 'positive'])
  })

  it('treats missing answers as wrong and respects the pass score', () => {
    const r = scoreQuiz(questions, { '1': 'a' }, 50)
    expect(r.score).toBe(33)
    expect(r.passed).toBe(false)
  })

  it('returns 0 for an empty quiz', () => {
    expect(scoreQuiz([], {}).score).toBe(0)
  })
})
