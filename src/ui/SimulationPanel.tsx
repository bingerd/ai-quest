import type { ReactNode } from 'react'

/** Framed area that visually separates "the simulator" from explanatory prose. */
export function SimulationPanel({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="card overflow-hidden" aria-label={title}>
      <header className="flex items-center justify-between gap-3 border-b line surface-2 px-4 py-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="chip surface-1 ink-3">Simulated</span>
      </header>
      <div className={aside ? 'grid gap-4 p-4 md:grid-cols-[1fr_18rem]' : 'p-4'}>
        <div className="min-w-0">{children}</div>
        {aside && <aside className="min-w-0">{aside}</aside>}
      </div>
    </section>
  )
}
