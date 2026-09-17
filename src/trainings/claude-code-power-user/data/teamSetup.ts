import type { CompositeSpec } from '../../../simulation/composite'

export const teamSetupSpec: CompositeSpec = {
  passScore: 75,
  summaries: {
    excellent: 'A repo your teammates will enjoy: fast, safe, and nothing to explain twice.',
    pass: 'A good setup with a couple of rough edges.',
    fail: 'This setup would leak, nag or cost more than it should.',
  },
  parts: [
    {
      kind: 'checklist',
      id: 'claude-md',
      label: 'Project CLAUDE.md',
      question: 'Tick what goes into the committed ./CLAUDE.md.',
      weight: 3,
      items: [
        { id: 'commands', label: '## Commands: pnpm install, pnpm test, pnpm lint', shouldInclude: true, explanation: 'The exact commands are the most useful thing in any CLAUDE.md.' },
        { id: 'cents', label: 'Money is stored as integer cents, never floats', shouldInclude: true, explanation: 'A convention Claude cannot infer and must not get wrong.' },
        { id: 'import', label: 'Architecture overview: @docs/architecture.md', shouldInclude: true, explanation: 'An import keeps CLAUDE.md short while making the details reachable.' },
        { id: 'pasted', label: '[2,000-line API reference pasted inline]', shouldInclude: false, explanation: 'Loaded into every session for everyone. Import it from its own file instead.' },
        { id: 'neovim', label: 'I use Neovim and prefer dark mode', shouldInclude: false, explanation: 'Personal. It belongs in ~/.claude/CLAUDE.md or CLAUDE.local.md.' },
        { id: 'clean', label: 'Always write clean code and follow best practices', shouldInclude: false, explanation: 'Generic advice: tokens without information.' },
        { id: 'key', label: 'STRIPE_SECRET_KEY=sk_live_…', shouldInclude: false, explanation: 'A live secret committed to the repo and loaded into every session. This alone sinks the setup.', cap: 30 },
      ],
    },
    {
      kind: 'choice',
      id: 'rules-location',
      label: 'Where the team’s permission rules live',
      question: 'Everyone on the repo should get the same guardrails.',
      weight: 2,
      options: [
        { id: 'project', label: '.claude/settings.json', detail: 'Committed with the repo', score: 100, explanation: 'Project settings are shared with everyone who clones the repo.' },
        { id: 'local', label: '.claude/settings.local.json', detail: 'Gitignored', score: 30, explanation: 'Only you get these rules. Your teammates get none.' },
        { id: 'user', label: '~/.claude/settings.json', detail: 'Your machine, every project', score: 30, explanation: 'Applies to you everywhere, and to nobody else.' },
        { id: 'claude-md', label: 'A line in CLAUDE.md: "please never read .env"', detail: 'Instructions', score: 10, cap: 60, explanation: 'A request is not enforcement. Permission rules are.' },
      ],
    },
    {
      kind: 'choice',
      id: 'rules',
      label: 'The permission rules',
      question: 'Which rule set do you commit?',
      weight: 3,
      options: [
        { id: 'balanced', label: 'Balanced', detail: 'allow: Bash(pnpm test *), Bash(pnpm lint *), Edit(src/**) · deny: Read(.env), Bash(curl *)', score: 100, explanation: 'Routine work flows, secrets stay out, remote scripts are blocked, and everything else still asks.' },
        { id: 'everything', label: 'Allow everything', detail: 'allow: Bash, Edit, WebFetch', score: 10, cap: 50, explanation: 'Destructive commands and remote scripts run without a prompt. One bad suggestion away from an incident.' },
        { id: 'deny-all', label: 'Deny almost everything', detail: 'deny: Bash, Edit, WebFetch', score: 40, explanation: 'Safe on paper. In practice Claude cannot do the work, and people start looking for ways around the rules.' },
        { id: 'bypass', label: 'Skip prompts for the team', detail: '"defaultMode": "bypassPermissions" in .claude/settings.json', score: 0, cap: 50, explanation: 'Claude Code ignores bypassPermissions in project settings, precisely so a repo cannot switch off your prompts. And you would not want it to.' },
      ],
    },
    {
      kind: 'choice',
      id: 'formatting',
      label: 'Formatting',
      question: 'Code must always be formatted.',
      weight: 2,
      options: [
        { id: 'post-hook', label: 'PostToolUse hook on Edit|Write running prettier', score: 100, explanation: 'Deterministic: it runs after every edit, whether or not Claude remembers.' },
        { id: 'claude-md', label: '"Always run prettier" in CLAUDE.md', score: 50, explanation: 'Usually followed, not guaranteed. "Always" is a job for a hook.' },
        { id: 'pre-hook', label: 'PreToolUse hook on Edit|Write running prettier', score: 20, explanation: 'It runs before the edit exists, formatting the old file.' },
      ],
    },
    {
      kind: 'choice',
      id: 'model',
      label: 'Default model',
      question: 'What should the repo default to?',
      weight: 1,
      options: [
        { id: 'opusplan', label: 'opusplan', detail: 'Opus while planning, Sonnet while executing', score: 100, explanation: 'Deep reasoning where the design happens, efficient execution for the rest. Anyone can still switch with /model.' },
        { id: 'opus', label: 'opus for everything', score: 45, explanation: 'Great quality, and a premium price for renames and test runs too.' },
        { id: 'haiku', label: 'haiku for everything', score: 30, explanation: 'Cheap and fast, and out of its depth on design and tricky bugs.' },
      ],
    },
    {
      kind: 'checklist',
      id: 'mcp',
      label: 'Shared MCP servers in .mcp.json',
      question: 'Tick the servers the whole team should get.',
      weight: 1,
      items: [
        { id: 'tracker', label: 'Issue tracker (team workspace)', shouldInclude: true, explanation: 'Everyone works from the same tickets.' },
        { id: 'github', label: 'GitHub (reads pull requests and issues)', shouldInclude: true, explanation: 'Useful to everyone on the repo.' },
        { id: 'music', label: 'Your personal music player server', shouldInclude: false, explanation: 'Personal: add it with local or user scope instead.' },
        { id: 'prod-db', label: 'Production database with write credentials in the file', shouldInclude: false, explanation: 'Credentials committed to the repo, and write access to production for every session. Use environment variables and read-only access, if at all.', cap: 40 },
      ],
    },
  ],
}
