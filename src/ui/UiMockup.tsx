import { useEffect, useRef, useState } from 'react'
import { useEngageable } from '../lessons/EngagementContext'

export interface MockupRegion {
  id: string
  label: string
  detail: string
  icon?: string
  /** Renders the region as the prominent part of its row, e.g. the conversation next to the sidebar. */
  wide?: boolean
}

/**
 * A drawn, annotated reproduction of a piece of Claude's interface.
 *
 * Layout comes from `rows`, so every region is always rendered and the
 * engagement count can never drift from what is on screen. Rows are columns on
 * a wide screen and a single numbered list on a phone. The frame itself is
 * decoration: screen readers get the numbered list, not a fake window.
 */
export function UiMockup({ title, rows, caption }: { title: string; rows: MockupRegion[][]; caption?: string }) {
  const { present, satisfied, mark } = useEngageable()
  const all = rows.flat()
  // The first region renders selected with its detail already showing, so it
  // counts as explored on mount. Only the rest need a click or a tab stop.
  const firstId = all[0]?.id ?? ''
  const [active, setActive] = useState<string>(firstId)
  const seen = useRef<Set<string>>(new Set(firstId ? [firstId] : []))
  const [seenCount, setSeenCount] = useState(firstId ? 1 : 0)
  const current = all.find((r) => r.id === active)
  const number = new Map(all.map((r, i) => [r.id, i + 1]))

  // A mockup with one region (or none) is fully explored on mount and would
  // otherwise never satisfy its gate.
  useEffect(() => {
    if (all.length <= 1) mark()
  }, [all.length, mark])

  const visit = (id: string) => {
    setActive(id)
    if (seen.current.has(id)) return
    seen.current.add(id)
    setSeenCount(seen.current.size)
    if (seen.current.size === all.length) mark()
  }

  return (
    <figure className="my-6 space-y-3" aria-label={title}>
      <div className="card overflow-hidden p-0">
        <div aria-hidden className="flex items-center gap-1.5 border-b line surface-2 px-3 py-2">
          <span className="size-2.5 rounded-full surface-3" />
          <span className="size-2.5 rounded-full surface-3" />
          <span className="size-2.5 rounded-full surface-3" />
          <span className="ml-2 truncate text-xs ink-3">{title}</span>
        </div>
        <div className="space-y-2 p-3" role="tablist" aria-label={title}>
          {rows.map((row, ri) => (
            <div key={row[0]?.id ?? ri} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              {row.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={active === r.id}
                  onClick={() => visit(r.id)}
                  onFocus={() => visit(r.id)}
                  className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                    r.wide ? 'sm:flex-[2]' : 'sm:flex-1'
                  } ${active === r.id ? 'border-brand-500 bg-brand-500/10 ink-1' : 'line ink-2 hover:surface-2'}`}
                >
                  <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full surface-2 text-[0.7rem] tabular-nums ink-2">
                    {number.get(r.id)}
                  </span>
                  {r.icon && (
                    <span aria-hidden className="text-base">
                      {r.icon}
                    </span>
                  )}
                  <span className="min-w-0 truncate">{r.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {present && (
        <p className="text-xs ink-3" role="status">
          {satisfied ? '✓ All parts explored' : `${seenCount} of ${all.length} parts explored`}
        </p>
      )}
      {current && (
        <figcaption role="tabpanel" className="rounded-xl surface-2 p-3 text-sm ink-2 animate-rise" key={current.id}>
          <span className="font-semibold ink-1">
            {number.get(current.id)}. {current.label}:{' '}
          </span>
          {current.detail}
        </figcaption>
      )}
      {caption && <p className="text-xs ink-3">{caption}</p>}
    </figure>
  )
}
