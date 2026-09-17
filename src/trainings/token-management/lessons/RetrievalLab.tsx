import { useMemo, useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { simulateRetrieval } from '../../../simulation/retrieval'
import { formatSeconds, formatTokens } from '../../../simulation/tokens'
import { ConceptCard } from '../../../ui/ConceptCard'
import { SimulationPanel } from '../../../ui/SimulationPanel'
import { ToolChain } from '../../../ui/ToolChain'
import { retrievalCorpus, retrievalGoal, retrievalQuestion } from '../data/retrievalCorpus'

export function RetrievalLab({ onComplete, completed }: InteractiveLessonProps) {
  const [chunkSize, setChunkSize] = useState(2_000)
  const [topK, setTopK] = useState(6)
  const [threshold, setThreshold] = useState(0)
  const [rerank, setRerank] = useState(false)

  const r = useMemo(() => simulateRetrieval({ docs: retrievalCorpus, chunkSize, topK, threshold, rerank }), [chunkSize, topK, threshold, rerank])
  const solved = r.coverage >= retrievalGoal.coverage && r.tokens <= retrievalGoal.maxTokens
  const totalTokens = retrievalCorpus.reduce((s, d) => s + d.tokens, 0)

  return (
    <div className="space-y-6">
      <p className="ink-2">
        Instead of pasting {formatTokens(totalTokens)} tokens of documents, a retrieval step finds the passages that matter and sends only those. Tune the
        pipeline for the question <strong className="ink-1">"{retrievalQuestion}"</strong>.
      </p>
      <p className="rounded-xl border border-brand-400/40 bg-brand-500/10 p-3 text-sm">
        <strong>Goal:</strong> {retrievalGoal.coverage}% coverage of the relevant passages using at most {formatTokens(retrievalGoal.maxTokens)} tokens.
      </p>

      <SimulationPanel
        title="Retrieval pipeline"
        aside={
          <div className="space-y-3">
            <div className={`rounded-xl border p-3 ${solved ? 'border-good bg-good/10' : 'line surface-2'}`} role="status">
              <p className="text-xs ink-3">Coverage</p>
              <p className="text-2xl font-bold tabular-nums">{r.coverage}%</p>
              <p className="text-xs ink-3">Tokens sent</p>
              <p className={`text-2xl font-bold tabular-nums ${r.tokens > retrievalGoal.maxTokens ? 'text-bad' : ''}`}>{formatTokens(r.tokens)}</p>
              <p className="text-xs ink-3">
                Precision {r.precision}% · +{formatSeconds(r.latency)}
              </p>
            </div>
            {r.missed.length > 0 && (
              <div className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
                <p className="font-semibold">Missed information</p>
                <ul className="list-disc pl-5 text-xs ink-2">
                  {r.missed.map((m) => (
                    <li key={m.docId}>{m.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <ToolChain
            title="Retrieval pipeline"
            steps={[
              { id: 'docs', label: 'Documents', value: `${retrievalCorpus.length}` },
              { id: 'chunk', label: 'Chunking', value: `${r.totalChunks} chunks` },
              { id: 'retrieve', label: 'Retrieval', value: `top ${topK}` },
              { id: 'rank', label: 'Ranking', value: rerank ? 'reranked' : 'plain', active: rerank },
              { id: 'context', label: 'Context', value: formatTokens(r.tokens) },
              { id: 'answer', label: 'Answer', value: `${r.coverage}%` },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="flex justify-between font-semibold">
                Chunk size <span className="tabular-nums ink-2">{formatTokens(chunkSize)} tokens</span>
              </span>
              <input type="range" min={200} max={4000} step={100} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))} className="w-full accent-brand-600" aria-valuetext={`${chunkSize} tokens`} />
              <span className="block text-xs ink-3">Smaller chunks are more precise but easier to miss.</span>
            </label>
            <label className="block text-sm">
              <span className="flex justify-between font-semibold">
                Top-k <span className="tabular-nums ink-2">{topK}</span>
              </span>
              <input type="range" min={1} max={20} step={1} value={topK} onChange={(e) => setTopK(Number(e.target.value))} className="w-full accent-brand-600" aria-valuetext={`${topK} chunks`} />
              <span className="block text-xs ink-3">How many chunks are sent to the model.</span>
            </label>
            <label className="block text-sm">
              <span className="flex justify-between font-semibold">
                Relevance threshold <span className="tabular-nums ink-2">{threshold.toFixed(2)}</span>
              </span>
              <input type="range" min={0} max={0.9} step={0.05} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-brand-600" aria-valuetext={`${threshold}`} />
              <span className="block text-xs ink-3">Drop chunks scoring below this.</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={rerank} onChange={(e) => setRerank(e.target.checked)} className="mt-1 size-4 accent-brand-600" />
              <span>
                <span className="font-semibold">Rerank results</span>
                <span className="block text-xs ink-3">A second, slower pass that orders chunks by true relevance.</span>
              </span>
            </label>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide ink-3">Retrieved chunks</p>
            {r.chunks.length === 0 ? (
              <p className="text-sm ink-3">Nothing retrieved. The model would answer from nothing.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {r.chunks.map((c) => (
                  <li key={`${c.docId}-${c.index}`} className={`chip ${c.isKey ? 'bg-good/15 text-good' : 'surface-2 ink-2'}`} title={`score ${c.score}`}>
                    {c.title} #{c.index + 1} · {formatTokens(c.tokens)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SimulationPanel>

      <ConceptCard title="Tools add context too" icon="🔧">
        <p>Retrieval, search, database queries: every tool call returns text that lands in the context window. Tune tools to return what the task needs, not everything they can find.</p>
      </ConceptCard>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!solved && !completed}>
          {completed ? 'Next' : solved ? 'Continue' : 'Hit the goal to continue'}
        </button>
      </div>
    </div>
  )
}
