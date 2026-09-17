import { Link, useParams } from 'react-router-dom'
import { completionPercent, finalScore, flattenLessons, getTraining, isScoredLesson, useProgressStore } from '../engine'
import { ScoreBreakdown } from '../ui/ScoreBreakdown'
import { NotFound } from './NotFound'

export function ResultsPage() {
  const { trainingId = '' } = useParams()
  const training = getTraining(trainingId)
  const progress = useProgressStore((s) => s.progress[trainingId])
  const resetTraining = useProgressStore((s) => s.resetTraining)

  if (!training) return <NotFound message="That training does not exist." />
  if (!progress) return <NotFound message="You have not started this training yet." />

  const pct = completionPercent(training, progress)
  const score = finalScore(training, progress)
  const scored = flattenLessons(training).filter((f) => isScoredLesson(f.lesson))
  const dimensions = scored.map((f) => ({
    id: f.lesson.id,
    label: f.lesson.title,
    score: progress.lessons[f.lesson.id]?.bestScore ?? 0,
  }))
  const gold = progress.badges.includes(`training:${training.id}:gold`)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="card p-6 text-center space-y-2 animate-pop">
        <p className="text-5xl" aria-hidden>
          {pct === 100 ? (gold ? '🏆' : '🎉') : '🧭'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {pct === 100 ? `You completed ${training.title}` : `${pct}% of ${training.title} complete`}
        </h1>
        <p className="ink-2">
          {pct === 100
            ? gold
              ? 'Gold badge earned: average simulation score of 90 or higher.'
              : 'Training badge earned. Replay any challenge to raise your score.'
            : 'Finish the remaining lessons to earn the training badge.'}
        </p>
        <p className="text-sm ink-3">
          {progress.xp} XP · {progress.badges.length} badge{progress.badges.length === 1 ? '' : 's'}
        </p>
      </header>

      <ScoreBreakdown total={score ?? 0} dimensions={dimensions} label="Overall simulation score" />

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">Badges</h2>
        <ul className="flex flex-wrap gap-2">
          {training.modules.map((m) => {
            const earned = progress.badges.includes(`module:${m.id}`)
            return (
              <li key={m.id} className={`chip ${earned ? 'bg-brand-600 text-white' : 'surface-2 ink-3'}`}>
                {earned ? '★' : '☆'} {m.title}
              </li>
            )
          })}
          <li className={`chip ${pct === 100 ? 'bg-good text-white' : 'surface-2 ink-3'}`}>{pct === 100 ? '★' : '☆'} Training complete</li>
          <li className={`chip ${gold ? 'bg-warn text-white' : 'surface-2 ink-3'}`}>{gold ? '★' : '☆'} Gold (avg ≥ 90)</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link to={`/training/${training.id}`} className="btn btn-primary">
          Back to training
        </Link>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (window.confirm('Reset all progress for this training?')) resetTraining(training.id)
          }}
        >
          Restart from scratch
        </button>
        <Link to="/" className="btn btn-ghost">
          All trainings
        </Link>
      </div>
    </div>
  )
}
