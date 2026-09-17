import type { ModelProfile } from '../simulation/models'
import { formatTokens } from '../simulation/tokens'

export interface ModelCardProps {
  model: ModelProfile
  selected: boolean
  onSelect: (id: string) => void
  disabled?: boolean
  /** Optional verdict shown after simulation. */
  verdict?: { label: string; tone: 'good' | 'warn' | 'bad' }
}

function dots(n: number, of = 5) {
  return '●'.repeat(n) + '○'.repeat(of - n)
}

/** Fictional model profile card. Uses a radio so a group is keyboard-navigable. */
export function ModelCard({ model, selected, onSelect, disabled, verdict }: ModelCardProps) {
  const capability = Math.round(model.capability * 5)
  const cost = model.inputCostPerMillion < 1 ? 1 : model.inputCostPerMillion < 3 ? 3 : 5
  const speed = model.latencyPerThousandInput < 0.07 ? 5 : model.latencyPerThousandInput < 0.15 ? 3 : 1
  const toneCls = verdict?.tone === 'good' ? 'bg-good/15 text-good' : verdict?.tone === 'warn' ? 'bg-warn/15 text-warn' : 'bg-bad/15 text-bad'
  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-colors ${
        selected ? 'border-brand-500 bg-brand-500/10' : 'line hover:line-strong hover:surface-2'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2">
          <input type="radio" name="model" value={model.id} checked={selected} disabled={disabled} onChange={() => onSelect(model.id)} className="size-4 accent-brand-600" />
          <span className="text-lg font-bold">{model.name}</span>
        </span>
        {verdict && <span className={`chip ${toneCls}`}>{verdict.label}</span>}
      </div>
      <p className="text-sm ink-2">{model.tagline}</p>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="ink-3">Capability</dt>
          <dd className="font-mono tracking-tight" aria-label={`${capability} of 5`}>
            {dots(capability)}
          </dd>
        </div>
        <div>
          <dt className="ink-3">Cost</dt>
          <dd className="font-mono tracking-tight" aria-label={`${cost} of 5`}>
            {dots(cost)}
          </dd>
        </div>
        <div>
          <dt className="ink-3">Speed</dt>
          <dd className="font-mono tracking-tight" aria-label={`${speed} of 5`}>
            {dots(speed)}
          </dd>
        </div>
      </dl>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs ink-2">
        <dt className="ink-3">Context</dt>
        <dd className="tabular-nums">{formatTokens(model.contextLimit)} tokens</dd>
        <dt className="ink-3">Input / output</dt>
        <dd className="tabular-nums">
          €{model.inputCostPerMillion} / €{model.outputCostPerMillion} per M
        </dd>
      </dl>
    </label>
  )
}
