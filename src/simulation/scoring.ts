import type { ScoreDimension } from '../engine/types'

export function clamp(n: number, min = 0, max = 100): number {
  if (Number.isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

export function round(n: number, decimals = 0): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

/** Weighted mean of dimension scores, rounded to an integer 0..100. */
export function weightedTotal(dimensions: ScoreDimension[]): number {
  const totalWeight = dimensions.reduce((s, d) => s + (d.weight ?? 1), 0)
  if (totalWeight === 0) return 0
  const sum = dimensions.reduce((s, d) => s + clamp(d.score) * (d.weight ?? 1), 0)
  return Math.round(clamp(sum / totalWeight))
}

/** Linear score that is 100 at `best` and 0 at `worst` (either direction). */
export function linearScore(value: number, best: number, worst: number): number {
  if (best === worst) return value <= best ? 100 : 0
  const t = (value - worst) / (best - worst)
  return round(clamp(t * 100))
}
