import type {
  ChallengeResult,
  Lesson,
  LessonRecord,
  LessonType,
  Training,
  TrainingModule,
  TrainingProgress,
} from './types'

export interface FlatLesson {
  lesson: Lesson
  module: TrainingModule
  index: number
}

const DEFAULT_XP: Record<LessonType, number> = {
  explanation: 10,
  interactive: 20,
  simulation: 30,
  reflection: 15,
  quiz: 25,
  challenge: 50,
  editor: 40,
}

const SCORED_TYPES: ReadonlySet<LessonType> = new Set(['challenge', 'editor', 'quiz', 'simulation'])

export function flattenLessons(training: Training): FlatLesson[] {
  const out: FlatLesson[] = []
  for (const module of training.modules) {
    for (const lesson of module.lessons) {
      out.push({ lesson, module, index: out.length })
    }
  }
  return out
}

export function findLesson(training: Training, lessonId: string): FlatLesson {
  const found = flattenLessons(training).find((f) => f.lesson.id === lessonId)
  if (!found) throw new Error(`Unknown lesson "${lessonId}" in training "${training.id}"`)
  return found
}

export function lessonXp(lesson: Lesson): number {
  return lesson.xp ?? DEFAULT_XP[lesson.type]
}

export function isScoredLesson(lesson: Lesson): boolean {
  return SCORED_TYPES.has(lesson.type)
}

function emptyRecord(status: LessonRecord['status']): LessonRecord {
  return { status, attempts: 0, bestScore: null, lastScore: null }
}

export function initialProgress(training: Training): TrainingProgress {
  const lessons: Record<string, LessonRecord> = {}
  flattenLessons(training).forEach(({ lesson }, i) => {
    lessons[lesson.id] = emptyRecord(i === 0 ? 'available' : 'locked')
  })
  return { trainingId: training.id, lessons, xp: 0, badges: [], completed: false }
}

function getRecord(progress: TrainingProgress, lessonId: string): LessonRecord {
  const record = progress.lessons[lessonId]
  if (!record) throw new Error(`No progress record for lesson "${lessonId}"`)
  return record
}

export function nextLessonId(training: Training, lessonId: string): string | null {
  const flat = flattenLessons(training)
  const { index } = findLesson(training, lessonId)
  return flat[index + 1]?.lesson.id ?? null
}

export function previousLessonId(training: Training, lessonId: string): string | null {
  const flat = flattenLessons(training)
  const { index } = findLesson(training, lessonId)
  return index > 0 ? (flat[index - 1]?.lesson.id ?? null) : null
}

/** Record a challenge/quiz attempt without completing the lesson. */
export function recordAttempt(
  progress: TrainingProgress,
  lessonId: string,
  result: ChallengeResult,
): TrainingProgress {
  const record = getRecord(progress, lessonId)
  if (record.status === 'locked') throw new Error(`Lesson "${lessonId}" is locked`)
  const score = clampScore(result.score)
  const bestScore = record.bestScore === null ? score : Math.max(record.bestScore, score)
  return {
    ...progress,
    lessons: {
      ...progress.lessons,
      [lessonId]: { ...record, attempts: record.attempts + 1, bestScore, lastScore: score },
    },
  }
}

/** Mark a lesson complete, award XP (first completion only) and unlock the next lesson. */
export function completeLesson(
  training: Training,
  progress: TrainingProgress,
  lessonId: string,
): TrainingProgress {
  const { lesson } = findLesson(training, lessonId)
  const record = getRecord(progress, lessonId)
  if (record.status === 'locked') throw new Error(`Lesson "${lessonId}" is locked`)
  if (isScoredLesson(lesson) && record.attempts === 0) {
    throw new Error(`Lesson "${lessonId}" requires at least one attempt before completion`)
  }

  const firstCompletion = record.status !== 'completed'
  const lessons = { ...progress.lessons, [lessonId]: { ...record, status: 'completed' as const } }

  const next = nextLessonId(training, lessonId)
  if (next) {
    const nextRecord = lessons[next] ?? emptyRecord('locked')
    if (nextRecord.status === 'locked') lessons[next] = { ...nextRecord, status: 'available' }
  }

  let xp = progress.xp
  if (firstCompletion) {
    xp += lessonXp(lesson)
    if (isScoredLesson(lesson) && (record.bestScore ?? 0) >= 90) xp += Math.round(lessonXp(lesson) / 2)
  }

  const updated: TrainingProgress = { ...progress, lessons, xp, completed: false }
  updated.badges = earnedBadges(training, updated)
  updated.completed = flattenLessons(training).every((f) => updated.lessons[f.lesson.id]?.status === 'completed')
  return updated
}

/** Clear attempts and scores for a lesson so it can be replayed. Keeps completion status. */
export function resetLesson(progress: TrainingProgress, lessonId: string): TrainingProgress {
  const record = getRecord(progress, lessonId)
  return {
    ...progress,
    lessons: { ...progress.lessons, [lessonId]: { ...emptyRecord(record.status) } },
  }
}

export function completionPercent(training: Training, progress: TrainingProgress): number {
  const flat = flattenLessons(training)
  if (flat.length === 0) return 0
  const done = flat.filter((f) => progress.lessons[f.lesson.id]?.status === 'completed').length
  return Math.round((done / flat.length) * 100)
}

export function moduleCompletionPercent(module: TrainingModule, progress: TrainingProgress): number {
  if (module.lessons.length === 0) return 0
  const done = module.lessons.filter((l) => progress.lessons[l.id]?.status === 'completed').length
  return Math.round((done / module.lessons.length) * 100)
}

/** Mean of best scores across scored lessons that have been attempted. Null when none. */
export function finalScore(training: Training, progress: TrainingProgress): number | null {
  const scores = flattenLessons(training)
    .filter((f) => isScoredLesson(f.lesson))
    .map((f) => progress.lessons[f.lesson.id]?.bestScore ?? null)
    .filter((s): s is number => s !== null)
  if (scores.length === 0) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export function earnedBadges(training: Training, progress: TrainingProgress): string[] {
  const badges: string[] = []
  for (const module of training.modules) {
    if (moduleCompletionPercent(module, progress) === 100) badges.push(`module:${module.id}`)
  }
  const allDone = flattenLessons(training).every((f) => progress.lessons[f.lesson.id]?.status === 'completed')
  if (allDone) badges.push(`training:${training.id}`)
  const score = finalScore(training, progress)
  if (allDone && score !== null && score >= 90) badges.push(`training:${training.id}:gold`)
  return badges
}

/** Which lesson the learner should continue from: first non-completed available lesson. */
export function currentLessonId(training: Training, progress: TrainingProgress): string {
  const flat = flattenLessons(training)
  const next = flat.find((f) => progress.lessons[f.lesson.id]?.status === 'available')
  return next?.lesson.id ?? flat[flat.length - 1]?.lesson.id ?? ''
}

export function clampScore(score: number): number {
  if (Number.isNaN(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}
