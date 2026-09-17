import type { SortBucket, SortItem } from '../../../simulation/sorting'

export const extensionBuckets: SortBucket[] = [
  { id: 'claude-md', label: 'CLAUDE.md', description: 'Facts and conventions, loaded every session' },
  { id: 'settings', label: 'settings.json', description: 'Permissions, model, env: enforced config' },
  { id: 'hook', label: 'Hook', description: 'A command that must run at a lifecycle event' },
  { id: 'skill', label: 'Skill', description: 'A reusable workflow, loaded when needed' },
  { id: 'subagent', label: 'Subagent', description: 'Delegated work in its own context' },
  { id: 'mcp', label: 'MCP server', description: 'Access to an external tool or data source' },
  { id: 'output-style', label: 'Output style', description: 'How Claude responds and explains' },
]

export const extensionItems: SortItem[] = [
  { id: 'pnpm', label: '"Our test command is pnpm test, never npm test."', correctBucket: 'claude-md', explanation: 'A project fact Claude cannot guess from the code. CLAUDE.md is the place.' },
  { id: 'no-env', label: 'Claude must never read .env files.', correctBucket: 'settings', acceptable: ['hook'], explanation: 'A permission deny rule enforces it. Writing "please don’t" in CLAUDE.md is only a request.' },
  { id: 'prettier', label: 'Run prettier after every file edit, without exception.', correctBucket: 'hook', explanation: '"Every time, without exception" means a hook: a PostToolUse hook runs deterministically, not when Claude remembers.' },
  { id: 'release-notes', label: 'A repeatable "prepare release notes" workflow with a template, used a few times a month.', correctBucket: 'skill', explanation: 'A skill packages the workflow and template. Only its description loads until it is needed, so it costs almost nothing the rest of the time.' },
  { id: 'security-review', label: 'Review a large diff for security issues and report back a short summary.', correctBucket: 'subagent', explanation: 'A subagent reads the whole diff in its own context and returns only the findings, keeping your main session clean.' },
  { id: 'linear', label: 'Let Claude look up and update tickets in the team’s issue tracker.', correctBucket: 'mcp', explanation: 'External systems are reached through MCP servers.' },
  { id: 'teaching', label: 'Explain the reasoning behind each change while coding with a junior developer.', correctBucket: 'output-style', explanation: 'Output styles change how Claude responds. The built-in Learning and Explanatory styles do exactly this.' },
  { id: 'opusplan', label: 'Use opusplan as the default model for this repository.', correctBucket: 'settings', explanation: 'The model setting lives in settings.json, committed in .claude/settings.json for the whole team.' },
  { id: 'cents', label: '"In the payments module, money is integer cents, never floats."', correctBucket: 'claude-md', explanation: 'A convention for part of the codebase. CLAUDE.md, or a path-scoped rule in .claude/rules, both count as project memory.' },
  { id: 'deprecated-search', label: 'Find every call to a deprecated logger across 400 files without flooding the session.', correctBucket: 'subagent', explanation: 'Broad searches produce a lot of noise. Delegate them and get back the list.' },
  { id: 'deploy-cmd', label: 'A /deploy-preview command the team triggers by hand.', correctBucket: 'skill', explanation: 'Skills create /name commands. The older .claude/commands folder still works but is legacy.' },
]
