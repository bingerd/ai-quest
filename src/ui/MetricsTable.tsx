export interface Metric {
  label: string
  value: string
  hint?: string
}

export function MetricsTable({ metrics, caption = 'Simulated metrics' }: { metrics: Metric[]; caption?: string }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={caption}>
      {metrics.map((m) => (
        <div key={m.label} className="card px-3 py-2">
          <dt className="text-xs ink-3">{m.label}</dt>
          <dd className="text-lg font-semibold tabular-nums">{m.value}</dd>
          {m.hint && <dd className="text-xs ink-3">{m.hint}</dd>}
        </div>
      ))}
    </dl>
  )
}
