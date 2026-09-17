import { formatTokens } from '../simulation/tokens'

export interface TokenMeterProps {
  used: number
  limit: number
  label?: string
  /** Optional secondary marker, e.g. the output reservation. */
  reserved?: number
}

/** Horizontal budget meter with a clear over-budget state. */
export function TokenMeter({ used, limit, label = 'Context window', reserved = 0 }: TokenMeterProps) {
  const pct = limit > 0 ? (used / limit) * 100 : 0
  const over = used > limit
  const reservedPct = limit > 0 ? Math.min(100, (reserved / limit) * 100) : 0
  const tone = over ? 'bg-bad' : pct > 85 ? 'bg-warn' : 'bg-brand-500'
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className={`tabular-nums ${over ? 'text-bad font-semibold' : 'ink-2'}`}>
          {formatTokens(used)} / {formatTokens(limit)} <span className="ink-3">simulated tokens</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuetext={`${formatTokens(used)} of ${formatTokens(limit)} simulated tokens${over ? ', over budget' : ''}`}
        className="relative h-4 overflow-hidden rounded-full surface-3"
      >
        <div className={`h-full rounded-full transition-[width] duration-500 ${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
        {reserved > 0 && (
          <div
            className="absolute inset-y-0 right-0 border-l-2 border-dashed border-seg-output/70 bg-seg-output/20"
            style={{ width: `${reservedPct}%` }}
            aria-hidden
          />
        )}
      </div>
      {over && (
        <p className="text-xs font-semibold text-bad" role="status">
          Over budget by {formatTokens(used - limit)} tokens
        </p>
      )}
    </div>
  )
}
