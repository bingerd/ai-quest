import type { Feedback as FeedbackItem, FeedbackTone } from '../engine/types'

const TONE: Record<FeedbackTone, { ring: string; icon: string; label: string }> = {
  positive: { ring: 'border-good/40 bg-good/10', icon: '✓', label: 'Positive' },
  neutral: { ring: 'border-brand-400/40 bg-brand-500/10', icon: 'i', label: 'Note' },
  warning: { ring: 'border-warn/40 bg-warn/10', icon: '!', label: 'Warning' },
}

export function Feedback({ items, heading = 'What happened?' }: { items: FeedbackItem[]; heading?: string }) {
  if (items.length === 0) return null
  return (
    <section aria-label={heading} className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide ink-3">{heading}</h3>
      <ul className="space-y-2">
        {items.map((f, i) => (
          <li key={i} className={`flex gap-3 rounded-xl border p-3 animate-rise ${TONE[f.tone].ring}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span
              className="grid size-6 shrink-0 place-items-center rounded-full surface-1 text-xs font-bold"
              aria-label={TONE[f.tone].label}
            >
              {TONE[f.tone].icon}
            </span>
            <div className="space-y-0.5">
              <p className="font-semibold leading-tight">{f.title}</p>
              <p className="text-sm ink-2">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
