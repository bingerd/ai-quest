import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { GRADER_COST, SAMPLE_CASES, type CaseType, type EvalResult, type Grader, type SampleSize } from '../../../simulation/evals'
import { formatCurrency, formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { MetricsTable } from '../../../ui/MetricsTable'

export interface EvalAnswer {
  caseTypes: CaseType[]
  sampleSize: SampleSize
  grader: Grader
}

const CASE_LABEL: Record<CaseType, { title: string; detail: string }> = {
  happy: { title: 'Typical tickets', detail: 'The everyday input your feature sees most' },
  edge: { title: 'Edge cases', detail: 'Rare locales, empty bodies, enormous attachments' },
  adversarial: { title: 'Adversarial', detail: 'Customer text that tries to steer the model' },
  regression: { title: 'Past bugs', detail: 'Every issue you have already fixed once' },
}

export function EvalLab({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<EvalAnswer>) {
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([])
  const [sampleSize, setSampleSize] = useState<SampleSize>('small')
  const [grader, setGrader] = useState<Grader>('code')
  const typed = result as EvalResult | null
  const locked = !!result
  const cases = SAMPLE_CASES[sampleSize]

  return (
    <ChallengeFrame
      title="Eval Lab"
      brief={
        <>
          <p>You are about to change the prompt of a live ticket classifier. Build the eval suite that runs before the change ships, then see what reaches production.</p>
          <p className="text-xs ink-3">Five regressions are hiding in this change. Which ones your suite catches depends on the cases you include, how many you run, and how they are graded.</p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={caseTypes.length > 0}
      onSubmit={() => submit({ caseTypes, sampleSize, grader })}
      onRetry={() => {
        setCaseTypes([])
        setSampleSize('small')
        setGrader('code')
        retry()
      }}
      onContinue={onContinue}
      submitLabel="Ship the change"
      resultExtra={
        typed ? (
          <MetricsTable
            metrics={[
              { label: 'Caught', value: `${typed.caught.length} / ${typed.caught.length + typed.missed.length}` },
              { label: 'Cases run', value: formatTokens(typed.metrics['cases'] ?? 0) },
              { label: 'Cost per run', value: formatCurrency(typed.metrics['cost'] ?? 0) },
              { label: 'Time per run', value: (typed.metrics['minutes'] ?? 0) >= 1 ? `${Math.round(typed.metrics['minutes'] ?? 0)} min` : 'under a minute' },
            ]}
          />
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset disabled={locked} className="space-y-2">
          <legend className="text-sm font-semibold">Case types</legend>
          {(Object.keys(CASE_LABEL) as CaseType[]).map((t) => (
            <label key={t} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm ${caseTypes.includes(t) ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
              <input type="checkbox" checked={caseTypes.includes(t)} onChange={() => setCaseTypes((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]))} className="mt-0.5 size-4 accent-brand-600" />
              <span>
                <span className="block font-semibold">{CASE_LABEL[t].title}</span>
                <span className="block text-xs ink-3">{CASE_LABEL[t].detail}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="space-y-4">
          <fieldset disabled={locked} className="space-y-2">
            <legend className="text-sm font-semibold">Cases per run</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SAMPLE_CASES) as SampleSize[]).map((s) => (
                <label key={s} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${sampleSize === s ? 'border-brand-500 bg-brand-500/10 font-semibold' : 'line'}`}>
                  <input type="radio" name="sample" checked={sampleSize === s} onChange={() => setSampleSize(s)} className="sr-only" />
                  {formatTokens(SAMPLE_CASES[s])}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={locked} className="space-y-2">
            <legend className="text-sm font-semibold">Grading</legend>
            {(Object.keys(GRADER_COST) as Grader[]).map((g) => (
              <label key={g} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm ${grader === g ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
                <input type="radio" name="grader" checked={grader === g} onChange={() => setGrader(g)} className="mt-0.5 size-4 accent-brand-600" />
                <span>
                  <span className="block font-semibold">{GRADER_COST[g].label}</span>
                  <span className="block text-xs ink-3 tabular-nums">
                    {formatCurrency(GRADER_COST[g].perCase * cases)} and {GRADER_COST[g].minutesPerCase * cases >= 1 ? `about ${Math.round(GRADER_COST[g].minutesPerCase * cases)} min` : 'under a minute'} for {formatTokens(cases)} cases
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>
    </ChallengeFrame>
  )
}
