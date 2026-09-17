import { composeContext, fillPercent, type ContextSegment, type SegmentId } from '../simulation/contextWindow'
import { formatTokens } from '../simulation/tokens'

const SEGMENT_COLOR: Record<SegmentId, string> = {
  system: 'bg-seg-system',
  conversation: 'bg-seg-conversation',
  documents: 'bg-seg-documents',
  tools: 'bg-seg-tools',
  output: 'bg-seg-output',
}

export interface ContextWindowProps {
  segments: ContextSegment[]
  limit: number
  title?: string
  /** Compact mode hides the legend rows. */
  compact?: boolean
}

/**
 * Reusable context-window visualization: a stacked bar plus a legend with
 * per-segment bars. Announces the overall fill to assistive tech.
 */
export function ContextWindow({ segments, limit, title = 'Context window', compact = false }: ContextWindowProps) {
  const c = composeContext(segments, limit)
  const pct = fillPercent(c)
  const over = c.overflow > 0
  const scale = Math.max(c.limit, c.used) || 1

  return (
    <figure className="card p-4 space-y-3" aria-label={title}>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide ink-3">{title}</span>
        <span className={`text-sm tabular-nums ${over ? 'text-bad font-semibold' : 'ink-2'}`}>
          {formatTokens(c.used)} / {formatTokens(c.limit)}
        </span>
      </figcaption>

      <div
        role="meter"
        aria-valuenow={c.used}
        aria-valuemin={0}
        aria-valuemax={c.limit}
        aria-valuetext={`${pct}% of the context window used${over ? ', over the limit' : ''}`}
        className={`relative flex h-8 w-full overflow-hidden rounded-lg surface-3 ${over ? 'ring-2 ring-bad' : ''}`}
      >
        {c.segments
          .filter((s) => s.tokens > 0)
          .map((s) => (
            <div
              key={s.id}
              className={`${SEGMENT_COLOR[s.id]} h-full transition-[width] duration-500 ${s.id === 'output' ? 'opacity-60 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.25)_4px,rgba(255,255,255,0.25)_8px)]' : ''}`}
              style={{ width: `${(s.tokens / scale) * 100}%` }}
              title={`${s.label}: ${formatTokens(s.tokens)}`}
            />
          ))}
        {over && (
          <div
            className="absolute inset-y-0 border-l-2 border-bad"
            style={{ left: `${(c.limit / scale) * 100}%` }}
            aria-hidden
          />
        )}
      </div>

      {!compact && (
        <ul className="space-y-1.5">
          {c.segments.map((s) => (
            <li key={s.id} className="grid grid-cols-[0.75rem_9rem_1fr_4.5rem] items-center gap-2 text-sm">
              <span className={`size-3 rounded-sm ${SEGMENT_COLOR[s.id]}`} aria-hidden />
              <span className="ink-2 truncate">{s.label}</span>
              <span className="h-1.5 overflow-hidden rounded-full surface-3" aria-hidden>
                <span className={`block h-full ${SEGMENT_COLOR[s.id]} transition-[width] duration-500`} style={{ width: `${(s.tokens / scale) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums ink-2">{formatTokens(s.tokens)}</span>
            </li>
          ))}
        </ul>
      )}

      {over && (
        <p className="text-xs font-semibold text-bad" role="status">
          Over the limit by {formatTokens(c.overflow)} tokens. The oldest or least important content would be dropped or the request would fail.
        </p>
      )}
      {!over && c.outputSqueezed && (
        <p className="text-xs font-semibold text-warn" role="status">
          Not enough room left for the reserved output. The answer would be cut short.
        </p>
      )}
    </figure>
  )
}
