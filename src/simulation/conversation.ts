import { clamp, round } from './scoring'

/**
 * Why long chats get expensive: every turn re-sends the whole conversation.
 * Deterministic model of simulated tokens processed per turn, with an optional
 * restart ("new chat with a short summary") and an attachment that is either
 * re-sent in the chat or kept in a project (cached, so it weighs less).
 */

export interface ConversationInput {
  turns: number
  messageTokens: number
  replyTokens: number
  attachmentTokens: number
  /** Attachment lives in a project: cached, counted at a reduced simulated weight. */
  attachmentInProject: boolean
  /** Start a new chat after this many turns (0 = never). */
  restartEvery: number
  summaryTokens: number
}

export interface ConversationTurn {
  turn: number
  chat: number
  attachment: number
  history: number
  message: number
  reply: number
  total: number
}

export interface ConversationResult {
  turns: ConversationTurn[]
  total: number
  /** Same conversation with no restarts and the attachment in the chat. */
  baseline: number
  savedPercent: number
  /** Largest single-turn history, a proxy for "the model has to wade through a lot". */
  peakHistory: number
}

/** Simulated weight of cached project content relative to re-sent content. */
export const PROJECT_CACHE_WEIGHT = 0.1

function run(input: ConversationInput): { turns: ConversationTurn[]; total: number } {
  const turns: ConversationTurn[] = []
  const n = Math.max(0, Math.round(input.turns))
  const every = Math.max(0, Math.round(input.restartEvery))
  const msg = Math.max(0, input.messageTokens)
  const reply = Math.max(0, input.replyTokens)
  const attachment = Math.max(0, input.attachmentTokens) * (input.attachmentInProject ? PROJECT_CACHE_WEIGHT : 1)
  let history = 0
  let chat = 1
  let turnInChat = 0
  for (let t = 1; t <= n; t++) {
    if (every > 0 && turnInChat === every) {
      chat += 1
      turnInChat = 0
      history = Math.max(0, input.summaryTokens)
    }
    turnInChat += 1
    const total = attachment + history + msg + reply
    turns.push({ turn: t, chat, attachment: round(attachment), history: round(history), message: msg, reply, total: round(total) })
    history += msg + reply
  }
  return { turns, total: round(turns.reduce((s, t) => s + t.total, 0)) }
}

export function simulateConversation(input: ConversationInput): ConversationResult {
  const actual = run(input)
  const baseline = run({ ...input, attachmentInProject: false, restartEvery: 0 })
  return {
    turns: actual.turns,
    total: actual.total,
    baseline: baseline.total,
    savedPercent: baseline.total === 0 ? 0 : round(clamp(((baseline.total - actual.total) / baseline.total) * 100, -1000, 100)),
    peakHistory: Math.max(0, ...actual.turns.map((t) => t.history)),
  }
}
