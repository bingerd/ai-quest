import type { ReactNode } from 'react'
import { useEngageable } from '../lessons/EngagementContext'

export interface ConceptCardProps {
  title: string
  children: ReactNode
  /** Small label above the title, e.g. "Key idea". */
  eyebrow?: string
  icon?: string
  tone?: 'brand' | 'good' | 'warn'
}

const TONES = {
  brand: 'border-brand-400/50 bg-brand-500/5',
  good: 'border-good/50 bg-good/5',
  warn: 'border-warn/50 bg-warn/5',
}

export function ConceptCard({ title, children, eyebrow = 'Key idea', icon, tone = 'brand' }: ConceptCardProps) {
  const { present, satisfied, mark } = useEngageable()
  return (
    <aside className={`my-6 rounded-2xl border p-5 ${TONES[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide ink-3">{eyebrow}</p>
        {present && (
          <button
            type="button"
            aria-pressed={satisfied}
            onClick={mark}
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors ${
              satisfied ? 'border-good/50 bg-good/10 text-good' : 'line ink-3 hover:surface-2'
            }`}
          >
            {satisfied ? '✓ Read' : 'Mark as read'}
          </button>
        )}
      </div>
      <p className="mt-1 flex items-center gap-2 text-lg font-semibold ink-1">
        {icon && (
          <span aria-hidden className="text-xl">
            {icon}
          </span>
        )}
        {title}
      </p>
      <div className="mt-2 space-y-2 text-sm ink-2 [&_p]:m-0">{children}</div>
    </aside>
  )
}