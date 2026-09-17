import type { BriefChoices, BriefSpec } from '../../../simulation/brief'

/** One radio group per brief block. Shared by Brief Builder and the final challenge. */
export function BriefBlocks({ spec, choices, onChange, disabled }: { spec: BriefSpec; choices: BriefChoices; onChange: (next: BriefChoices) => void; disabled?: boolean }) {
  return (
    <div className="space-y-3">
      {spec.blocks.map((block) => (
        <fieldset key={block.id} disabled={disabled} className="space-y-1.5">
          <legend className="text-sm font-semibold">{block.label}</legend>
          <div className="grid gap-1.5">
            {block.options.map((o) => {
              const selected = (choices[block.id] ?? block.options.find((x) => x.quality === 'missing')?.id) === o.id
              return (
                <label key={o.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${selected ? 'border-brand-500 bg-brand-500/10' : 'line hover:surface-2'}`}>
                  <input type="radio" name={`brief-${block.id}`} checked={selected} onChange={() => onChange({ ...choices, [block.id]: o.id })} className="mt-0.5 size-4 accent-brand-600" />
                  <span className={o.text ? 'ink-1' : 'italic ink-3'}>{o.text || 'Leave it out'}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
