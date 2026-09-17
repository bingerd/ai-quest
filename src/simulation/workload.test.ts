import { describe, expect, it } from 'vitest'
import { estimateCost, parseWorkloadAnswer, simulateWorkloadPlan, type Workload } from './workload'

const why = { realtime: 'Plain realtime.', batch: 'Batched.', 'realtime-cached': 'Cached.' }
const workloads: Workload[] = [
  { id: 'chat', title: 'Support chat', description: '', interactive: true, requests: 1_000, sharedPrefixTokens: 12_000, uniqueTokensPerRequest: 300, outputTokens: 400, best: 'realtime-cached', why },
  { id: 'nightly', title: 'Nightly classification', description: '', interactive: false, requests: 50_000, sharedPrefixTokens: 200, uniqueTokensPerRequest: 300, outputTokens: 20, best: 'batch', why },
]

describe('estimateCost', () => {
  it('halves batch cost and makes caching cheapest for a big shared prefix', () => {
    expect(estimateCost(workloads[1]!, 'batch')).toBe(estimateCost(workloads[1]!, 'realtime') / 2)
    expect(estimateCost(workloads[0]!, 'realtime-cached')).toBeLessThan(estimateCost(workloads[0]!, 'realtime'))
  })
})

describe('simulateWorkloadPlan', () => {
  it('scores correct choices 100', () => {
    const r = simulateWorkloadPlan(workloads, { choices: { chat: 'realtime-cached', nightly: 'batch' } })
    expect(r.score).toBe(100)
    expect(r.passed).toBe(true)
  })
  it('scores batching an interactive workload zero', () => {
    const r = simulateWorkloadPlan(workloads, { choices: { chat: 'batch', nightly: 'batch' } })
    expect(r.breakdown[0]?.score).toBe(0)
    expect(r.feedback[0]?.tone).toBe('warning')
  })
  it('gives partial credit for a workable but pricier choice', () => {
    expect(simulateWorkloadPlan(workloads, { choices: { chat: 'realtime', nightly: 'batch' } }).score).toBe(75)
  })
  it('handles missing and malformed answers', () => {
    expect(simulateWorkloadPlan(workloads, { choices: {} }).passed).toBe(false)
    expect(parseWorkloadAnswer({ choices: { a: 'batch', b: 'nope' } })).toEqual({ choices: { a: 'batch' } })
  })
})
