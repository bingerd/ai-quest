import type { HookBehaviour, HookGoal, Occurrence } from '../../../simulation/hooks'

const tool = (id: string, event: 'PreToolUse' | 'PostToolUse', name: string, target: string, label: string): Occurrence => ({ id, event, subject: name, target, label })

const fmt: HookBehaviour = { id: 'format', label: 'Run the formatter on the edited file, exit 0', exitCode: () => 0 }
const fmtStrict: HookBehaviour = { id: 'format-strict', label: 'Run the formatter, exit 2 if it changed anything', exitCode: () => 2 }
const blockEnv: HookBehaviour = { id: 'block-env', label: 'Exit 2 with a message if the file is a .env file, otherwise exit 0', exitCode: (o) => (o.target?.endsWith('.env') ? 2 : 0) }
const warnEnv: HookBehaviour = { id: 'warn-env', label: 'Exit 1 with a warning if the file is a .env file', exitCode: (o) => (o.target?.endsWith('.env') ? 1 : 0) }
const printCtx: HookBehaviour = { id: 'print-context', label: 'Print the current branch and open tickets, exit 0', exitCode: () => 0, printsContext: true }
const printExit2: HookBehaviour = { id: 'print-exit2', label: 'Print the branch and open tickets, exit 2', exitCode: () => 2, printsContext: true }
const notify: HookBehaviour = { id: 'notify', label: 'Send a desktop notification, exit 0', exitCode: () => 0 }

export const hookGoals: HookGoal[] = [
  {
    id: 'format',
    title: 'Format every edited file',
    description: 'After Claude edits or creates a file, run the formatter on it. Nothing else should trigger it.',
    matcherOptions: ['Edit|Write', 'Edit', 'Bash', '*'],
    behaviours: [fmt, fmtStrict],
    stream: [
      { ...tool('pre-edit', 'PreToolUse', 'Edit', 'src/total.ts', 'before editing src/total.ts'), expect: 'silent' },
      { ...tool('post-edit', 'PostToolUse', 'Edit', 'src/total.ts', 'after editing src/total.ts'), expect: 'runs' },
      { ...tool('pre-write', 'PreToolUse', 'Write', 'src/tax.ts', 'before creating src/tax.ts'), expect: 'silent' },
      { ...tool('post-write', 'PostToolUse', 'Write', 'src/tax.ts', 'after creating src/tax.ts'), expect: 'runs' },
      { ...tool('post-bash', 'PostToolUse', 'Bash', 'npm test', 'after running npm test'), expect: 'silent' },
    ],
    lesson: 'Formatting needs the file to exist, so it runs after the tool: PostToolUse, matched to Edit|Write so creating new files is covered and shell commands are not.',
  },
  {
    id: 'protect-env',
    title: 'Never let Claude edit .env files',
    description: 'Stop any edit or write to a .env file before it happens. Other edits must go through.',
    matcherOptions: ['Edit|Write', 'Edit', 'Read', '*'],
    behaviours: [blockEnv, warnEnv],
    stream: [
      { ...tool('pre-edit-env', 'PreToolUse', 'Edit', '.env', 'before editing .env'), expect: 'blocks' },
      { ...tool('pre-write-env', 'PreToolUse', 'Write', 'services/api/.env', 'before writing services/api/.env'), expect: 'blocks' },
      { ...tool('pre-edit-src', 'PreToolUse', 'Edit', 'src/total.ts', 'before editing src/total.ts'), expect: 'not-blocked' },
      { ...tool('post-edit-src', 'PostToolUse', 'Edit', 'src/total.ts', 'after editing src/total.ts'), expect: 'not-blocked' },
    ],
    lesson: 'Only PreToolUse can block, and only with exit code 2. Other non-zero codes are reported but do not stop anything, and PostToolUse is too late: the file is already changed. Match Write too, or new .env files slip through.',
  },
  {
    id: 'session-context',
    title: 'Start every session knowing the branch',
    description: 'When a session starts, give Claude the current branch and your open tickets. Do not repeat it on every prompt.',
    matcherOptions: ['startup', '*', 'compact'],
    behaviours: [printCtx, printExit2],
    stream: [
      { id: 'start', event: 'SessionStart', subject: 'startup', label: 'the session starting', expect: 'adds-context' },
      { id: 'prompt-1', event: 'UserPromptSubmit', label: 'your first prompt', expect: 'silent' },
      { id: 'prompt-2', event: 'UserPromptSubmit', label: 'your second prompt', expect: 'silent' },
    ],
    lesson: 'SessionStart runs once when a session starts, and its plain-text output (with exit 0) is added to Claude’s context. UserPromptSubmit would add it again on every prompt.',
  },
  {
    id: 'notify',
    title: 'Ping me when Claude needs permission',
    description: 'Get a desktop notification when Claude is waiting for you to approve something. Not when it is merely idle, and not every time it finishes.',
    matcherOptions: ['permission_prompt', 'idle_prompt', '*'],
    behaviours: [notify],
    stream: [
      { id: 'perm', event: 'Notification', subject: 'permission_prompt', label: 'a permission prompt', expect: 'runs' },
      { id: 'idle', event: 'Notification', subject: 'idle_prompt', label: 'an idle prompt', expect: 'silent' },
      { id: 'stop', event: 'Stop', label: 'Claude finishing a response', expect: 'silent' },
    ],
    lesson: 'Notification fires when Claude Code sends a notification, and its matcher filters on the notification type: permission_prompt is the one you want.',
  },
]
