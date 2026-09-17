import { clamp, round } from './scoring'

/**
 * Deterministic retrieval (RAG) simulation:
 * documents → chunking → scoring → threshold → top-k → (optional rerank) → context.
 */

export interface RetrievalDoc {
  id: string
  title: string
  tokens: number
  /** 0..1 relevance of the document to the question. */
  relevance: number
  /** Where in the document the key passage sits, 0..1. */
  keyPosition: number
}

export interface RetrievalInput {
  docs: RetrievalDoc[]
  chunkSize: number
  topK: number
  /** 0..1 minimum score to be retrieved. */
  threshold: number
  rerank: boolean
}

export interface RetrievedChunk {
  docId: string
  title: string
  index: number
  tokens: number
  score: number
  isKey: boolean
}

export interface RetrievalResult {
  chunks: RetrievedChunk[]
  totalChunks: number
  tokens: number
  /** 0..100 share of key passages (from relevant docs) that were retrieved. */
  coverage: number
  /** 0..100 share of retrieved chunks that are key passages of relevant documents. */
  precision: number
  missed: { docId: string; title: string }[]
  /** Extra simulated seconds for retrieval + reranking. */
  latency: number
}

export const RELEVANT_DOC_THRESHOLD = 0.5

function chunkDoc(doc: RetrievalDoc, chunkSize: number): RetrievedChunk[] {
  const count = Math.max(1, Math.ceil(doc.tokens / chunkSize))
  const keyIndex = Math.min(count - 1, Math.floor(doc.keyPosition * count))
  const chunks: RetrievedChunk[] = []
  for (let i = 0; i < count; i++) {
    const tokens = i === count - 1 ? doc.tokens - chunkSize * (count - 1) : chunkSize
    const isKey = i === keyIndex
    // First-stage (embedding) scores are noisy: filler chunks of a relevant doc can
    // outrank the key passage of a moderately relevant one. Deterministic wobble.
    const wobble = (((i * 7) % 5) / 100) * 3
    const base = isKey ? doc.relevance : doc.relevance * 0.5 + wobble
    chunks.push({ docId: doc.id, title: doc.title, index: i, tokens: Math.max(1, tokens), score: round(clamp(base, 0, 1), 3), isKey })
  }
  return chunks
}

export function simulateRetrieval(input: RetrievalInput): RetrievalResult {
  const chunkSize = Math.max(50, Math.round(input.chunkSize))
  const topK = Math.max(0, Math.round(input.topK))
  const all = input.docs.flatMap((d) => chunkDoc(d, chunkSize))

  let scored = all.map((c) => ({ ...c }))
  if (input.rerank) {
    // A reranker sharpens the separation between key passages and filler.
    scored = scored.map((c) => ({ ...c, score: round(clamp(c.isKey ? c.score * 1.15 : c.score * 0.5, 0, 1), 3) }))
  }
  scored.sort((a, b) => b.score - a.score || a.docId.localeCompare(b.docId) || a.index - b.index)
  const retrieved = scored.filter((c) => c.score >= input.threshold).slice(0, topK)

  const relevantDocs = input.docs.filter((d) => d.relevance >= RELEVANT_DOC_THRESHOLD)
  const keyChunks = all.filter((c) => c.isKey && relevantDocs.some((d) => d.id === c.docId))
  const keyRetrieved = retrieved.filter((c) => c.isKey && relevantDocs.some((d) => d.id === c.docId))
  const totalRel = relevantDocs.reduce((s, d) => s + d.relevance, 0)
  const capturedRel = keyRetrieved.reduce((s, c) => s + (input.docs.find((d) => d.id === c.docId)?.relevance ?? 0), 0)
  const coverage = keyChunks.length === 0 ? 100 : (capturedRel / totalRel) * 100
  const precision = retrieved.length === 0 ? 0 : (keyRetrieved.length / retrieved.length) * 100
  const missed = relevantDocs.filter((d) => !keyRetrieved.some((c) => c.docId === d.id)).map((d) => ({ docId: d.id, title: d.title }))

  return {
    chunks: retrieved,
    totalChunks: all.length,
    tokens: retrieved.reduce((s, c) => s + c.tokens, 0),
    coverage: round(clamp(coverage)),
    precision: round(clamp(precision)),
    missed,
    latency: round(0.15 + all.length * 0.002 + (input.rerank ? 0.4 : 0), 2),
  }
}
