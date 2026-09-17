import { useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { MAX_BREAKPOINTS, simulateCaching, type CacheArchitectResult } from '../../../simulation/caching'
import { formatTokens } from '../../../simulation/tokens'
import { ChallengeFrame } from '../../../ui/Challenge'
import { MetricsTable } from '../../../ui/MetricsTable'
import { OrderList } from '../../../ui/OrderList'
import { cacheScenario } from '../data/caching'

export interface CacheAnswer {
  order: string[]
  breakpoints: string[]
  ttl: '5m' | '1h'
}

export function CacheArchitect({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<CacheAnswer>) {
  const [order, setOrder] = useState<string[]>(cacheScenario.order)
  const [breakpoints, setBreakpoints] = useState<string[]>([])
  const [ttl, setTtl] = useState<'5m' | '1h'>('5m')
  const typed = result as CacheArchitectResult | null
  const live = simulateCaching({ ...cacheScenario, order, breakpoints, ttl })
  const locked = !!result

  const toggleBreakpoint = (id: string) => {
    if (locked) return
    setBreakpoints((b) => (b.includes(id) ? b.filter((x) => x !== id) : b.length >= MAX_BREAKPOINTS ? b : [...b, id]))
  }

  return (
    <ChallengeFrame
      title="Cache Architect"
      brief={
        <>
          <p>A support assistant makes {cacheScenario.calls} calls an hour, about {cacheScenario.minutesBetweenCalls} minutes apart. Arrange the request so prompt caching can do its job.</p>
          <p className="text-xs ink-3">The cache is a prefix cache: everything before a breakpoint must be identical on the next call. Writes cost 1.25x (5 minutes) or 2x (1 hour), reads 0.1x, and a prefix under {formatTokens(cacheScenario.minCacheableTokens)} tokens is not cached at all. At most {MAX_BREAKPOINTS} breakpoints.</p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={true}
      onSubmit={() => submit({ order, breakpoints, ttl })}
      onRetry={() => {
        setOrder(cacheScenario.order)
        setBreakpoints([])
        setTtl('5m')
        retry()
      }}
      onContinue={onContinue}
      submitLabel="Run 200 calls"
      resultExtra={
        typed ? (
          <MetricsTable
            metrics={[
              { label: 'Saved', value: `${typed.run.savedPercent}%`, hint: `best possible ${typed.ideal.savedPercent}%` },
              { label: 'Cached prefix', value: formatTokens(typed.run.cachedPrefixTokens) },
              { label: 'Writes / reads', value: `${typed.run.writes} / ${typed.run.reads}` },
              { label: 'Relative cost', value: formatTokens(typed.run.cost), hint: `uncached ${formatTokens(typed.run.baselineCost)}` },
            ]}
          />
        ) : null
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Request order (top is sent first)</p>
          <OrderList
            title="Request blocks"
            items={cacheScenario.blocks.map((b) => ({
              id: b.id,
              label: b.label,
              detail: (
                <span>
                  {formatTokens(b.tokens)} tokens · {b.changesEveryCall ? <span className="text-warn">changes every call</span> : 'identical every call'}
                  {b.detail ? ` · ${b.detail}` : ''}
                </span>
              ),
            }))}
            order={order}
            onChange={setOrder}
            disabled={locked}
            renderExtra={(id) => (
              <label className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs ${breakpoints.includes(id) ? 'border-brand-500 bg-brand-500/10 font-semibold' : 'line ink-3'}`}>
                <input type="checkbox" checked={breakpoints.includes(id)} onChange={() => toggleBreakpoint(id)} disabled={locked} className="size-3.5 accent-brand-600" />
                breakpoint
              </label>
            )}
          />
        </div>
        <div className="space-y-3">
          <fieldset disabled={locked} className="space-y-1 text-sm">
            <legend className="font-semibold">Cache lifetime</legend>
            {(['5m', '1h'] as const).map((t) => (
              <label key={t} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 ${ttl === t ? 'border-brand-500 bg-brand-500/10' : 'line'}`}>
                <input type="radio" name="ttl" checked={ttl === t} onChange={() => setTtl(t)} className="size-4 accent-brand-600" />
                {t === '5m' ? '5 minutes (write 1.25x)' : '1 hour (write 2x)'}
              </label>
            ))}
          </fieldset>
          <div className="card p-3" aria-live="polite">
            <p className="text-xs ink-3">Cached prefix</p>
            <p className="text-2xl font-bold tabular-nums">{formatTokens(live.cachedPrefixTokens)}</p>
            <p className="text-xs ink-3">Saving</p>
            <p className={`text-2xl font-bold tabular-nums ${live.savedPercent > 0 ? 'text-good' : 'text-bad'}`}>{live.savedPercent}%</p>
            <p className="mt-1 text-xs ink-3">{live.reason}</p>
          </div>
        </div>
      </div>
    </ChallengeFrame>
  )
}
