import type { ConversationTurn } from '../simulation/conversation'
import { formatTokens } from '../simulation/tokens'

/** One bar per turn, split into attachment / re-sent history / new message + reply. */
export function ConversationMeter({ turns, title = 'Tokens processed per message' }: { turns: ConversationTurn[]; title?: string }) {
  const max = Math.max(1, ...turns.map((t) => t.total))
  return (
    <figure className="space-y-2" aria-label={title}>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-xs ink-3">
        <span className="font-semibold uppercase tracking-wide">{title}</span>
        <span className="flex flex-wrap gap-3">
          <Legend cls="bg-seg-documents" label="File" />
          <Legend cls="bg-seg-conversation" label="Re-sent conversation" />
          <Legend cls="bg-seg-system" label="New message + reply" />
        </span>
      </figcaption>
      <ol className="flex h-40 items-end gap-0.5 rounded-xl surface-2 p-2" role="img" aria-label={`${turns.length} messages. The last one processed ${formatTokens(turns.at(-1)?.total ?? 0)} simulated tokens.`}>
        {turns.map((t, i) => {
          const restart = i > 0 && t.chat !== turns[i - 1]?.chat
          return (
            <li key={t.turn} className={`flex h-full min-w-0 flex-1 flex-col justify-end ${restart ? 'border-l-2 border-dashed border-good pl-0.5' : ''}`} title={`Message ${t.turn}: ${formatTokens(t.total)} tokens`}>
              <span className="block bg-seg-system transition-[height] duration-300" style={{ height: `${((t.message + t.reply) / max) * 100}%` }} />
              <span className="block bg-seg-conversation transition-[height] duration-300" style={{ height: `${(t.history / max) * 100}%` }} />
              <span className="block rounded-b-sm bg-seg-documents transition-[height] duration-300" style={{ height: `${(t.attachment / max) * 100}%` }} />
            </li>
          )
        })}
      </ol>
    </figure>
  )
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`size-2.5 rounded-sm ${cls}`} aria-hidden />
      {label}
    </span>
  )
}
