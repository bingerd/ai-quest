import { useEffect, useState } from 'react'
import { useEngageable } from '../lessons/EngagementContext'
import { CONCEPT_LABEL, mappingsFor, VENDOR_LABEL, type ConceptId } from './vendors'

/** Inline "how vendors call this" popover. Neutral term stays primary. */
export function VendorTerm({ concept }: { concept: ConceptId }) {
  const { mark } = useEngageable()
  const [open, setOpen] = useState(false)
  const rows = mappingsFor(concept)

  useEffect(() => {
    if (open) mark()
  }, [open, mark])

  return (
    <span className="inline-block align-baseline">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-md border line-strong px-1.5 py-0.5 text-[0.85em] font-semibold ink-1 hover:surface-2"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {CONCEPT_LABEL[concept]}
        <span aria-hidden className="ink-3 text-xs">
          {open ? '▴' : '▾'}
        </span>
        <span className="sr-only">Show vendor terminology</span>
      </button>
      {open && (
        <span className="mt-2 block card p-3 text-sm animate-rise">
          <span className="block text-xs font-semibold uppercase tracking-wide ink-3">How vendors name it</span>
          <span className="mt-1 block divide-y line">
            {rows.map((r) => (
              <span key={r.vendor} className="grid grid-cols-[7rem_1fr] gap-2 py-1.5">
                <span className="font-semibold">{VENDOR_LABEL[r.vendor]}</span>
                <span>
                  <span className="ink-1">{r.vendorTerm}</span>
                  <span className="block text-xs ink-3">{r.explanation}</span>
                </span>
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  )
}