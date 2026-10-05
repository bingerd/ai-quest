import { useState, type ComponentType, type ReactNode } from 'react'
import type { InteractiveLessonProps } from '../../engine/types'

export interface LiveChecklistItem {
  id: string
  label: string
  /** How to do it, shown under the label. */
  detail?: string
}

export interface LiveChecklistConfig {
  intro: ReactNode
  items: LiveChecklistItem[]
  /** Shown once every box is ticked. */
  done?: ReactNode
}

/**
 * A "do this in the real tool, then tick it off" lesson for facilitated sessions.
 * Nothing is checked or scored: the learner says they did it.
 */
export function makeLiveChecklist(config: LiveChecklistConfig): ComponentType<InteractiveLessonProps> {
  function LiveChecklist({ onComplete, completed }: InteractiveLessonProps) {
    const [ticked, setTicked] = useState<string[]>([])
    const all = completed || config.items.every((i) => ticked.includes(i.id))
    return (
      <div className="space-y-6">
        <div className="ink-2">{config.intro}</div>
        <ol className="space-y-2">
          {config.items.map((item, n) => {
            const on = ticked.includes(item.id)
            return (
              <li key={item.id}>
                <label className={`card flex cursor-pointer items-start gap-3 p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${on ? 'border-good/50 bg-good/5' : ''}`}>
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 accent-brand-600"
                    checked={on || completed}
                    disabled={completed}
                    onChange={() => setTicked(on ? ticked.filter((t) => t !== item.id) : [...ticked, item.id])}
                  />
                  <span className="min-w-0">
                    <span className="font-semibold">
                      {n + 1}. {item.label}
                    </span>
                    {item.detail && <span className="block text-sm ink-3">{item.detail}</span>}
                  </span>
                </label>
              </li>
            )
          })}
        </ol>
        {all && config.done && <div className="rounded-xl border border-good/40 bg-good/10 p-3 text-sm">{config.done}</div>}
        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!all}>
            {completed ? 'Next' : all ? 'Continue' : 'Tick every step to continue'}
          </button>
        </div>
      </div>
    )
  }
  return LiveChecklist
}
