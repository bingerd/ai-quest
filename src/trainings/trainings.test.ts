import { describe, expect, it } from 'vitest'
import { listTrainings } from '../engine/registry'
import './index'
import { validateTrainingData } from './testing/validateTrainingData'

describe('registered trainings', () => {
  const trainings = listTrainings()

  it('registers every training folder', () => {
    expect(trainings.map((t) => t.id)).toEqual(expect.arrayContaining(['token-management', 'everyday-claude', 'claude-code-power-user']))
  })

  it.each(trainings.map((t) => [t.id, t]))('%s is internally consistent', (_id, training) => {
    expect(validateTrainingData(training)).toEqual([])
  })

  it('only recommends trainings that exist', () => {
    const ids = new Set(trainings.map((t) => t.id))
    for (const t of trainings) for (const r of t.recommendedAfter ?? []) expect(ids.has(r), `${t.id} → ${r}`).toBe(true)
  })
})
