import { useMemo, useState, type ReactNode } from 'react'
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
  return (
    <div className="flex justify-end pt-2">
      <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!ready}>
        {completed ? 'Next' : ready ? 'Got it, continue' : `Explore everything first (${remaining} left)`}
      </button>
    </div>
  )
}