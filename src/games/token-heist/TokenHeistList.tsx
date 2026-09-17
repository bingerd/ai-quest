import { ContextItem } from '../../ui/ContextItem'
import { TokenMeter } from '../../ui/TokenMeter'
import type { ContextItemSpec } from '../../simulation/contextSelection'

export interface TokenHeistListProps {
  items: ContextItemSpec[]
  tokenLimit: number
  selectedIds: string[]
  onToggle: (id: string) => void
  reveal: Record<string, number> | null
}

/** Accessible, non-drag alternative to the Phaser board. Same state, same simulation. */
export function TokenHeistList({ items, tokenLimit, selectedIds, onToggle, reveal }: TokenHeistListProps) {
  const used = items.filter((i) => selectedIds.includes(i.id)).reduce((s, i) => s + i.tokens, 0)
  return (
    <div className="space-y-4">
      <TokenMeter used={used} limit={tokenLimit} label="Context window" />
      <ul className="grid gap-2 sm:grid-cols-2" aria-label="Available documents">
        {items.map((i) => (
          <li key={i.id}>
            <ContextItem
              id={i.id}
              label={i.label}
              tokens={i.tokens}
              selected={selectedIds.includes(i.id)}
              onToggle={onToggle}
              {...(i.description ? { description: i.description } : {})}
              {...(reveal ? { revealRelevance: reveal[i.id] ?? 0, disabled: true } : {})}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
