import type { OrderStep } from '../../../simulation/ordering'

/**
 * Barbara Minto's SCQA opening, as four steps a learner puts in order.
 * A business-writing method, not a Claude feature, so no fact-sheet entry applies.
 */
export const scqaSteps: OrderStep[] = [
  {
    id: 'situation',
    label: 'Situation',
    explanation: 'Start where the room already agrees. Nobody argues with "you engaged us to cut order-to-cash time across the three business units", so it costs you nothing and buys attention.',
  },
  {
    id: 'complication',
    label: 'Complication',
    explanation: 'Then what changed. This is the reason the meeting exists: "two of the three business units are live; the third has not started."',
  },
  {
    id: 'question',
    label: 'Question',
    explanation: 'The complication forces one question. Say it out loud — "do we extend into phase two, or close out here?" — so the room is answering the same question you are.',
  },
  {
    id: 'answer',
    label: 'Answer',
    explanation: 'Your recommendation, stated before the evidence, not after it. Everything that follows exists to support this one sentence.',
  },
]

export interface GoverningThoughtOption {
  id: string
  label: string
  score: number
  explanation: string
}

/** Minto's governing thought: the single sentence the whole deck defends. */
export const governingThoughts: GoverningThoughtOption[] = [
  {
    id: 'topic',
    label: 'Q3 engagement review',
    score: 20,
    explanation: 'That is a subject line, not a thought. It tells the reader what the deck is about but not what you want them to do, so every slide can wander.',
  },
  {
    id: 'vague',
    label: 'Phase one delivered mixed results, with both successes and challenges',
    score: 40,
    explanation: 'It says something, but nothing anyone can disagree with or act on. "Mixed" is what you write when you have not decided yet.',
  },
  {
    id: 'sharp',
    label: 'Commit to phase two, but give the third business unit a named client owner by November',
    score: 100,
    explanation: 'A claim plus an action plus a date, and the action is the client’s, not yours. Someone can agree, disagree or ask for evidence — which is exactly what you want a steering committee to do.',
  },
  {
    id: 'overreach',
    label: 'This programme is the single biggest opportunity at Meridian and the scope must be doubled immediately',
    score: 45,
    explanation: 'Strong, but it promises more than three slides of evidence can carry. A governing thought you cannot defend collapses under the first question.',
  },
]
