import type { CompositeAnswer, CompositeSpec } from '../simulation/composite'

/** Numbered sections of single choices and include/exclude checklists. */
export function CompositeForm({ spec, answer, onChange, locked }: { spec: CompositeSpec; answer: CompositeAnswer; onChange: (a: CompositeAnswer) => void; locked: boolean }) {
  return (
    <div className="space-y-6">
      {spec.parts.map((part, i) => (
        <section key={part.id} className="space-y-3" aria-labelledby={`part-${part.id}`}>
          <h3 id={`part-${part.id}`} className="flex items-start gap-2 font-semibold">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs text-white">{i + 1}</span>
            <span>
              {part.label}
              <span className="block text-sm font-normal ink-2">{part.question}</span>
            </span>
          </h3>
          {part.kind === 'choice' ? (
            <fieldset disabled={locked} className="grid gap-2 sm:grid-cols-2">
              <legend className="sr-only">{part.label}</legend>
              {part.options.map((o) => {
                const selected = answer.choices[part.id] === o.id
                return (
                  <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selected ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
                    <input type="radio" name={`composite-${part.id}`} checked={selected} onChange={() => onChange({ ...answer, choices: { ...answer.choices, [part.id]: o.id } })} className="mt-1 size-4 accent-brand-600" />
                    <span className="min-w-0">
                      <span className="block font-semibold break-words">{o.label}</span>
                      {o.detail && <span className="block text-xs ink-3 break-words">{o.detail}</span>}
                    </span>
                  </label>
                )
              })}
            </fieldset>
          ) : (
            <fieldset disabled={locked} className="grid gap-2">
              <legend className="sr-only">{part.label}</legend>
              {part.items.map((item) => {
                const list = answer.checks[part.id] ?? []
                const checked = list.includes(item.id)
                return (
                  <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${checked ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onChange({ ...answer, checks: { ...answer.checks, [part.id]: checked ? list.filter((x) => x !== item.id) : [...list, item.id] } })}
                      className="mt-1 size-4 accent-brand-600"
                    />
                    <span className="min-w-0">
                      <span className="block font-mono text-sm break-words">{item.label}</span>
                      {item.detail && <span className="block text-xs ink-3">{item.detail}</span>}
                    </span>
                  </label>
                )
              })}
            </fieldset>
          )}
        </section>
      ))}
    </div>
  )
}
