import { useEffect, useRef, useState } from 'react'
import { useEngageable } from '../lessons/EngagementContext'

export interface DiagramNode {
  id: string
  label: string
  detail: string
  icon?: string
}

/** A horizontal flow of nodes. Clicking (or focusing) a node reveals its detail. Reflows vertically on phones. */
export function InteractiveDiagram({ nodes, title }: { nodes: DiagramNode[]; title: string }) {
  const { present, satisfied, mark } = useEngageable()
  // The first node renders selected with its detail already showing, so it counts
  // as explored on mount. Only the remaining nodes need a click.
  const firstId = nodes[0]?.id ?? ''
  const [active, setActive] = useState<string>(firstId)
  const seen = useRef<Set<string>>(new Set(firstId ? [firstId] : []))
  const [seenCount, setSeenCount] = useState(firstId ? 1 : 0)
  const current = nodes.find((n) => n.id === active)

  // A one-node diagram is fully explored on mount and would otherwise never satisfy its gate.
  useEffect(() => {
    if (nodes.length === 1) mark()
  }, [nodes.length, mark])

  const visit = (id: string) => {
    setActive(id)
    if (!seen.current.has(id)) {
      seen.current.add(id)
      setSeenCount(seen.current.size)
      if (seen.current.size === nodes.length) mark()
    }
  }

  return (
    <figure className="my-6 card p-4 space-y-4" aria-label={title}>
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch" role="tablist" aria-label={title}>
        {nodes.map((n, i) => (
          <li key={n.id} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={active === n.id}
              onClick={() => visit(n.id)}
              onFocus={() => visit(n.id)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                active === n.id ? 'border-brand-500 bg-brand-500/10 ink-1' : 'line ink-2 hover:surface-2'
              }`}
            >
              {n.icon && (
                <span aria-hidden className="text-lg">
                  {n.icon}
                </span>
              )}
              {n.label}
            </button>
            {i < nodes.length - 1 && (
              <span aria-hidden className="ink-3 hidden sm:inline">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      {present && (
        <p className="text-xs ink-3" role="status">
          {satisfied ? '✓ All steps explored' : `${seenCount} of ${nodes.length} steps explored`}
        </p>
      )}
      {current && (
        <figcaption role="tabpanel" className="rounded-xl surface-2 p-3 text-sm ink-2 animate-rise" key={current.id}>
          <span className="font-semibold ink-1">{current.label}: </span>
          {current.detail}
        </figcaption>
      )}
    </figure>
  )
}
