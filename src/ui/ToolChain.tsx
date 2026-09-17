export interface ToolChainStep {
  id: string
  label: string
  /** Small value under the label, e.g. "12 chunks". */
  value?: string
  active?: boolean
}

/**
 * Pipeline diagram: Documents → Chunking → Retrieval → Ranking → Context → Answer.
 * Auto-fits as many steps per row as the container allows, so it never overflows.
 */
export function ToolChain({ steps, title }: { steps: ToolChainStep[]; title: string }) {
  return (
    <ol className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(6.5rem,1fr))]" aria-label={title}>
      {steps.map((s, i) => (
        <li key={s.id} className={`relative rounded-xl border px-2 py-2 text-center ${s.active ? 'border-brand-500 bg-brand-500/10' : 'line surface-2'}`}>
          <span className="absolute left-1.5 top-1 text-[10px] font-bold ink-3" aria-hidden>
            {i + 1}
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-wide ink-3">{s.label}</p>
          {s.value && <p className="text-sm font-semibold tabular-nums ink-1">{s.value}</p>}
        </li>
      ))}
    </ol>
  )
}
