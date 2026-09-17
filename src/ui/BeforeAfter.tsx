import { useState, type ReactNode } from 'react'

export interface BeforeAfterProps {
  beforeLabel?: string
  afterLabel?: string
  before: ReactNode
  after: ReactNode
  /** Optional captions shown under each side. */
  beforeCaption?: string
  afterCaption?: string
}

/** Toggle or side-by-side comparison. Stacks on narrow screens. */
export function BeforeAfter({
  beforeLabel = 'Before',
  afterLabel = 'After',
  before,
  after,
  beforeCaption,
  afterCaption,
}: BeforeAfterProps) {
  const [side, setSide] = useState<'before' | 'after'>('before')
  return (
    <div className="my-6 space-y-3">
      <div className="inline-flex rounded-xl surface-2 p-1 sm:hidden" role="tablist" aria-label="Compare">
        {(['before', 'after'] as const).map((s) => (
          <button
            key={s}
            role="tab"
            type="button"
            aria-selected={side === s}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${side === s ? 'surface-1 ink-1 shadow' : 'ink-3'}`}
            onClick={() => setSide(s)}
          >
            {s === 'before' ? beforeLabel : afterLabel}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Panel label={beforeLabel} tone="warn" hiddenOnMobile={side !== 'before'} caption={beforeCaption}>
          {before}
        </Panel>
        <Panel label={afterLabel} tone="good" hiddenOnMobile={side !== 'after'} caption={afterCaption}>
          {after}
        </Panel>
      </div>
    </div>
  )
}

function Panel({
  label,
  tone,
  hiddenOnMobile,
  caption,
  children,
}: {
  label: string
  tone: 'warn' | 'good'
  hiddenOnMobile: boolean
  caption?: string | undefined
  children: ReactNode
}) {
  return (
    <div className={`card overflow-hidden ${hiddenOnMobile ? 'hidden sm:block' : ''}`}>
      <p className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${tone === 'warn' ? 'bg-warn/15 text-warn' : 'bg-good/15 text-good'}`}>
        {label}
      </p>
      <div className="p-4 text-sm ink-2 [&_pre]:m-0">{children}</div>
      {caption && <p className="border-t line px-4 py-2 text-xs ink-3">{caption}</p>}
    </div>
  )
}
