import { createContext, useContext, useEffect, useId } from 'react'

/**
 * Mandatory click-through tracking for explanation lessons.
 *
 * Interactive MDX components register themselves via `useEngageable` and
 * report when the learner has actually used them. A lesson's Continue button
 * stays disabled until every registered element has been engaged. Outside an
 * `EngagementProvider` (interactive lessons, tests) everything passes through.
 */

export interface EngagementValue {
  register: (key: string) => void
  satisfy: (key: string) => void
  isSatisfied: (key: string) => boolean
  allSatisfied: boolean
  required: number
  remaining: number
}

export const EngagementContext = createContext<EngagementValue | null>(null)

export interface Engageable {
  /** True only when running inside an EngagementProvider (i.e. gating is active). */
  present: boolean
  /** Whether this element's requirement has been met. */
  satisfied: boolean
  /** Report this element as engaged. Idempotent. */
  mark: () => void
}

export function useEngageable(): Engageable {
  const ctx = useContext(EngagementContext)
  const id = useId()

  useEffect(() => {
    ctx?.register(id)
  }, [ctx, id])

  if (!ctx) return { present: false, satisfied: true, mark: () => {} }
  return { present: true, satisfied: ctx.isSatisfied(id), mark: () => ctx.satisfy(id) }
}

export interface EngagementSummary {
  allSatisfied: boolean
  required: number
  remaining: number
}

export function useEngagementSummary(): EngagementSummary {
  const ctx = useContext(EngagementContext)
  if (!ctx) return { allSatisfied: true, required: 0, remaining: 0 }
  return { allSatisfied: ctx.allSatisfied, required: ctx.required, remaining: ctx.remaining }
}