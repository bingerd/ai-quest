export interface ProgressBarProps {
  /** 0..100 */
  value: number
  label: string
  showValue?: boolean
  size?: 'sm' | 'md'
}

export function ProgressBar({ value, label, showValue = false, size = 'md' }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={`flex-1 overflow-hidden rounded-full surface-3 ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}
      >
        <div className="h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${v}%` }} />
      </div>
      {showValue && <span className="text-sm font-semibold tabular-nums ink-2">{v}%</span>}
    </div>
  )
}
