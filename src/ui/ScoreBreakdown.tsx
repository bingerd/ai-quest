import type { ScoreDimension } from '../engine/types'

function tone(score: number): string {
  if (score >= 85) return 'bg-good'
  if (score >= 60) return 'bg-warn'
  return 'bg-bad'
}

export function ScoreBreakdown({
  total,
  dimensions,
  label = 'Simulation score',
}: {
  total: number
  dimensions: ScoreDimension[]
  label?: string
}) {
  return (
    <section aria-label={label} className="card p-4 sm:p-5 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide ink-3">{label}</p>
          <p className="text-4xl font-bold tabular-nums animate-pop">{total}</p>
        </div>
        <p className="text-xs ink-3 text-right max-w-[14rem]">Scores are simulated for learning. They do not measure a real model.</p>
      </div>
      {dimensions.length > 0 && (
        <dl className="space-y-2">
          {dimensions.map((d) => (
            <div key={d.id} className="grid grid-cols-[minmax(6rem,11rem)_1fr_2.5rem] items-center gap-3 text-sm">
              <dt className="ink-2 leading-tight">{d.label}</dt>
              <dd className="h-2 overflow-hidden rounded-full surface-3" aria-hidden>
                <div className={`h-full rounded-full transition-[width] duration-700 ${tone(d.score)}`} style={{ width: `${d.score}%` }} />
              </dd>
              <dd className="text-right font-semibold tabular-nums">{Math.round(d.score)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
