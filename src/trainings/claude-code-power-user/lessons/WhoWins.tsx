import { useState } from 'react'
import type { InteractiveLessonProps } from '../../../engine/types'
import { LAYER_INFO, LAYER_ORDER, resolveSettings, type SettingsLayerId, type SettingsLayers } from '../../../simulation/claudeSettings'
import { decide } from '../../../simulation/permissions'
import { MultipleChoice } from '../../../ui/MultipleChoice'
import { SimulationPanel } from '../../../ui/SimulationPanel'

const MODELS = ['', 'haiku', 'sonnet', 'opus', 'opusplan']

/** The fixed situation used for the prediction questions. */
const QUIZ_LAYERS: SettingsLayers = {
  user: { model: 'opus', permissions: { allow: ['Read(.env)'], defaultMode: 'acceptEdits' } },
  project: { model: 'sonnet', permissions: { deny: ['Read(.env)'], defaultMode: 'bypassPermissions' } },
}
const quiz = resolveSettings(QUIZ_LAYERS)
const envDecision = decide({ allow: quiz.rules.allow.map((r) => r.rule), ask: quiz.rules.ask.map((r) => r.rule), deny: quiz.rules.deny.map((r) => r.rule) }, { id: 'env', tool: 'Read', input: '.env' })

const QUESTIONS = [
  {
    id: 'model',
    prompt: 'Your ~/.claude/settings.json says "model": "opus". The committed .claude/settings.json says "model": "sonnet". Which model starts?',
    options: [
      { id: 'opus', label: 'opus' },
      { id: 'sonnet', label: 'sonnet' },
    ],
    correct: quiz.values['model']!.value,
    explain: 'Project settings outrank user settings. Use /model or .claude/settings.local.json if you want something different just for you.',
  },
  {
    id: 'env',
    prompt: 'Your user settings allow Read(.env). The project settings deny Read(.env). Can Claude read .env?',
    options: [
      { id: 'allow', label: 'Yes: allow rules merge, and yours is more specific to you' },
      { id: 'deny', label: 'No: rules from all layers merge and deny is checked first' },
    ],
    correct: envDecision.decision,
    explain: 'Permission arrays merge across layers, and deny is evaluated before ask and allow. An allow rule can never carve an exception out of a deny.',
  },
  {
    id: 'mode',
    prompt: 'The committed project settings set "defaultMode": "bypassPermissions". Your user settings say "acceptEdits". What happens?',
    options: [
      { id: 'bypassPermissions', label: 'Prompts are skipped for everyone on the repo' },
      { id: 'acceptEdits', label: 'The project value is ignored; your acceptEdits applies' },
    ],
    correct: quiz.values['permissions.defaultMode']!.value,
    explain: 'Claude Code ignores bypassPermissions and auto in project and local settings, so a repository cannot switch off your permission prompts.',
  },
  {
    id: 'local',
    prompt: 'You want to try haiku in this repo without changing anything for your teammates or your other projects. Where do you set it?',
    options: [
      { id: 'project', label: '.claude/settings.json' },
      { id: 'local', label: '.claude/settings.local.json' },
      { id: 'user', label: '~/.claude/settings.json' },
    ],
    correct: 'local',
    explain: 'Local project settings are yours alone, apply only to this repo, are gitignored, and outrank the committed project settings.',
  },
]

export function WhoWins({ onComplete, completed }: InteractiveLessonProps) {
  const [models, setModels] = useState<Partial<Record<SettingsLayerId, string>>>({ user: 'opus', project: 'sonnet' })
  const [answers, setAnswers] = useState<Record<string, string | null>>({})
  const [checked, setChecked] = useState(false)

  const layers: SettingsLayers = Object.fromEntries(LAYER_ORDER.map((l) => [l, models[l] ? { model: models[l] } : {}]))
  const effective = resolveSettings(layers).values['model']
  const allRight = QUESTIONS.every((q) => answers[q.id] === q.correct)

  return (
    <div className="space-y-6">
      <p className="ink-2">Set a model in any layer and watch which one wins. Then predict what happens in four real situations.</p>

      <SimulationPanel
        title="Settings layers, highest first"
        aside={
          <div className="card p-3 space-y-1" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide ink-3">Effective model</p>
            <p className="text-2xl font-bold font-mono">{effective?.value ?? 'default'}</p>
            <p className="text-xs ink-3">{effective ? `from ${LAYER_INFO[effective.source].file}` : 'No layer sets a model'}</p>
            {effective && effective.shadowed.length > 0 && <p className="text-xs ink-3">Overridden: {effective.shadowed.map((s) => `${s.value} (${LAYER_INFO[s.layer].label})`).join(', ')}</p>}
          </div>
        }
      >
        <ol className="space-y-2">
          {LAYER_ORDER.map((layer) => (
            <li key={layer} className={`flex flex-wrap items-center gap-3 rounded-xl border p-2.5 ${effective?.source === layer ? 'border-brand-500 bg-brand-500/10' : 'line'}`}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{LAYER_INFO[layer].label}</p>
                <p className="font-mono text-xs ink-3 break-all">{LAYER_INFO[layer].file}</p>
                <p className="text-xs ink-3">{LAYER_INFO[layer].shared}</p>
              </div>
              <label className="text-sm">
                <span className="sr-only">Model in {LAYER_INFO[layer].label}</span>
                <select className="rounded-lg border line-strong surface-1 px-2 py-1.5 font-mono ink-1" value={models[layer] ?? ''} onChange={(e) => setModels((m) => ({ ...m, [layer]: e.target.value }))}>
                  {MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m || '(not set)'}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ol>
      </SimulationPanel>

      <div className="space-y-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="card p-4 space-y-2">
            <MultipleChoice
              prompt={q.prompt}
              options={q.options}
              value={answers[q.id] ?? null}
              onChange={(id) => {
                setAnswers((a) => ({ ...a, [q.id]: id }))
                setChecked(false)
              }}
              {...(checked && answers[q.id] === q.correct ? { revealCorrectId: q.correct } : {})}
            />
            {checked && answers[q.id] !== undefined && <p className={`text-sm ${answers[q.id] === q.correct ? 'text-good' : 'text-bad'}`}>{answers[q.id] === q.correct ? q.explain : 'Not quite. Look at the layer order and try again.'}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {!allRight && (
          <button type="button" className="btn btn-secondary" onClick={() => setChecked(true)} disabled={QUESTIONS.some((q) => !answers[q.id])}>
            Check predictions
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={onComplete} disabled={!(allRight && checked) && !completed}>
          {completed ? 'Next' : allRight && checked ? 'Continue' : 'Get all four right to continue'}
        </button>
      </div>
    </div>
  )
}
