import { formatTokens } from '../simulation/tokens'

export interface ContextItemProps {
  id: string
  label: string
  tokens: number
  selected: boolean
  onToggle: (id: string) => void
  description?: string
  /** After a simulation, reveal how relevant the item was. */
  revealRelevance?: number
  disabled?: boolean
}

function relevanceChip(r: number) {
  if (r >= 0.7) return { text: 'Essential', cls: 'bg-good/15 text-good' }
  if (r >= 0.4) return { text: 'Useful', cls: 'bg-warn/15 text-warn' }
  return { text: 'Irrelevant', cls: 'bg-bad/15 text-bad' }
}

/** Selectable context item. Uses a real checkbox so it is keyboard and screen-reader friendly. */
export function ContextItem({ id, label, tokens, selected, onToggle, description, revealRelevance, disabled }: ContextItemProps) {
  const chip = revealRelevance !== undefined ? relevanceChip(revealRelevance) : null
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
        selected ? 'border-brand-500 bg-brand-500/10' : 'line hover:line-strong hover:surface-2'
      } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <input
        type="checkbox"
        className="size-4 accent-brand-600"
        checked={selected}
        disabled={disabled}
        onChange={() => onToggle(id)}
        aria-describedby={description ? `${id}-desc` : undefined}
      />
      <span className="min-w-0 flex-1">
        <span className="block font-medium ink-1">{label}</span>
        {description && (
          <span id={`${id}-desc`} className="block text-xs ink-3">
            {description}
          </span>
        )}
      </span>
      {chip && <span className={`chip ${chip.cls}`}>{chip.text}</span>}
      <span className="shrink-0 text-sm tabular-nums ink-2">{formatTokens(tokens)}</span>
    </label>
  )
}
