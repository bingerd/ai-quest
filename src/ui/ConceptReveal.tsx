import { useEffect, useState, type ReactNode } from 'react'
import { useEngageable } from '../lessons/EngagementContext'

export interface ConceptRevealProps {
  /** The question or prompt shown before revealing. */
  prompt: string
  children: ReactNode
  revealLabel?: string
}

/** A "think first, then reveal" block. Forces a small decision before reading. */
export function ConceptReveal({ prompt, children, revealLabel = 'Reveal answer' }: ConceptRevealProps) {
  const { mark } = useEngageable()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) mark()
  }, [open, mark])

  return (
    <div className="my-6 card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="font-semibold ink-1">{prompt}</p>
        <button type="button" className="btn btn-secondary" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : revealLabel}
        </button>
      </div>
      {open && <div className="border-t line surface-2 p-4 text-sm ink-2 animate-rise [&_p]:m-0 space-y-2">{children}</div>}
    </div>
  )
}