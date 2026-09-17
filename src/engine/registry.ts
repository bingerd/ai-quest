import type { Training } from './types'

const trainings = new Map<string, Training>()

export function registerTraining(training: Training): void {
  if (trainings.has(training.id)) {
    throw new Error(`Training "${training.id}" is already registered`)
  }
  validateTraining(training)
  trainings.set(training.id, training)
}

export function getTraining(id: string): Training | undefined {
  return trainings.get(id)
}

export function requireTraining(id: string): Training {
  const training = trainings.get(id)
  if (!training) throw new Error(`Unknown training "${id}"`)
  return training
}

export function listTrainings(): Training[] {
  return [...trainings.values()]
}

/** Test helper. */
export function clearTrainings(): void {
  trainings.clear()
}

function validateTraining(training: Training): void {
  const ids = new Set<string>()
  for (const module of training.modules) {
    for (const lesson of module.lessons) {
      if (ids.has(lesson.id)) {
        throw new Error(`Duplicate lesson id "${lesson.id}" in training "${training.id}"`)
      }
      ids.add(lesson.id)
    }
  }
  if (ids.size === 0) throw new Error(`Training "${training.id}" has no lessons`)
}
