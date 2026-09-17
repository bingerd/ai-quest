import { useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { getModel, requestCost } from '../../../simulation/models'
import { formatCurrency, formatTokens } from '../../../simulation/tokens'
import { ConceptCard } from '../../../ui/ConceptCard'
import { SimulationPanel } from '../../../ui/SimulationPanel'

const USERS = [10, 100, 1_000, 5_000]
const REQUESTS = [2, 10, 30]

export function ScaleCalculator({ onComplete, completed }: InteractiveLessonProps) {
  const [users, setUsers] = useState(1_000)
  const [perDay, setPerDay] = useState(10)
  const [contextMode, setContextMode] = useState<'paste' | 'retrieval'>('paste')
  const [caching, setCaching] = useState(false)
  const [touched, setTouched] = useState(false)

  const model = getModel('heron')
  const outputTokens = 300
  const baseContext = contextMode === 'paste' ? 15_000 : 2_000
  const instructions = 800
  const cachedShare = caching ? 0.5 : 0 // stable prefix billed at half in this simulation
  const effectiveInput = instructions + baseContext * (1 - cachedShare)
  const perRequest = requestCost(model, effectiveInput, outputTokens)
  const monthly = perRequest * users * perDay * 22
  const pasteMonthly = requestCost(model, instructions + 15_000, outputTokens) * users * perDay * 22

  const mark = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setTouched(true)
  }

  return (
    <div className="space-y-6">
      <p className="ink-2">
        One request is cheap. Organisations do not make one request. Set the dials for a team, then change how context is handled and watch the
        monthly number.
      </p>

      <SimulationPanel
        title="Monthly AI spend"
        aside={
          <div className="space-y-3">
            <div className="card px-3 py-3">
              <p className="text-xs ink-3">Simulated cost per month</p>
              <p className="text-3xl font-bold tabular-nums animate-pop" key={monthly.toFixed(0)}>
                {formatCurrency(monthly)}
              </p>
              <p className="text-xs ink-3">
                {formatTokens(users * perDay * 22)} requests · {formatTokens(Math.round(effectiveInput))} billed input tokens each
              </p>
            </div>
            {monthly < pasteMonthly && (
              <p className="rounded-xl border border-good/40 bg-good/10 p-3 text-sm" role="status">
                Saving {formatCurrency(pasteMonthly - monthly)} a month versus pasting the full document every time.
              </p>
            )}
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">People using it</legend>
            <div className="flex flex-wrap gap-2">
              {USERS.map((u) => (
                <button key={u} type="button" aria-pressed={users === u} onClick={() => mark(setUsers)(u)} className={`btn ${users === u ? 'btn-primary' : 'btn-secondary'}`}>
                  {formatTokens(u)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Requests per person per day</legend>
            <div className="flex flex-wrap gap-2">
              {REQUESTS.map((r) => (
                <button key={r} type="button" aria-pressed={perDay === r} onClick={() => mark(setPerDay)(r)} className={`btn ${perDay === r ? 'btn-primary' : 'btn-secondary'}`}>
                  {r}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2 sm:col-span-2">
            <legend className="text-sm font-semibold">How does the policy document reach the model?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${contextMode === 'paste' ? 'border-brand-500 bg-brand-500/10' : 'line'}`}>
                <input type="radio" name="ctx" checked={contextMode === 'paste'} onChange={() => mark(setContextMode)('paste')} className="mt-1 size-4 accent-brand-600" />
                <span>
                  <span className="block font-semibold">Paste the whole document</span>
                  <span className="block text-xs ink-3">15,000 tokens, every request</span>
                </span>
              </label>
              <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${contextMode === 'retrieval' ? 'border-brand-500 bg-brand-500/10' : 'line'}`}>
                <input type="radio" name="ctx" checked={contextMode === 'retrieval'} onChange={() => mark(setContextMode)('retrieval')} className="mt-1 size-4 accent-brand-600" />
                <span>
                  <span className="block font-semibold">Retrieve only the relevant section</span>
                  <span className="block text-xs ink-3">about 2,000 tokens per request</span>
                </span>
              </label>
            </div>
          </fieldset>
          <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
            <input type="checkbox" checked={caching} onChange={(e) => mark(setCaching)(e.target.checked)} className="size-4 accent-brand-600" />
            <span>
              <span className="font-semibold">Cache the stable prefix</span>
              <span className="block text-xs ink-3">Instructions and the document stay identical, so repeated requests are billed at half in this simulation.</span>
            </span>
          </label>
        </div>
      </SimulationPanel>

      <ConceptCard title="Small habits, big numbers" icon="📈">
        <p>The same choice that saves a few cents on one request saves thousands a month across a company. That is why context discipline is an operational concern, not a nicety.</p>
      </ConceptCard>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!touched && !completed}>
          {completed ? 'Next' : touched ? 'Continue' : 'Change a dial to continue'}
        </button>
      </div>
    </div>
  )
}
