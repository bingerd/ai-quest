import type { CacheBlock, CachingInput } from '../../../simulation/caching'

export const cacheBlocks: CacheBlock[] = [
  { id: 'tools', label: 'Tool definitions', tokens: 2_400, changesEveryCall: false, detail: '9 tools, identical on every call' },
  { id: 'system', label: 'System prompt', tokens: 1_200, changesEveryCall: false, detail: 'Role, rules, output contract' },
  { id: 'policies', label: 'Policy documents', tokens: 14_000, changesEveryCall: false, detail: 'Refunds, billing, escalation' },
  { id: 'examples', label: 'Few-shot examples', tokens: 3_000, changesEveryCall: false, detail: 'Eight worked examples' },
  { id: 'history', label: 'Conversation so far', tokens: 2_500, changesEveryCall: true, detail: 'Grows with every turn' },
  { id: 'question', label: 'The customer message', tokens: 300, changesEveryCall: true, detail: 'Different every call' },
]

export const cacheScenario: CachingInput = {
  blocks: cacheBlocks,
  order: ['question', 'history', 'examples', 'policies', 'system', 'tools'],
  breakpoints: [],
  ttl: '5m',
  calls: 200,
  minutesBetweenCalls: 2,
  minCacheableTokens: 1_024,
}
