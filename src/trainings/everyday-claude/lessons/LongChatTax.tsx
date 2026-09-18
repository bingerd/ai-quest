import { useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { simulateConversation } from '../../../simulation/conversation'
import { formatTokens } from '../../../simulation/tokens'
import { ConceptCard } from '../../../ui/ConceptCard'
import { ConversationMeter } from '../../../ui/ConversationMeter'
import { SimulationPanel } from '../../../ui/SimulationPanel'

const RESTART = [0, 10, 20] as const

export function LongChatTax({ onComplete, completed }: InteractiveLessonProps) {
  const [turns, setTurns] = useState(30)
  const [inProject, setInProject] = useState(false)
  const [restartEvery, setRestartEvery] = useState<number>(0)
  const r = simulateConversation({ turns, messageTokens: 120, replyTokens: 600, attachmentTokens: 15_000, attachmentInProject: inProject, restartEvery, summaryTokens: 800 })
  const improved = r.savedPercent >= 50

  return (
    <div className="space-y-6">
      <p className="ink-2">
        You are working on a client deck with an 80-page delivery review attached. Every time you send a message, Claude processes the <strong className="ink-1">file and the whole conversation again</strong>. Watch the bars grow, then try the two habits that shrink them.
      </p>

      <SimulationPanel
        title="The long-chat tax"
        aside={
          <div className="space-y-3">
            <div className="card px-3 py-2">
              <p className="text-xs ink-3">Simulated tokens processed</p>
              <p className="text-2xl font-bold tabular-nums">{formatTokens(r.total)}</p>
              <p className="text-xs ink-3">one long chat, file re-sent: {formatTokens(r.baseline)}</p>
            </div>
            <p className={`rounded-xl border p-3 text-sm ${improved ? 'border-good/40 bg-good/10' : 'line surface-2'}`} role="status">
              {r.savedPercent > 0 ? `${r.savedPercent}% less work for the same conversation.` : 'This is the expensive way. Try the options below.'}
            </p>
          </div>
        }
      >
        <div className="space-y-4">
          <ConversationMeter turns={r.turns} />
          <label className="block text-sm">
            <span className="flex justify-between font-semibold">
              Messages in the conversation <span className="tabular-nums ink-2">{turns}</span>
            </span>
            <input type="range" min={5} max={60} step={1} value={turns} onChange={(e) => setTurns(Number(e.target.value))} className="w-full accent-brand-600" aria-valuetext={`${turns} messages`} />
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={inProject} onChange={(e) => setInProject(e.target.checked)} className="mt-1 size-4 accent-brand-600" />
            <span>
              <span className="font-semibold">Keep the report in a project</span>
              <span className="block text-xs ink-3">Project content is cached and reused instead of being processed from scratch each time.</span>
            </span>
          </label>
          <fieldset className="space-y-1 text-sm">
            <legend className="font-semibold">Start a fresh chat with a short summary</legend>
            <div className="flex flex-wrap gap-2">
              {RESTART.map((n) => (
                <label key={n} className={`cursor-pointer rounded-lg border px-3 py-1.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${restartEvery === n ? 'border-brand-500 bg-brand-500/15 font-semibold' : 'line'}`}>
                  <input type="radio" className="sr-only" name="restart" checked={restartEvery === n} onChange={() => setRestartEvery(n)} />
                  {n === 0 ? 'Never' : `Every ${n} messages`}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </SimulationPanel>

      <ConceptCard title="Long chats cost more with every message" icon="🧾">
        <p>Usage limits count what Claude has to process. A long chat with a big file makes every new message heavier. Keep reference files in a project and start fresh chats when the topic moves on.</p>
      </ConceptCard>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!improved && !completed}>
          {completed ? 'Next' : improved ? 'Continue' : 'Cut the work in half to continue'}
        </button>
      </div>
    </div>
  )
}
