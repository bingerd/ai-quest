import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  EngagementContext,
  useEngagementSummary,
  type EngagementValue,
} from './EngagementContext'

/** Stateful wrapper that collects which elements a lesson wants explored. */
export function EngagementProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, boolean>>({})

  const value = useMemo<EngagementValue>(() => {
    const values = Object.values(entries)
    return {
      register: (key) => setEntries((e) => (key in e ? e : { ...e, [key]: false })),
      satisfy: (key) => setEntries((e) => (e[key] ? e : { ...e, [key]: true })),
      isSatisfied: (key) => entries[key] === true,
      allSatisfied: values.length === 0 || values.every((v) => v),
      required: values.length,
      remaining: values.filter((v) => !v).length,
    }
  }, [entries])

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>
}

/** Continue button for explanation lessons, locked until everything has been explored. */
export function EngagementContinue({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  const { allSatisfied, remaining } = useEngagementSummary()
  const ready = completed || allSatisfied
  const [nudge, setNudge] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = () => {
    if (ready) {
      onComplete()
      return
    }
    clearTimeout(timer.current)
    setNudge(true)
    timer.current = setTimeout(() => setNudge(false), 700)
  }

  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        aria-disabled={!ready}
        className={`btn btn-primary ${ready ? '' : 'cursor-not-allowed opacity-60'} ${
          nudge ? 'animate-shake ring-2 ring-bad' : ''
        }`}
        onClick={handleClick}
      >
        {completed ? 'Next' : ready ? 'Got it, continue' : `Explore everything first (${remaining} left)`}
      </button>
    </div>
  )
}