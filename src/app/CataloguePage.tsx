import { Link, useSearchParams } from 'react-router-dom'
import { AUDIENCE_LABEL, completionPercent, getTraining, LEVEL_LABEL, listTrainings, useProgressStore, type TrainingAudience } from '../engine'
import { ProgressBar } from '../ui/ProgressBar'

export function CataloguePage() {
  const all = listTrainings()
  const progress = useProgressStore((s) => s.progress)
  const [params, setParams] = useSearchParams()
  const raw = params.get('for')
  const filter: TrainingAudience | null = raw && raw in AUDIENCE_LABEL ? (raw as TrainingAudience) : null
  const trainings = filter ? all.filter((t) => t.audience === filter) : all
  const audiences = (Object.keys(AUDIENCE_LABEL) as TrainingAudience[]).filter((a) => all.some((t) => t.audience === a))

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="catalogue-heading" className="text-lg font-semibold">
            Trainings
          </h2>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by audience">
            {[null, ...audiences].map((a) => {
              const active = filter === a
              return (
                <button
                  key={a ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setParams(a ? { for: a } : {}, { replace: true })}
                  className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                    active ? 'border-brand-500 bg-brand-600 text-white' : 'line ink-2 hover:surface-2'
                  }`}
                >
                  {a ? AUDIENCE_LABEL[a] : 'All'}
                </button>
              )
            })}
          </div>
        </div>
        {trainings.length === 0 ? (
          <p className="card p-6 ink-3">{all.length === 0 ? 'No trainings registered yet.' : 'No trainings for this audience yet.'}</p>
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
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300">For: {AUDIENCE_LABEL[t.audience]}</span>
                    <span className="chip surface-2 ink-2">{LEVEL_LABEL[t.level]}</span>
                  </div>
                  <p className="ink-2 text-sm">{t.description}</p>
                  {t.recommendedAfter && t.recommendedAfter.length > 0 && (
                    <p className="text-xs ink-3">
                      Best after:{' '}
                      {t.recommendedAfter
                        .map((id) => getTraining(id))
                        .filter((x) => x !== undefined)
                        .map((x, i) => (
                          <span key={x.id}>
                            {i > 0 && ', '}
                            <Link to={`/training/${x.id}`} className="underline hover:text-brand-600">
                              {x.title}
                            </Link>
                          </span>
                        ))}
                    </p>
                  )}
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
