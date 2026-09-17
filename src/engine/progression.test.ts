import { describe, expect, it } from 'vitest'
import { makeStubTraining } from './fixtures'
import {
  completeLesson,
  completionPercent,
  currentLessonId,
  earnedBadges,
  finalScore,
  initialProgress,
  nextLessonId,
  previousLessonId,
  recordAttempt,
  reconcileProgress,
  resetLesson,
} from './progression'
import type { ChallengeResult } from './types'

const training = makeStubTraining()
const result = (score: number): ChallengeResult => ({ score, passed: score >= 60, breakdown: [], feedback: [] })

describe('initialProgress', () => {
  it('makes only the first lesson available', () => {
    const p = initialProgress(training)
    expect(p.lessons['l1']?.status).toBe('available')
    expect(p.lessons['l2']?.status).toBe('locked')
    expect(p.lessons['l3']?.status).toBe('locked')
    expect(p.xp).toBe(0)
    expect(p.completed).toBe(false)
  })
})

describe('navigation', () => {
  it('walks across module boundaries', () => {
    expect(nextLessonId(training, 'l1')).toBe('l2')
    expect(nextLessonId(training, 'l2')).toBe('l3')
    expect(nextLessonId(training, 'l3')).toBeNull()
    expect(previousLessonId(training, 'l1')).toBeNull()
    expect(previousLessonId(training, 'l3')).toBe('l2')
  })
  it('throws for unknown lesson ids', () => {
    expect(() => nextLessonId(training, 'nope')).toThrow(/Unknown lesson/)
  })
})

describe('completeLesson', () => {
  it('completes, awards XP and unlocks the next lesson', () => {
    const p = completeLesson(training, initialProgress(training), 'l1')
    expect(p.lessons['l1']?.status).toBe('completed')
    expect(p.lessons['l2']?.status).toBe('available')
    expect(p.xp).toBe(10)
    expect(completionPercent(training, p)).toBe(33)
    expect(currentLessonId(training, p)).toBe('l2')
  })
  it('does not award XP twice', () => {
    let p = completeLesson(training, initialProgress(training), 'l1')
    p = completeLesson(training, p, 'l1')
    expect(p.xp).toBe(10)
  })
  it('refuses locked lessons', () => {
    expect(() => completeLesson(training, initialProgress(training), 'l3')).toThrow(/locked/)
  })
  it('requires an attempt before completing a scored lesson', () => {
    const p = completeLesson(training, initialProgress(training), 'l1')
    expect(() => completeLesson(training, p, 'l2')).toThrow(/at least one attempt/)
  })
  it('awards a bonus for scores of 90 or above', () => {
    let p = completeLesson(training, initialProgress(training), 'l1')
    p = recordAttempt(p, 'l2', result(95))
    p = completeLesson(training, p, 'l2')
    expect(p.xp).toBe(10 + 25 + 13)
    expect(p.badges).toEqual(['module:m1'])
  })
  it('marks the training complete and computes badges', () => {
    let p = completeLesson(training, initialProgress(training), 'l1')
    p = recordAttempt(p, 'l2', result(100))
    p = completeLesson(training, p, 'l2')
    p = recordAttempt(p, 'l3', result(80))
    p = completeLesson(training, p, 'l3')
    expect(p.completed).toBe(true)
    expect(completionPercent(training, p)).toBe(100)
    expect(finalScore(training, p)).toBe(90)
    expect(earnedBadges(training, p)).toEqual(['module:m1', 'module:m2', 'training:stub', 'training:stub:gold'])
  })
})

describe('recordAttempt', () => {
  it('tracks attempts, best and last score', () => {
    let p = completeLesson(training, initialProgress(training), 'l1')
    p = recordAttempt(p, 'l2', result(40))
    p = recordAttempt(p, 'l2', result(70))
    p = recordAttempt(p, 'l2', result(55))
    expect(p.lessons['l2']).toMatchObject({ attempts: 3, bestScore: 70, lastScore: 55 })
  })
  it('clamps scores into 0..100 and treats NaN as 0', () => {
    let p = completeLesson(training, initialProgress(training), 'l1')
    p = recordAttempt(p, 'l2', result(140))
    expect(p.lessons['l2']?.bestScore).toBe(100)
    p = recordAttempt(p, 'l2', result(Number.NaN))
    expect(p.lessons['l2']?.lastScore).toBe(0)
  })
  it('throws on locked lessons', () => {
    expect(() => recordAttempt(initialProgress(training), 'l3', result(50))).toThrow(/locked/)
  })
})

describe('resetLesson', () => {
  it('clears attempts but keeps status', () => {
    let p = completeLesson(training, initialProgress(training), 'l1')
    p = recordAttempt(p, 'l2', result(70))
    p = completeLesson(training, p, 'l2')
    p = resetLesson(p, 'l2')
    expect(p.lessons['l2']).toEqual({ status: 'completed', attempts: 0, bestScore: null, lastScore: null })
  })
})

describe('finalScore', () => {
  it('is null before any scored attempt', () => {
    expect(finalScore(training, initialProgress(training))).toBeNull()
  })
})

describe('reconcileProgress', () => {
  it('returns the same object when nothing changed', () => {
    const p = initialProgress(training)
    expect(reconcileProgress(training, p)).toBe(p)
  })
  it('adds records for new lessons and unlocks the next one', () => {
    let p = completeLesson(training, initialProgress(training), 'l1')
    p = recordAttempt(p, 'l2', result(100))
    p = completeLesson(training, p, 'l2')
    p = recordAttempt(p, 'l3', result(80))
    p = completeLesson(training, p, 'l3')
    expect(p.completed).toBe(true)
    const grown = makeStubTraining()
    grown.modules[1]!.lessons.push({ id: 'l4', title: 'New', type: 'explanation', component: () => null })
    const r = reconcileProgress(grown, p)
    expect(r.lessons['l4']?.status).toBe('available')
    expect(r.completed).toBe(false)
    expect(r.badges).toContain('module:m1')
    expect(r.badges).not.toContain('training:stub')
  })
  it('drops records for removed lessons', () => {
    const p = initialProgress(training)
    const shrunk = makeStubTraining()
    shrunk.modules[1]!.lessons = []
    const r = reconcileProgress(shrunk, p)
    expect(Object.keys(r.lessons)).toEqual(['l1', 'l2'])
  })
})
