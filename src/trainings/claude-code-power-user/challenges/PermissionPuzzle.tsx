import { useMemo, useState } from 'react'
import type { ChallengeProps } from '../../../engine/types'
import { decide, parseSettingsJson, type Decision } from '../../../simulation/permissions'
import { ChallengeFrame } from '../../../ui/Challenge'
import { CodeEditor } from '../../../ui/CodeEditor'
import { permissionCalls, permissionStarter } from '../data/permissions'

export interface PermissionAnswer {
  text: string
}

const CHIP: Record<Decision, string> = {
  allow: 'bg-good/15 text-good',
  ask: 'bg-warn/15 text-warn',
  deny: 'bg-bad/15 text-bad',
}

export function PermissionPuzzle({ submit, result, attempts, bestScore, retry, onContinue }: ChallengeProps<PermissionAnswer>) {
  const [text, setText] = useState(permissionStarter)
  const parsed = useMemo(() => parseSettingsJson(text), [text])
  const rows = permissionCalls.map((call) => ({ call, got: decide(parsed.rules, call) }))
  const correct = rows.filter((r) => r.got.decision === r.call.expected).length

  return (
    <ChallengeFrame
      title="Permission Puzzle"
      brief={
        <>
          <p>Write the <code>permissions</code> block for this repo&apos;s <code>.claude/settings.json</code> so each of the attempted actions below gets the intended treatment. The table updates as you type.</p>
          <p className="text-xs ink-3">Rules: deny is checked first, then ask, then allow. Unmatched reads are allowed; unmatched commands, edits and fetches ask. Examples: <code>Bash(npm test *)</code>, <code>Read(.env)</code>, <code>Edit(src/**)</code>, <code>WebFetch(domain:example.com)</code>.</p>
        </>
      }
      result={result}
      attempts={attempts}
      bestScore={bestScore}
      canSubmit={!parsed.error}
      onSubmit={() => submit({ text })}
      onRetry={retry}
      onContinue={onContinue}
      submitLabel={parsed.error ? 'Fix the JSON first' : 'Apply these rules'}
      minAttemptsToContinue={3}
      continueLockHint="Pass, or make three attempts, before you can skip."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <CodeEditor value={text} onChange={setText} language="json" ariaLabel=".claude/settings.json editor" height={380} readOnly={!!result} />
          {parsed.error ? (
            <p className="text-sm font-semibold text-bad" role="alert">
              JSON error: {parsed.error}
            </p>
          ) : parsed.invalid.length > 0 ? (
            <p className="text-sm text-warn" role="status">
              Ignored invalid rules: {parsed.invalid.join(', ')}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold" aria-live="polite">
            {correct} of {rows.length} as intended
          </p>
          <div className="overflow-x-auto rounded-xl border line">
            <table className="w-full text-sm">
              <caption className="sr-only">Attempted actions and how your rules treat them</caption>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide ink-3">
                  <th className="px-2 py-1.5">Action</th>
                  <th className="px-2 py-1.5">Want</th>
                  <th className="px-2 py-1.5">Get</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ call, got }) => {
                  const ok = got.decision === call.expected
                  return (
                    <tr key={call.id} className={`border-t line ${ok ? '' : 'bg-bad/5'}`}>
                      <td className="px-2 py-1.5">
                        <span className="block font-mono text-xs break-all">{call.label}</span>
                        <span className="block text-[11px] ink-3">{got.rule ? `matched ${got.rule}` : 'default'}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`chip whitespace-nowrap ${CHIP[call.expected]}`}>{call.expected}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`chip whitespace-nowrap ${CHIP[got.decision]}`}>
                          {ok ? '✓' : '✗'} {got.decision}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ChallengeFrame>
  )
}
