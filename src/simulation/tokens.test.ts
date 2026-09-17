import { describe, expect, it } from 'vitest'
import { estimateTokens, formatSeconds, formatTokens, tokenizeForDisplay } from './tokens'

describe('estimateTokens', () => {
  it('returns 0 for empty text', () => {
    expect(estimateTokens('')).toBe(0)
  })
  it('rounds up chars / 4', () => {
    expect(estimateTokens('abcd')).toBe(1)
    expect(estimateTokens('abcde')).toBe(2)
    expect(estimateTokens('a'.repeat(400))).toBe(100)
  })
  it('is deterministic', () => {
    const t = 'The quick brown fox jumps over the lazy dog.'
    expect(estimateTokens(t)).toBe(estimateTokens(t))
  })
})

describe('tokenizeForDisplay', () => {
  it('splits words into ~4 char chips and keeps punctuation', () => {
    expect(tokenizeForDisplay('Hello, world!')).toEqual(['Hell', 'o', ',', ' ', 'worl', 'd', '!'])
  })
  it('returns no chips for empty input', () => {
    expect(tokenizeForDisplay('')).toEqual([])
  })
})

describe('formatting', () => {
  it('formats tokens with separators', () => {
    expect(formatTokens(12400)).toBe('12,400')
  })
  it('formats seconds sensibly', () => {
    expect(formatSeconds(0.25)).toBe('250 ms')
    expect(formatSeconds(12.34)).toBe('12.3 s')
    expect(formatSeconds(125)).toBe('2 min 5 s')
  })
})
