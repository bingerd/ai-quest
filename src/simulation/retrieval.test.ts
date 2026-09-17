import { describe, expect, it } from 'vitest'
import { simulateRetrieval, type RetrievalDoc } from './retrieval'

const docs: RetrievalDoc[] = [
  { id: 'policy', title: 'Refund policy', tokens: 3000, relevance: 1, keyPosition: 0.7 },
  { id: 'contract', title: 'Contract', tokens: 4000, relevance: 0.9, keyPosition: 0.2 },
  { id: 'faq', title: 'FAQ', tokens: 2000, relevance: 0.6, keyPosition: 0.5 },
  { id: 'roadmap', title: 'Roadmap', tokens: 5000, relevance: 0.1, keyPosition: 0.5 },
  { id: 'hr', title: 'HR handbook', tokens: 8000, relevance: 0.05, keyPosition: 0.5 },
]

describe('simulateRetrieval', () => {
  it('retrieves nothing with top-k 0', () => {
    const r = simulateRetrieval({ docs, chunkSize: 500, topK: 0, threshold: 0, rerank: false })
    expect(r.chunks).toHaveLength(0)
    expect(r.tokens).toBe(0)
    expect(r.coverage).toBe(0)
    expect(r.missed).toHaveLength(3)
  })

  it('noisy first-stage retrieval lets filler outrank a moderately relevant key passage', () => {
    const r = simulateRetrieval({ docs, chunkSize: 500, topK: 3, threshold: 0, rerank: false })
    expect(r.coverage).toBeLessThan(100)
    expect(r.missed.map((m) => m.docId)).toEqual(['faq'])
    expect(r.precision).toBeLessThan(100)
  })

  it('reaches full coverage with a generous top-k, at a token cost', () => {
    const r = simulateRetrieval({ docs, chunkSize: 500, topK: 12, threshold: 0, rerank: false })
    expect(r.coverage).toBe(100)
    expect(r.tokens).toBe(6000)
    expect(r.missed).toHaveLength(0)
  })

  it('reranking puts key passages first: full coverage with top-k 3', () => {
    const r = simulateRetrieval({ docs, chunkSize: 500, topK: 3, threshold: 0, rerank: true })
    expect(r.coverage).toBe(100)
    expect(r.precision).toBe(100)
    expect(r.tokens).toBe(1500)
  })

  it('costs far more tokens with huge chunks', () => {
    const small = simulateRetrieval({ docs, chunkSize: 500, topK: 3, threshold: 0, rerank: true })
    const big = simulateRetrieval({ docs, chunkSize: 4000, topK: 3, threshold: 0, rerank: true })
    expect(big.tokens).toBeGreaterThan(small.tokens * 3)
  })

  it('a high threshold drops the moderately relevant document', () => {
    const r = simulateRetrieval({ docs, chunkSize: 500, topK: 10, threshold: 0.75, rerank: true })
    expect(r.missed.map((m) => m.docId)).toEqual(['faq'])
  })

  it('reranking raises precision for the same top-k', () => {
    const plain = simulateRetrieval({ docs, chunkSize: 500, topK: 3, threshold: 0, rerank: false })
    const reranked = simulateRetrieval({ docs, chunkSize: 500, topK: 3, threshold: 0, rerank: true })
    expect(reranked.precision).toBeGreaterThan(plain.precision)
    expect(reranked.latency).toBeGreaterThan(plain.latency)
  })

  it('is deterministic', () => {
    const a = simulateRetrieval({ docs, chunkSize: 700, topK: 4, threshold: 0.3, rerank: true })
    const b = simulateRetrieval({ docs, chunkSize: 700, topK: 4, threshold: 0.3, rerank: true })
    expect(a).toEqual(b)
  })
})
