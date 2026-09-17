import { useMemo, useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { composeContext, SEGMENT_LABEL, type ContextSegment, type SegmentId } from '../../../simulation/contextWindow'
import { formatTokens } from '../../../simulation/tokens'
import { ConceptCard } from '../../../ui/ConceptCard'
import { ContextWindow } from '../../../ui/ContextWindow'
import { SimulationPanel } from '../../../ui/SimulationPanel'

const LIMITS = [8_000, 16_000, 32_000, 128_000]

const START: Record<SegmentId, number> = {
  system: 1_200,
  conversation: 6_400,
  documents: 9_800,
  tools: 2_100,
  output: 2_000,
}

const MAX: Record<SegmentId, number> = {
  system: 4_000,
  conversation: 20_000,
  documents: 40_000,
  tools: 12_000,
  output: 8_000,
}

const HINT: Record<SegmentId, string> = {
  system: 'Standing instructions. Sent with every single request.',
  conversation: 'Everything said so far. Grows with each turn and is re-sent every time.',
  documents: 'Files, pasted text, project knowledge.',
  tools: 'Results of searches, database queries and other tool calls.',
  output: 'Room you must leave for the answer. If it is squeezed, the answer is cut short.',
}

export function InteractiveContextWindow({ onComplete, completed }: InteractiveLessonProps) {
  const [limit, setLimit] = useState(16_000)
  const [values, setValues] = useState<Record<SegmentId, number>>(START)

  const segments: ContextSegment[] = useMemo(
    () => (Object.keys(SEGMENT_LABEL) as SegmentId[]).map((id) => ({ id, label: SEGMENT_LABEL[id], tokens: values[id] })),
    [values],
  )
  const c = composeContext(segments, limit)
  const fits = c.overflow === 0 && !c.outputSqueezed
  const solved = fits && limit === 16_000 && values.output >= 2_000

  return (
    <div className="space-y-6">
      <p className="ink-2">
        The window starts <strong className="ink-1">over the limit</strong>. Drag the sliders until everything fits in a
        16,000-token window <strong className="ink-1">while keeping at least 2,000 tokens for the answer</strong>. Then try
        switching the limit to see how a bigger model changes the picture.
      </p>

      <SimulationPanel
        title="Context window"
        aside={
          <div className="space-y-3">
            <label className="block text-sm space-y-1">
              <span className="font-semibold">Context limit</span>
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full rounded-lg border line-strong surface-1 px-2 py-1.5 ink-1">
                {LIMITS.map((l) => (
                  <option key={l} value={l}>
                    {formatTokens(l)} tokens
                  </option>
                ))}
              </select>
            </label>
            <div className={`rounded-xl border p-3 text-sm ${solved ? 'border-good bg-good/10' : fits ? 'border-brand-400 bg-brand-500/10' : 'border-bad bg-bad/10'}`} role="status">
              {solved
                ? 'It fits, with room for the answer. Nicely done.'
                : fits
                  ? limit !== 16_000
                    ? 'It fits at this limit. Can you make it fit in 16,000?'
                    : 'It fits, but leave at least 2,000 tokens for the answer.'
                  : c.overflow > 0
                    ? `Over the limit by ${formatTokens(c.overflow)} tokens.`
                    : 'The answer would be cut short.'}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <ContextWindow segments={segments} limit={limit} compact />
          <div className="space-y-3">
            {(Object.keys(SEGMENT_LABEL) as SegmentId[]).map((id) => (
              <label key={id} className="block text-sm">
                <span className="flex items-baseline justify-between">
                  <span className="font-semibold">{SEGMENT_LABEL[id]}</span>
                  <span className="tabular-nums ink-2">{formatTokens(values[id])}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={MAX[id]}
                  step={100}
                  value={values[id]}
                  onChange={(e) => setValues((v) => ({ ...v, [id]: Number(e.target.value) }))}
                  className="w-full accent-brand-600"
                  aria-valuetext={`${formatTokens(values[id])} tokens`}
                />
                <span className="block text-xs ink-3">{HINT[id]}</span>
              </label>
            ))}
          </div>
        </div>
      </SimulationPanel>

      <ConceptCard title="The window is shared" icon="🪟">
        <p>Instructions, conversation history, documents, tool results and the answer all compete for the same space.</p>
        <p>A bigger window does not make irrelevant content useful. It just lets you pay to include more of it.</p>
      </ConceptCard>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!solved && !completed}>
          {completed ? 'Next' : solved ? 'Continue' : 'Make it fit to continue'}
        </button>
      </div>
    </div>
  )
}
