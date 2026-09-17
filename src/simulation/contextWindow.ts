/**
 * Composition of a context window into named segments.
 * Used by the ContextWindow visualization and by challenge simulations.
 */

export type SegmentId = 'system' | 'conversation' | 'documents' | 'tools' | 'output'

export interface ContextSegment {
  id: SegmentId
  label: string
  tokens: number
}

export const SEGMENT_LABEL: Record<SegmentId, string> = {
  system: 'System instructions',
  conversation: 'Conversation',
  documents: 'Documents',
  tools: 'Tool results',
  output: 'Output reservation',
}

export interface ContextComposition {
  segments: ContextSegment[]
  limit: number
  used: number
  /** 0..1, may exceed 1 when over the limit. */
  fill: number
  overflow: number
  remaining: number
  /** True when the input alone leaves no room for the output reservation. */
  outputSqueezed: boolean
}

export function composeContext(segments: ContextSegment[], limit: number): ContextComposition {
  const safe = segments.map((s) => ({ ...s, tokens: Math.max(0, Math.round(s.tokens)) }))
  const used = safe.reduce((sum, s) => sum + s.tokens, 0)
  const output = safe.find((s) => s.id === 'output')?.tokens ?? 0
  const inputOnly = used - output
  return {
    segments: safe,
    limit,
    used,
    fill: limit > 0 ? used / limit : 0,
    overflow: Math.max(0, used - limit),
    remaining: Math.max(0, limit - used),
    outputSqueezed: output > 0 && inputOnly + output > limit,
  }
}

/** Fraction of the limit used, as a rounded percentage (can exceed 100). */
export function fillPercent(c: ContextComposition): number {
  return Math.round(c.fill * 100)
}
