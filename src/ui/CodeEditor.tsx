import { lazy, Suspense } from 'react'
import { ErrorBoundary } from '../app/ErrorBoundary'
import { useMediaFlags } from '../app/useMediaFlags'

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: number
  ariaLabel: string
  readOnly?: boolean
}

const LazyMonaco = lazy(async () => {
  await import('./monaco')
  const mod = await import('@monaco-editor/react')
  return { default: mod.default }
})

function PlainEditor({ value, onChange, height = 360, ariaLabel, readOnly }: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      aria-label={ariaLabel}
      spellCheck={false}
      className="w-full rounded-xl border line-strong surface-1 p-3 font-mono text-sm ink-1"
      style={{ height }}
    />
  )
}

/**
 * Monaco-backed editor, bundled locally, with a plain textarea fallback while
 * loading or if Monaco cannot initialise.
 */
export function CodeEditor(props: CodeEditorProps) {
  const { dark } = useMediaFlags()
  const { value, onChange, language = 'plaintext', height = 360, ariaLabel, readOnly } = props
  return (
    <div className="overflow-hidden rounded-xl border line-strong" aria-label={ariaLabel}>
      <ErrorBoundary fallback={<PlainEditor {...props} />}>
        <Suspense fallback={<PlainEditor {...props} />}>
          <LazyMonaco
            height={height}
            language={language}
            value={value}
            theme={dark ? 'vs-dark' : 'vs'}
            onChange={(v) => onChange(v ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              readOnly: readOnly ?? false,
              ariaLabel,
              renderLineHighlight: 'line',
              padding: { top: 12, bottom: 12 },
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
