import { useId } from 'react'

export interface MultipleChoiceOption {
  id: string
  label: string
}

export interface MultipleChoiceProps {
  prompt: string
  options: MultipleChoiceOption[]
  value: string | null
  onChange: (id: string) => void
  /** When set, options are revealed as correct/incorrect and disabled. */
  revealCorrectId?: string
}

export function MultipleChoice({ prompt, options, value, onChange, revealCorrectId }: MultipleChoiceProps) {
  const groupId = useId()
  const revealed = revealCorrectId !== undefined
  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold">{prompt}</legend>
      <div className="grid gap-2">
        {options.map((o) => {
          const selected = value === o.id
          const correct = revealed && o.id === revealCorrectId
          const wrong = revealed && selected && !correct
          const style = correct
            ? 'border-good bg-good/10'
            : wrong
              ? 'border-bad bg-bad/10'
              : selected
                ? 'border-brand-500 bg-brand-500/10'
                : 'line hover:line-strong hover:surface-2'
          return (
            <label key={o.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${style}`}>
              <input
                type="radio"
                name={groupId}
                value={o.id}
                checked={selected}
                disabled={revealed}
                onChange={() => onChange(o.id)}
                className="size-4 accent-brand-600"
              />
              <span className="flex-1">{o.label}</span>
              {correct && <span className="chip bg-good text-white">Correct</span>}
              {wrong && <span className="chip bg-bad text-white">Not quite</span>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
