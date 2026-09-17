import { useId } from 'react'
import type { SortBucket, SortItem, SortingResult } from '../simulation/sorting'

export interface BucketSortProps {
  buckets: SortBucket[]
  items: SortItem[]
  placements: Record<string, string>
  onPlace: (itemId: string, bucketId: string) => void
  /** After submitting: show verdicts and explanations, lock inputs. */
  result?: SortingResult | null
}

const VERDICT = {
  correct: { cls: 'border-good/50 bg-good/10', chip: 'bg-good text-white', text: 'Right' },
  acceptable: { cls: 'border-warn/50 bg-warn/10', chip: 'bg-warn text-white', text: 'Close' },
  wrong: { cls: 'border-bad/50 bg-bad/10', chip: 'bg-bad text-white', text: 'Not quite' },
  missing: { cls: 'border-bad/50 bg-bad/10', chip: 'bg-bad text-white', text: 'Not placed' },
} as const

/**
 * Sort items into buckets. Every item is a radio group of buckets, so the whole
 * interaction works with keyboard (arrow keys) and screen readers, and needs no drag.
 */
export function BucketSort({ buckets, items, placements, onPlace, result }: BucketSortProps) {
  const groupPrefix = useId()
  const locked = !!result
  const placedCount = items.filter((i) => placements[i.id]).length

  return (
    <div className="space-y-3">
      <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {buckets.map((b) => {
          const count = items.filter((i) => placements[i.id] === b.id).length
          return (
            <div key={b.id} className="rounded-xl border line surface-2 px-3 py-2">
              <dt className="flex items-center justify-between gap-2 text-sm font-semibold">
                {b.label}
                <span className="chip surface-1 ink-3 tabular-nums">{count}</span>
              </dt>
              {b.description && <dd className="text-xs ink-3">{b.description}</dd>}
            </div>
          )
        })}
      </dl>

      <p className="text-sm ink-3" aria-live="polite">
        {placedCount} of {items.length} placed
      </p>

      <ul className="space-y-2">
        {items.map((item) => {
          const r = result?.itemResults.find((x) => x.itemId === item.id)
          const v = r ? VERDICT[r.verdict] : null
          const correctLabel = buckets.find((b) => b.id === item.correctBucket)?.label
          return (
            <li key={item.id} className={`rounded-xl border p-3 ${v ? v.cls : 'line'}`}>
              <fieldset disabled={locked} className="space-y-2">
                <legend className="flex w-full flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="block font-semibold">{item.label}</span>
                    {item.detail && <span className="block text-xs ink-3">{item.detail}</span>}
                  </span>
                  {v && <span className={`chip ${v.chip}`}>{v.text}</span>}
                </legend>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Where does "${item.label}" belong?`}>
                  {buckets.map((b) => {
                    const selected = placements[item.id] === b.id
                    const isCorrect = !!result && b.id === item.correctBucket
                    return (
                      <label
                        key={b.id}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                          selected ? 'border-brand-500 bg-brand-500/15 font-semibold ink-1' : 'line ink-2 hover:surface-2'
                        } ${isCorrect ? 'ring-2 ring-good' : ''} ${locked ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={`${groupPrefix}-${item.id}`}
                          value={b.id}
                          checked={selected}
                          onChange={() => onPlace(item.id, b.id)}
                        />
                        {b.label}
                      </label>
                    )
                  })}
                </div>
                {result && r?.verdict !== 'correct' && <p className="text-sm ink-2">It belongs in <strong>{correctLabel}</strong>. {item.explanation}</p>}
              </fieldset>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
