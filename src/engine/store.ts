import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { clampScore, completeLesson, initialProgress, reconcileProgress, recordAttempt, resetLesson } from './progression'
import { requireTraining } from './registry'
import type { ChallengeResult, TrainingProgress } from './types'

export interface ProgressState {
  progress: Record<string, TrainingProgress>
  startTraining: (trainingId: string) => TrainingProgress
  getProgress: (trainingId: string) => TrainingProgress | undefined
  completeLesson: (trainingId: string, lessonId: string) => void
  submitChallenge: (trainingId: string, lessonId: string, answer: unknown) => ChallengeResult
  recordScore: (trainingId: string, lessonId: string, result: ChallengeResult) => void
  resetLesson: (trainingId: string, lessonId: string) => void
  resetTraining: (trainingId: string) => void
}

export const PROGRESS_STORAGE_KEY = 'ai-quest:progress:v1'

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      startTraining: (trainingId) => {
        const training = requireTraining(trainingId)
        const existing = get().progress[trainingId]
        if (existing) {
          const reconciled = reconcileProgress(training, existing)
          if (reconciled !== existing) set((s) => ({ progress: { ...s.progress, [trainingId]: reconciled } }))
          return reconciled
        }
        const fresh = initialProgress(training)
        set((s) => ({ progress: { ...s.progress, [trainingId]: fresh } }))
        return fresh
      },

      getProgress: (trainingId) => get().progress[trainingId],

      completeLesson: (trainingId, lessonId) => {
        const training = requireTraining(trainingId)
        const current = get().progress[trainingId] ?? initialProgress(training)
        const updated = completeLesson(training, current, lessonId)
        set((s) => ({ progress: { ...s.progress, [trainingId]: updated } }))
      },

      submitChallenge: (trainingId, lessonId, answer) => {
        const training = requireTraining(trainingId)
        const module = training.modules.find((m) => m.lessons.some((l) => l.id === lessonId))
        const lesson = module?.lessons.find((l) => l.id === lessonId)
        if (!lesson) throw new Error(`Unknown lesson "${lessonId}"`)
        if (lesson.type !== 'challenge' && lesson.type !== 'editor') {
          throw new Error(`Lesson "${lessonId}" is not a challenge`)
        }
        const raw = lesson.challenge.evaluate(answer)
        const passScore = lesson.challenge.passScore ?? 60
        const result: ChallengeResult = {
          ...raw,
          score: clampScore(raw.score),
          passed: clampScore(raw.score) >= passScore,
        }
        get().recordScore(trainingId, lessonId, result)
        return result
      },

      recordScore: (trainingId, lessonId, result) => {
        const training = requireTraining(trainingId)
        const current = get().progress[trainingId] ?? initialProgress(training)
        const updated = recordAttempt(current, lessonId, result)
        set((s) => ({ progress: { ...s.progress, [trainingId]: updated } }))
      },

      resetLesson: (trainingId, lessonId) => {
        const current = get().progress[trainingId]
        if (!current) return
        set((s) => ({ progress: { ...s.progress, [trainingId]: resetLesson(current, lessonId) } }))
      },

      resetTraining: (trainingId) => {
        const fresh = initialProgress(requireTraining(trainingId))
        set((s) => ({ progress: { ...s.progress, [trainingId]: fresh } }))
      },
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage()),
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
)

/** localStorage can throw in private windows or locked-down browsers; fall back to memory. */
function safeLocalStorage(): Storage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const probe = '__ai-quest-probe__'
      window.localStorage.setItem(probe, '1')
      window.localStorage.removeItem(probe)
      return window.localStorage
    }
  } catch {
    // fall through
  }
  const memory = new Map<string, string>()
  return {
    get length() {
      return memory.size
    },
    clear: () => memory.clear(),
    getItem: (k) => memory.get(k) ?? null,
    key: (i) => [...memory.keys()][i] ?? null,
    removeItem: (k) => void memory.delete(k),
    setItem: (k, v) => void memory.set(k, v),
  }
}
