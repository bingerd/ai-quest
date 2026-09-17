import { useState } from 'react'
import { scoreQuiz } from '../engine/quiz'
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
