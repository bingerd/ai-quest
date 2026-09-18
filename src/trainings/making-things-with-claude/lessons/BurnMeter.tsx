import { useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { simulateDesignBurn, type ChangeStyle, type Fidelity } from '../../../simulation/designBurn'
import { formatTokens } from '../../../simulation/tokens'
import { ConceptCard } from '../../../ui/ConceptCard'
import { SimulationPanel } from '../../../ui/SimulationPanel'

const FIDELITIES: { id: Fidelity; label: string; hint: string }[] = [
  { id: 'outline', label: 'Outline first', hint: 'One line per slide, no styling' },
  { id: 'draft', label: 'Rough draft', hint: 'Real content, plain look' },
  { id: 'polished', label: 'Finished look', hint: 'Designed from the first prompt' },
]

const STYLES: { id: ChangeStyle; label: string; hint: string }[] = [
  { id: 'one-at-a-time', label: 'One note at a time', hint: 'Send each comment as you get it' },
  { id: 'batched', label: 'All at once', hint: 'Collect the comments, send one list' },
]

export function BurnMeter({ onComplete, completed }: InteractiveLessonProps) {
  const [slides, setSlides] = useState(20)
  const [rounds, setRounds] = useState(3)
  const [fidelity, setFidelity] = useState<Fidelity>('polished')
  const [changeStyle, setChangeStyle] = useState<ChangeStyle>('one-at-a-time')
  const [designSystem, setDesignSystem] = useState(false)

  const r = simulateDesignBurn({ slides, fidelity, changeStyle, designSystem, reviewRounds: rounds })
  const ready = r.savedPercent >= 60
  const widest = Math.max(1, ...r.parts.map((p) => p.tokens))

  return (
    <div className="space-y-6">
      <p className="ink-2">
        The same twenty-slide deck, the same three rounds of feedback, done four different ways. The
        deck size and the number of reviewers are usually not yours to choose. The other three are.
        Get the work down by <strong className="ink-1">60%</strong> to continue.
      </p>

      <SimulationPanel
        title="Cost of a design run"
        aside={
          <div className="space-y-3 md:sticky md:top-20">
            <div className="card px-3 py-2" aria-live="polite">
              <p className="text-xs ink-3">Simulated work</p>
              <p className="text-2xl font-bold tabular-nums">{formatTokens(r.total)}</p>
              <p className="text-xs ink-3">the wasteful way: {formatTokens(r.baseline)}</p>
            </div>
            <p className={`rounded-xl border p-3 text-sm ${ready ? 'border-good/40 bg-good/10' : 'line surface-2'}`} role="status">
              {r.savedPercent > 0 ? `${r.savedPercent}% less work for the same deck.` : 'This is the expensive way round. Try the three controls below.'}
            </p>
            <ul className="space-y-1.5">
              {r.parts.map((p) => (
                <li key={p.id} className="text-xs">
                  <span className="flex justify-between gap-2 ink-2">
                    <span className="min-w-0 truncate">{p.label}</span>
                    <span className="tabular-nums ink-3">{formatTokens(p.tokens)}</span>
                  </span>
                  <span className="mt-0.5 block h-1.5 rounded-full surface-2">
                    <span className="block h-full rounded-full bg-brand-500" style={{ width: `${Math.round((p.tokens / widest) * 100)}%` }} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs ink-3">Simulated figures for teaching. Anthropic publishes no numbers for this.</p>
          </div>
        }
      >
        <div className="space-y-4">
          <fieldset className="space-y-1 text-sm">
            <legend className="font-semibold">What you ask for first</legend>
            <div className="flex flex-wrap gap-2">
              {FIDELITIES.map((f) => (
                <label
                  key={f.id}
                  title={f.hint}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                    fidelity === f.id ? 'border-brand-500 bg-brand-500/15 font-semibold' : 'line'
                  }`}
                >
                  <input type="radio" className="sr-only" name="fidelity" checked={fidelity === f.id} onChange={() => setFidelity(f.id)} />
                  {f.label}
                </label>
              ))}
            </div>
            <p className="text-xs ink-3">{FIDELITIES.find((f) => f.id === fidelity)?.hint}</p>
          </fieldset>

          <fieldset className="space-y-1 text-sm">
            <legend className="font-semibold">How you send feedback</legend>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <label
                  key={s.id}
                  title={s.hint}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                    changeStyle === s.id ? 'border-brand-500 bg-brand-500/15 font-semibold' : 'line'
                  }`}
                >
                  <input type="radio" className="sr-only" name="change-style" checked={changeStyle === s.id} onChange={() => setChangeStyle(s.id)} />
                  {s.label}
                </label>
              ))}
            </div>
            <p className="text-xs ink-3">{STYLES.find((s) => s.id === changeStyle)?.hint}</p>
          </fieldset>

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={designSystem} onChange={(e) => setDesignSystem(e.target.checked)} className="mt-1 size-4 accent-brand-600" />
            <span>
              <span className="font-semibold">The design system is already set up</span>
              <span className="block text-xs ink-3">Brand colours, fonts and components come as standard, and Claude corrects its own output against them.</span>
            </span>
          </label>

          <label className="block text-sm">
            <span className="flex justify-between font-semibold">
              Slides <span className="tabular-nums ink-2">{slides}</span>
            </span>
            <input type="range" min={5} max={40} step={1} value={slides} onChange={(e) => setSlides(Number(e.target.value))} className="w-full accent-brand-600" aria-valuetext={`${slides} slides`} />
          </label>

          <label className="block text-sm">
            <span className="flex justify-between font-semibold">
              Rounds of feedback <span className="tabular-nums ink-2">{rounds}</span>
            </span>
            <input type="range" min={1} max={8} step={1} value={rounds} onChange={(e) => setRounds(Number(e.target.value))} className="w-full accent-brand-600" aria-valuetext={`${rounds} rounds`} />
          </label>
        </div>
      </SimulationPanel>

      <ConceptCard title="Scope and iterations, nothing else" icon="🔁">
        <p>
          Notice what the sliders do not fix. Making the deck smaller helps a little; the three
          habits help far more. Settle the structure while it is cheap to change, collect your
          feedback before you send it, and get the design system in place once instead of
          correcting the styling every time.
        </p>
      </ConceptCard>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!ready && !completed}>
          {completed ? 'Next' : ready ? 'Continue' : 'Cut the work by 60% to continue'}
        </button>
      </div>
    </div>
  )
}
