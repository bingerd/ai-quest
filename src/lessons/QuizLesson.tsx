import { useState } from 'react'
import type { ChallengeResult, QuizQuestion } from '../engine/types'
import { Feedback } from '../ui/Feedback'
import { MultipleChoice } from '../ui/MultipleChoice'
import { ScoreBreakdown } from '../ui/ScoreBreakdown'

export interface QuizLessonProps {
  questions: QuizQuestion[]
  onSubmit: (result: ChallengeResult) => void
  onContinue: () => void
  passScore?: number
}

/** Pure scoring so it can be unit-tested and reused. */
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

export function QuizLesson({ questions, onSubmit, onContinue, passScore }: QuizLessonProps) {
  const [answers, setAnswers] = useState<Record<string, string | null>>({})
  const [result, setResult] = useState<ChallengeResult | null>(null)
  const allAnswered = questions.every((q) => answers[q.id])

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="card p-4">
          <MultipleChoice
            prompt={q.prompt}
            options={q.options}
            value={answers[q.id] ?? null}
            onChange={(id) => setAnswers((a) => ({ ...a, [q.id]: id }))}
            {...(result ? { revealCorrectId: q.correctOptionId } : {})}
          />
        </div>
      ))}
      {result ? (
        <div className="space-y-4">
          <ScoreBreakdown total={result.score} dimensions={result.breakdown} label="Quiz score" />
          <Feedback items={result.feedback} heading="Explanations" />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAnswers({})
                setResult(null)
              }}
            >
              Try again
            </button>
            <button type="button" className="btn btn-primary" onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!allAnswered}
            onClick={() => {
              const r = scoreQuiz(questions, answers, passScore)
              setResult(r)
              onSubmit(r)
            }}
          >
            Check answers
          </button>
        </div>
      )}
    </div>
  )
}
