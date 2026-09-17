import type { ComponentType } from 'react'

/**
 * Generic training domain model.
 *
 * The engine knows nothing about tokens, models or any other subject.
 * It only understands trainings, modules, lessons, challenges, scores and
 * feedback. Subject knowledge lives in `src/simulation` and `src/trainings`.
 */

export type LessonType =
  | 'explanation'
  | 'interactive'
  | 'simulation'
  | 'challenge'
  | 'quiz'
  | 'editor'
  | 'reflection'

export type FeedbackTone = 'positive' | 'neutral' | 'warning'

export interface Feedback {
  tone: FeedbackTone
  title: string
  body: string
  /** Optional concept tag, e.g. "context-pollution", used for "learn more" links. */
  concept?: string
}

export interface ScoreDimension {
  id: string
  label: string
  /** 0..100 */
  score: number
  /** Relative weight used when computing the total. Defaults to 1. */
  weight?: number
}

export interface ChallengeResult {
  /** 0..100, always a simulation score. */
  score: number
  passed: boolean
  breakdown: ScoreDimension[]
  feedback: Feedback[]
  /** Free-form simulated metrics (cost, latency, tokens...) for display. */
  metrics?: Record<string, number>
  /** One-line summary shown above the breakdown. */
  summary?: string
}

/** Props passed by the engine to every challenge/editor lesson component. */
export interface ChallengeProps<TAnswer = unknown> {
  submit: (answer: TAnswer) => ChallengeResult
  result: ChallengeResult | null
  attempts: number
  bestScore: number | null
  /** Clear the current result so the learner can try again. */
  retry: () => void
  /** Mark the lesson complete and move on. */
  onContinue: () => void
}

export interface ChallengeDefinition<TAnswer = unknown> {
  /** Free-form discriminator, e.g. "context-selection". */
  kind: string
  component: ComponentType<ChallengeProps<TAnswer>>
  /** Pure, deterministic evaluation. Must never call external services. */
  evaluate(answer: TAnswer): ChallengeResult
  /** Score needed to count as passed. Defaults to 60. */
  passScore?: number
}

/** Props passed to interactive/simulation/reflection lesson components. */
export interface InteractiveLessonProps {
  onComplete: () => void
  completed: boolean
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: { id: string; label: string }[]
  correctOptionId: string
  explanation: string
}

interface LessonBase {
  id: string
  title: string
  estimatedMinutes?: number
  /** XP awarded on completion. Defaults depend on the lesson type. */
  xp?: number
}

export type Lesson = LessonBase &
  (
    | { type: 'explanation'; component: ComponentType }
    | { type: 'interactive'; component: ComponentType<InteractiveLessonProps> }
    | { type: 'simulation'; component: ComponentType<InteractiveLessonProps> }
    | { type: 'reflection'; component: ComponentType<InteractiveLessonProps> }
    | { type: 'challenge'; challenge: ChallengeDefinition }
    | { type: 'editor'; challenge: ChallengeDefinition }
    | { type: 'quiz'; questions: QuizQuestion[]; passScore?: number }
  )

export interface TrainingModule {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

export interface Training {
  id: string
  title: string
  description: string
  estimatedMinutes: number
  /** Short tagline shown on the catalogue card. */
  tagline?: string
  modules: TrainingModule[]
}

export type LessonStatus = 'locked' | 'available' | 'completed'

export interface LessonRecord {
  status: LessonStatus
  attempts: number
  bestScore: number | null
  lastScore: number | null
}

export interface TrainingProgress {
  trainingId: string
  lessons: Record<string, LessonRecord>
  xp: number
  badges: string[]
  completed: boolean
}

/** Helper so training authors get full type inference for the answer type. */
export function defineChallenge<TAnswer>(def: ChallengeDefinition<TAnswer>): ChallengeDefinition {
  return def as unknown as ChallengeDefinition
}
