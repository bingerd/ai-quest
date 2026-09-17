import { MDXProvider } from '@mdx-js/react'
import { Suspense, useCallback, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  flattenLessons,
  getTraining,
  nextLessonId,
  previousLessonId,
  useProgressStore,
  type Lesson,
} from '../engine'
import { ChallengeLesson } from '../lessons/ChallengeLesson'
import { mdxComponents } from '../lessons/MdxComponents'
import { QuizLesson } from '../lessons/QuizLesson'
import { ProgressBar } from '../ui/ProgressBar'
import { ErrorBoundary } from './ErrorBoundary'
import { NotFound } from './NotFound'

export function LessonPage() {
  const { trainingId = '', lessonId = '' } = useParams()
  const navigate = useNavigate()
  const training = getTraining(trainingId)
  const progress = useProgressStore((s) => s.progress[trainingId])
  const startTraining = useProgressStore((s) => s.startTraining)
  const completeLesson = useProgressStore((s) => s.completeLesson)
  const submitChallenge = useProgressStore((s) => s.submitChallenge)
  const recordScore = useProgressStore((s) => s.recordScore)

  // Idempotent: creates progress on first visit and reconciles it with the
  // current training definition on later visits (new lessons, removed lessons).
  useEffect(() => {
    if (training) startTraining(training.id)
  }, [training, startTraining])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [lessonId])

  const flat = training ? flattenLessons(training) : []
  const entry = flat.find((f) => f.lesson.id === lessonId)
  const record = progress?.lessons[lessonId]

  const goNext = useCallback(() => {
    if (!training) return
    const next = nextLessonId(training, lessonId)
    if (next) navigate(`/training/${training.id}/lesson/${next}`)
    else navigate(`/training/${training.id}/results`)
  }, [training, lessonId, navigate])

  const complete = useCallback(() => {
    if (!training) return
    completeLesson(training.id, lessonId)
    goNext()
  }, [training, lessonId, completeLesson, goNext])

  if (!training) return <NotFound message="That training does not exist." />
  if (!entry) return <NotFound message="That lesson does not exist." />
  if (!progress || !record) return null
  if (record.status === 'locked') {
    return <NotFound message="This lesson is locked. Complete the previous lessons first." />
  }

  const { lesson, module, index } = entry
  const prev = previousLessonId(training, lessonId)
  const completed = record.status === 'completed'

  return (
    <div className="mx-auto max-w-3xl space-y-6" key={lesson.id}>
      <nav aria-label="Lesson navigation" className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm ink-3">
          <Link to={`/training/${training.id}`} className="hover:underline">
            ← {training.title}
          </Link>
          <span>
            {index + 1} / {flat.length}
          </span>
        </div>
        <ProgressBar value={((index + (completed ? 1 : 0)) / flat.length) * 100} label="Position in training" size="sm" />
      </nav>

      <header className="space-y-1 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{module.title}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>
      </header>

      <ErrorBoundary>
        <Suspense fallback={<LoadingPanel />}>
          <LessonBody
            lesson={lesson}
            completed={completed}
            attempts={record.attempts}
            bestScore={record.bestScore}
            onComplete={complete}
            submit={(answer) => submitChallenge(training.id, lesson.id, answer)}
            recordScore={(r) => recordScore(training.id, lesson.id, r)}
          />
        </Suspense>
      </ErrorBoundary>

      <footer className="flex items-center justify-between border-t line pt-4">
        {prev ? (
          <Link to={`/training/${training.id}/lesson/${prev}`} className="btn btn-ghost">
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {completed && (
          <button type="button" className="btn btn-ghost" onClick={goNext}>
            Next →
          </button>
        )}
      </footer>
    </div>
  )
}

function LoadingPanel() {
  return (
    <div className="card p-8 text-center ink-3" role="status">
      Loading lesson…
    </div>
  )
}

interface LessonBodyProps {
  lesson: Lesson
  completed: boolean
  attempts: number
  bestScore: number | null
  onComplete: () => void
  submit: (answer: unknown) => import('../engine').ChallengeResult
  recordScore: (result: import('../engine').ChallengeResult) => void
}

function LessonBody({ lesson, completed, attempts, bestScore, onComplete, submit, recordScore }: LessonBodyProps) {
  switch (lesson.type) {
    case 'explanation': {
      const Content = lesson.component
      return (
        <article className="space-y-4">
          <MDXProvider components={mdxComponents}>
            <Content />
          </MDXProvider>
          <div className="flex justify-end pt-2">
            <button type="button" className="btn btn-primary" onClick={onComplete}>
              {completed ? 'Next' : 'Got it, continue'}
            </button>
          </div>
        </article>
      )
    }
    case 'interactive':
    case 'simulation':
    case 'reflection': {
      const Content = lesson.component
      return <Content onComplete={onComplete} completed={completed} />
    }
    case 'quiz':
      return (
        <QuizLesson
          questions={lesson.questions}
          onSubmit={recordScore}
          onContinue={onComplete}
          {...(lesson.passScore !== undefined ? { passScore: lesson.passScore } : {})}
        />
      )
    case 'challenge':
    case 'editor':
      return (
        <ChallengeLesson challenge={lesson.challenge} attempts={attempts} bestScore={bestScore} submit={submit} onContinue={onComplete} />
      )
  }
}
