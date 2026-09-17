import { beforeEach, describe, expect, it } from 'vitest'
import { makeStubTraining } from './fixtures'
import { clearTrainings, registerTraining } from './registry'
import { useProgressStore } from './store'

describe('progress store', () => {
  beforeEach(() => {
    clearTrainings()
    registerTraining(makeStubTraining())
    useProgressStore.setState({ progress: {} })
  })

  it('starts a training once and is idempotent', () => {
    const s = useProgressStore.getState()
    const first = s.startTraining('stub')
    s.completeLesson('stub', 'l1')
    const again = s.startTraining('stub')
    expect(first.lessons['l1']?.status).toBe('available')
    expect(again.lessons['l1']?.status).toBe('completed')
  })

  it('evaluates challenges through the lesson definition and records the attempt', () => {
    const s = useProgressStore.getState()
    s.startTraining('stub')
    s.completeLesson('stub', 'l1')
    s.recordScore('stub', 'l2', { score: 100, passed: true, breakdown: [], feedback: [] })
    s.completeLesson('stub', 'l2')
    const r = s.submitChallenge('stub', 'l3', 72)
    expect(r.passed).toBe(true)
    expect(r.score).toBe(72)
    const p = useProgressStore.getState().progress['stub']!
    expect(p.lessons['l3']).toMatchObject({ attempts: 1, bestScore: 72 })
  })

  it('treats invalid answers as a zero score', () => {
    const s = useProgressStore.getState()
    s.startTraining('stub')
    s.completeLesson('stub', 'l1')
    s.recordScore('stub', 'l2', { score: 100, passed: true, breakdown: [], feedback: [] })
    s.completeLesson('stub', 'l2')
    const r = s.submitChallenge('stub', 'l3', 'not a number')
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
  })

  it('rejects submissions to non-challenge lessons', () => {
    const s = useProgressStore.getState()
    s.startTraining('stub')
    expect(() => s.submitChallenge('stub', 'l1', 1)).toThrow(/not a challenge/)
  })

  it('resets a training', () => {
    const s = useProgressStore.getState()
    s.startTraining('stub')
    s.completeLesson('stub', 'l1')
    s.resetTraining('stub')
    expect(useProgressStore.getState().progress['stub']?.lessons['l1']?.status).toBe('available')
    expect(useProgressStore.getState().progress['stub']?.xp).toBe(0)
  })
})
