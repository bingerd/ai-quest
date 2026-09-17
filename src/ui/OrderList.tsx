import { useState, type ReactNode } from 'react'

export interface OrderListItem {
  id: string
  label: string
  detail?: ReactNode
}

export interface OrderListProps {
  items: OrderListItem[]
  /** Current order as ids. */
  order: string[]
  onChange: (order: string[]) => void
  title: string
  disabled?: boolean
  /** Optional extra controls rendered at the end of each row (e.g. a breakpoint toggle). */
  renderExtra?: (id: string, index: number) => ReactNode
}

/** Reorder with ↑/↓ buttons. No drag required; moves are announced. */
export function OrderList({ items, order, onChange, title, disabled, renderExtra }: OrderListProps) {
  const [announcement, setAnnouncement] = useState('')
  const byId = new Map(items.map((i) => [i.id, i]))
  const ids = order.filter((id) => byId.has(id))

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= ids.length) return
    const next = [...ids]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved!)
    onChange(next)
    setAnnouncement(`${byId.get(moved!)?.label} moved to position ${target + 1} of ${ids.length}`)
  }

  return (
    <div className="space-y-2">
      <ol className="space-y-2" aria-label={title}>
        {ids.map((id, index) => {
          const item = byId.get(id)!
          return (
            <li key={id} className="flex items-center gap-2 rounded-xl border line surface-1 p-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full surface-2 text-xs font-bold tabular-nums ink-2" aria-hidden>
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{item.label}</p>
                {item.detail && <div className="text-xs ink-3">{item.detail}</div>}
              </div>
              {renderExtra?.(id, index)}
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="btn btn-secondary px-2 py-1 text-xs"
                  onClick={() => move(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label={`Move ${item.label} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-secondary px-2 py-1 text-xs"
                  onClick={() => move(index, 1)}
                  disabled={disabled || index === ids.length - 1}
                  aria-label={`Move ${item.label} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
