import type { ChallengeResult, QuizQuestion } from './types'

/** Pure, deterministic quiz scoring: percentage correct, one feedback item per question. */
export function scoreQuiz(questions: QuizQuestion[], answers: Record<string, string | null>, passScore = 60): ChallengeResult {
  const correct = questions.filter((q) => answers[q.id] === q.correctOptionId)
  const score = questions.length === 0 ? 0 : Math.round((correct.length / questions.length) * 100)
  return {
    score,
    passed: score >= passScore,
    breakdown: [{ id: 'accuracy', label: 'Accuracy', score }],
    feedback: questions.map((q) => ({
      tone: answers[q.id] === q.correctOptionId ? 'positive' : 'warning',
      title: q.prompt,
      body: q.explanation,
    })),
    summary: `${correct.length} of ${questions.length} correct`,
  }
}
