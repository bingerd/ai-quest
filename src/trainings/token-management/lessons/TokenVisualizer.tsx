import { useMemo, useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { getModel, requestCost } from '../../../simulation/models'
import { estimateTokens, formatCurrency, formatTokens, tokenizeForDisplay } from '../../../simulation/tokens'
import { ConceptCard } from '../../../ui/ConceptCard'
import { SimulationPanel } from '../../../ui/SimulationPanel'

const SAMPLE = `Summarise the attached Q3 sales report for the leadership team. Focus on revenue by region and the top three risks.`

const REPEAT_STEPS = [1, 10, 100, 1_000, 10_000, 100_000]

const CHIP_COLORS = ['bg-seg-system/25', 'bg-seg-conversation/25', 'bg-seg-documents/25', 'bg-seg-tools/25']

export function TokenVisualizer({ onComplete, completed }: InteractiveLessonProps) {
  const [text, setText] = useState(SAMPLE)
  const [outputTokens, setOutputTokens] = useState(300)
  const [repeat, setRepeat] = useState(1)
  const chips = useMemo(() => tokenizeForDisplay(text), [text])
  const inputTokens = estimateTokens(text)
  const model = getModel('heron')
  const cost = requestCost(model, inputTokens, outputTokens)
  const edited = text !== SAMPLE

  return (
    <div className="space-y-6">
      <p className="ink-2">
        Type or paste anything. Watch how the text becomes <strong className="ink-1">simulated tokens</strong>, and how the
        answer you ask for adds <strong className="ink-1">output tokens</strong> on top.
      </p>

      <SimulationPanel
        title="Token visualizer"
        aside={
          <dl className="space-y-3 text-sm">
            <div className="card px-3 py-2">
              <dt className="text-xs ink-3">Input tokens</dt>
              <dd className="text-2xl font-bold tabular-nums">{formatTokens(inputTokens)}</dd>
              <dd className="text-xs ink-3">{text.length} characters ÷ 4</dd>
            </div>
            <div className="card px-3 py-2">
              <dt className="text-xs ink-3">Output tokens (requested)</dt>
              <dd className="text-2xl font-bold tabular-nums">{formatTokens(outputTokens)}</dd>
            </div>
            <div className="card px-3 py-2">
              <dt className="text-xs ink-3">Simulated cost per request ({model.name})</dt>
              <dd className="text-2xl font-bold tabular-nums">{formatCurrency(cost)}</dd>
              <dd className="text-xs ink-3">× {formatTokens(repeat)} requests = {formatCurrency(cost * repeat)}</dd>
            </div>
          </dl>
        }
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Your prompt</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border line-strong surface-1 p-3 font-mono text-sm ink-1 focus:border-brand-500"
              aria-describedby="tokviz-help"
            />
            <span id="tokviz-help" className="block text-xs ink-3">
              Try pasting a long paragraph, or deleting everything.
            </span>
          </label>

          <div className="flex min-h-14 flex-wrap gap-1 rounded-xl surface-2 p-3" aria-label="Token chips" role="img">
            {chips.length === 0 ? (
              <span className="text-sm ink-3">No text, no tokens. Zero cost.</span>
            ) : (
              chips.map((c, i) =>
                /^\s+$/.test(c) ? (
                  <span key={i} className="w-2" aria-hidden />
                ) : (
                  <span key={i} className={`rounded px-1 font-mono text-xs ink-1 ${CHIP_COLORS[i % CHIP_COLORS.length]}`}>
                    {c}
                  </span>
                ),
              )
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-semibold">How long an answer do you want?</span>
              <input
                type="range"
                min={50}
                max={4000}
                step={50}
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="w-full accent-brand-600"
                aria-valuetext={`${outputTokens} output tokens`}
              />
              <span className="ink-3">
                {outputTokens < 200 ? 'A short answer' : outputTokens < 1000 ? 'A few paragraphs' : 'A long report'} · output tokens
                cost about 4× input tokens
              </span>
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-semibold">How many times per month?</span>
              <input
                type="range"
                min={0}
                max={REPEAT_STEPS.length - 1}
                step={1}
                value={REPEAT_STEPS.indexOf(repeat)}
                onChange={(e) => setRepeat(REPEAT_STEPS[Number(e.target.value)] ?? 1)}
                className="w-full accent-brand-600"
                aria-valuetext={`${formatTokens(repeat)} requests per month`}
              />
              <span className="ink-3">One person once, or a whole company every day?</span>
            </label>
          </div>
        </div>
      </SimulationPanel>

      <ConceptCard title="Tokens are the unit you pay for and wait for" icon="🎟️">
        <p>Every character you send is turned into tokens. Every token the model writes back is also a token.</p>
        <p>Input tokens are cheap and fast. Output tokens cost more and take longer, because the model produces them one at a time.</p>
      </ConceptCard>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!edited && !completed && chips.length > 0 && outputTokens === 300 && repeat === 1}>
          {completed ? 'Next' : 'I played with it, continue'}
        </button>
      </div>
    </div>
  )
}
