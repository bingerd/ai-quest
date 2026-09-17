import { describe, expect, it } from 'vitest'
import { simulateConversation, type ConversationInput } from './conversation'

const base: ConversationInput = { turns: 4, messageTokens: 100, replyTokens: 300, attachmentTokens: 1000, attachmentInProject: false, restartEvery: 0, summaryTokens: 200 }

describe('simulateConversation', () => {
  it('re-sends the growing history every turn', () => {
    const r = simulateConversation(base)
    expect(r.turns.map((t) => t.history)).toEqual([0, 400, 800, 1200])
    expect(r.turns.map((t) => t.total)).toEqual([1400, 1800, 2200, 2600])
    expect(r.total).toBe(8000)
    expect(r.baseline).toBe(8000)
    expect(r.savedPercent).toBe(0)
    expect(r.peakHistory).toBe(1200)
  })
  it('restarts with a summary', () => {
    const r = simulateConversation({ ...base, restartEvery: 2 })
    expect(r.turns.map((t) => t.chat)).toEqual([1, 1, 2, 2])
    expect(r.turns.map((t) => t.history)).toEqual([0, 400, 200, 600])
    expect(r.total).toBeLessThan(r.baseline)
    expect(r.savedPercent).toBeGreaterThan(0)
  })
  it('weighs project attachments less', () => {
    const r = simulateConversation({ ...base, attachmentInProject: true })
    expect(r.turns[0]?.attachment).toBe(100)
    expect(r.savedPercent).toBe(45)
  })
  it('handles zero turns and negative input, deterministically', () => {
    expect(simulateConversation({ ...base, turns: 0 }).total).toBe(0)
    expect(simulateConversation({ ...base, turns: 0 }).savedPercent).toBe(0)
    expect(simulateConversation({ ...base, messageTokens: -5, replyTokens: -5, attachmentTokens: -5 }).total).toBe(0)
    expect(simulateConversation(base)).toEqual(simulateConversation(base))
  })
})
