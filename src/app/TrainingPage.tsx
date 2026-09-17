import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  completionPercent,
  currentLessonId,
  finalScore,
  getTraining,
  moduleCompletionPercent,
  useProgressStore,
  type Lesson,
  type LessonStatus,
} from '../engine'
import { ProgressBar } from '../ui/ProgressBar'
import { NotFound } from './NotFound'

const TYPE_LABEL: Record<Lesson['type'], string> = {
  explanation: 'Concept',
  interactive: 'Interactive',
  simulation: 'Simulation',
  challenge: 'Challenge',
  quiz: 'Quick check',
  editor: 'Editor',
  reflection: 'Reflection',
}

export function TrainingPage() {
  const { trainingId = '' } = useParams()
  const training = getTraining(trainingId)
  const progress = useProgressStore((s) => s.progress[trainingId])
  const startTraining = useProgressStore((s) => s.startTraining)
  const resetTraining = useProgressStore((s) => s.resetTraining)

  useEffect(() => {
    if (training && !progress) startTraining(training.id)
  }, [training, progress, startTraining])

  if (!training) return <NotFound message="That training does not exist." />
  if (!progress) return null

  const pct = completionPercent(training, progress)
  const score = finalScore(training, progress)
  const resume = currentLessonId(training, progress)

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm ink-3">
        <Link to="/" className="hover:underline">
          Trainings
        </Link>
        <span aria-hidden> / </span>
        <span className="ink-2">{training.title}</span>
      </nav>

      <header className="card space-y-4 p-6 animate-rise">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{training.title}</h1>
            <p className="ink-2 max-w-2xl">{training.description}</p>
          </div>
          <dl className="flex gap-4 text-sm">
            <div className="card px-3 py-2 text-center">
              <dt className="text-xs ink-3">XP</dt>
              <dd className="text-lg font-bold text-brand-600">{progress.xp}</dd>
            </div>
            <div className="card px-3 py-2 text-center">
              <dt className="text-xs ink-3">Sim. score</dt>
              <dd className="text-lg font-bold">{score ?? '—'}</dd>
            </div>
          </dl>
        </div>
        <ProgressBar value={pct} label="Training progress" showValue />
        <div className="flex flex-wrap gap-2">
          {progress.completed ? (
            <Link to={`/training/${training.id}/results`} className="btn btn-primary">
              View results
            </Link>
          ) : (
            <Link to={`/training/${training.id}/lesson/${resume}`} className="btn btn-primary">
              {pct === 0 ? 'Start training' : 'Continue'}
            </Link>
          )}
          {pct > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (window.confirm('Reset all progress for this training?')) resetTraining(training.id)
              }}
            >
              Reset progress
            </button>
          )}
        </div>
      </header>

      <ol className="space-y-6">
        {training.modules.map((module, mi) => {
          const mpct = moduleCompletionPercent(module, progress)
          return (
            <li key={module.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide ink-3">Module {mi + 1}</p>
                  <h2 className="text-lg font-semibold">{module.title}</h2>
                  {module.description && <p className="text-sm ink-2">{module.description}</p>}
                </div>
                {mpct === 100 && <span className="chip bg-good/15 text-good">Complete</span>}
              </div>
              <ol className="divide-y line">
                {module.lessons.map((lesson) => {
                  const rec = progress.lessons[lesson.id]
                  const status: LessonStatus = rec?.status ?? 'locked'
                  const isCurrent = lesson.id === resume && status !== 'completed'
                  const inner = (
                    <>
                      <StatusIcon status={status} current={isCurrent} />
                      <span className="flex-1">
                        <span className={status === 'locked' ? 'ink-3' : 'ink-1'}>{lesson.title}</span>
                        <span className="ml-2 chip surface-2 ink-3">{TYPE_LABEL[lesson.type]}</span>
                      </span>
                      {rec?.bestScore !== null && rec?.bestScore !== undefined && (
                        <span className="text-sm font-semibold tabular-nums ink-2" aria-label={`Best simulation score ${rec.bestScore}`}>
                          {rec.bestScore}
                        </span>
                      )}
                    </>
                  )
                  return (
                    <li key={lesson.id}>
                      {status === 'locked' ? (
                        <div className="flex items-center gap-3 py-2.5" aria-disabled>
                          {inner}
                        </div>
                      ) : (
                        <Link
                          to={`/training/${training.id}/lesson/${lesson.id}`}
                          className="flex items-center gap-3 rounded-lg py-2.5 -mx-2 px-2 hover:surface-2"
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          {inner}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ol>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function StatusIcon({ status, current }: { status: LessonStatus; current: boolean }) {
  const base = 'grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold'
  if (status === 'completed') {
    return (
      <span className={`${base} bg-good text-white`} aria-label="Completed">
        ✓
      </span>
    )
  }
  if (current) {
    return (
      <span className={`${base} bg-brand-600 text-white`} aria-label="Current lesson">
        →
      </span>
    )
  }
  if (status === 'available') {
    return <span className={`${base} border-2 border-brand-400`} aria-label="Available" />
  }
  return <span className={`${base} border-2 line-strong ink-3`} aria-label="Locked" />
}
