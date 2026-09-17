import { beforeEach, describe, expect, it } from 'vitest'
import { makeStubTraining } from './fixtures'
import { clearTrainings, getTraining, listTrainings, registerTraining, requireTraining } from './registry'

describe('registry', () => {
  beforeEach(() => clearTrainings())

  it('registers and lists trainings', () => {
    registerTraining(makeStubTraining())
    expect(listTrainings().map((t) => t.id)).toEqual(['stub'])
    expect(getTraining('stub')?.title).toBe('Stub training')
    expect(getTraining('nope')).toBeUndefined()
    expect(() => requireTraining('nope')).toThrow(/Unknown training/)
  })

  it('rejects duplicate registrations', () => {
    registerTraining(makeStubTraining())
    expect(() => registerTraining(makeStubTraining())).toThrow(/already registered/)
  })

  it('rejects duplicate lesson ids', () => {
    const t = makeStubTraining()
    t.modules[0]!.lessons.push({ ...t.modules[0]!.lessons[0]! })
    expect(() => registerTraining(t)).toThrow(/Duplicate lesson id/)
  })

  it('rejects empty trainings', () => {
    expect(() => registerTraining({ ...makeStubTraining(), modules: [] })).toThrow(/no lessons/)
  })
})
