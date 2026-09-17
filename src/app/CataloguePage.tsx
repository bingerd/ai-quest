import { Link } from 'react-router-dom'
import { completionPercent, listTrainings, useProgressStore } from '../engine'
import { ProgressBar } from '../ui/ProgressBar'

export function CataloguePage() {
  const trainings = listTrainings()
  const progress = useProgressStore((s) => s.progress)

  return (
    <div className="space-y-8">
      <section className="space-y-3 animate-rise">
        <p className="chip bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">Interactive training</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn AI by doing, not by reading.</h1>
        <p className="max-w-2xl ink-2">
          Short, hands-on missions that make enterprise AI concepts tangible. Every decision you make is simulated
          instantly, so you can experiment freely.
        </p>
      </section>

      <section aria-labelledby="catalogue-heading" className="space-y-4">
        <h2 id="catalogue-heading" className="text-lg font-semibold">
          Trainings
        </h2>
        {trainings.length === 0 ? (
          <p className="card p-6 ink-3">No trainings registered yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {trainings.map((t) => {
              const p = progress[t.id]
              const pct = p ? completionPercent(t, p) : 0
              return (
                <li key={t.id} className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {t.tagline && <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{t.tagline}</p>}
                      <h3 className="text-xl font-semibold">{t.title}</h3>
                    </div>
                    <span className="chip surface-2 ink-3 shrink-0">~{t.estimatedMinutes} min</span>
                  </div>
                  <p className="ink-2 text-sm">{t.description}</p>
                  <div className="mt-auto space-y-2 pt-2">
                    <ProgressBar value={pct} label={`${t.title} progress`} />
                    <div className="flex items-center justify-between">
                      <span className="text-xs ink-3">
                        {pct === 0 ? 'Not started' : pct === 100 ? 'Completed' : `${pct}% complete`}
                      </span>
                      <Link to={`/training/${t.id}`} className="btn btn-primary">
                        {pct === 0 ? 'Start' : pct === 100 ? 'Review' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
