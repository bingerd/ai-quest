import type { Training } from '../../engine/types'

/**
 * Structural checks every training should pass. Returns a list of problems
 * (empty when fine) so tests can show all issues at once.
 */
export function validateTrainingData(training: Training): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  let minutes = 0
  for (const module of training.modules) {
    if (module.lessons.length === 0) problems.push(`Module "${module.id}" has no lessons`)
    for (const lesson of module.lessons) {
      if (ids.has(lesson.id)) problems.push(`Duplicate lesson id "${lesson.id}"`)
      ids.add(lesson.id)
      minutes += lesson.estimatedMinutes ?? 0
      if (!lesson.title.trim()) problems.push(`Lesson "${lesson.id}" has no title`)
      if (lesson.type === 'quiz') {
        for (const q of lesson.questions) {
          if (!q.options.some((o) => o.id === q.correctOptionId)) problems.push(`Quiz question "${q.id}" has no matching correct option`)
        }
      }
    }
  }
  const last = training.modules.at(-1)?.lessons.at(-1)
  if (!last || (last.type !== 'challenge' && last.type !== 'editor')) problems.push('The last lesson should be a scored final challenge')
  if (Math.abs(minutes - training.estimatedMinutes) > 8) problems.push(`Lesson minutes (${minutes}) are far from estimatedMinutes (${training.estimatedMinutes})`)
  return problems
}
