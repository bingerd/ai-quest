import type { SortBucket, SortItem } from '../../../simulation/sorting'

export const agentBuckets: SortBucket[] = [
  { id: 'assistant', label: 'AI assistant', description: 'A person drives it and reads every result' },
  { id: 'agent', label: 'Production agent', description: 'Runs inside a system, without a person on each step' },
]

export const agentItems: SortItem[] = [
  { id: 'email', label: 'A consultant asks Claude to draft a client email and edits it before sending', correctBucket: 'assistant', explanation: 'A person asks, reads and decides. The human is the quality gate.' },
  { id: 'triage', label: 'A service labels and routes every incoming support ticket overnight', correctBucket: 'agent', explanation: 'Nobody reads each step. It needs its own guardrails, logs and evaluation.' },
  { id: 'terminal', label: 'A developer uses Claude Code in the terminal and approves each file edit', correctBucket: 'assistant', explanation: 'Agentic tooling, but a person is watching and approving. Still an assistant workflow.' },
  { id: 'ci', label: 'Claude runs headless in CI and comments on every pull request', correctBucket: 'agent', explanation: 'Same harness, no person in the loop while it runs. Treat it as production software.' },
  { id: 'evals', label: '“We need an evaluation set with edge cases before we turn it on.”', correctBucket: 'agent', explanation: 'When no human checks each output, evals are how you know it works.' },
  { id: 'cost-of-error', label: '“If it gets it wrong, I notice and ask again.”', correctBucket: 'assistant', explanation: 'A mistake costs one bad draft that a person catches.' },
  { id: 'least-privilege', label: '“Give it only the tools it needs, log every action, and keep a way to switch it off.”', correctBucket: 'agent', explanation: 'An unattended agent acts on its own. Narrow tools, logging and a kill switch limit the damage.' },
  { id: 'research', label: 'An account manager asks for a researched summary of a prospect, with sources, before a meeting', correctBucket: 'assistant', explanation: 'A person reads the result and checks the sources before using it.' },
]

export const skillBuckets: SortBucket[] = [
  { id: 'anthropic', label: 'Anthropic-provided skill', description: 'Ships with Claude' },
  { id: 'custom', label: 'Custom skill', description: 'Written by you or your organisation' },
  { id: 'community', label: 'Community skill or toolkit', description: 'Open source, third party' },
  { id: 'not-skill', label: 'Not a skill', description: 'Another extension point' },
]

export const skillItems: SortItem[] = [
  { id: 'pptx', label: 'The skill Claude uses to generate PowerPoint files', correctBucket: 'anthropic', explanation: 'Anthropic provides skills for Excel, Word, PowerPoint and PDF. Claude uses them automatically when relevant.' },
  { id: 'xlsx', label: 'Excel spreadsheet creation and manipulation', correctBucket: 'anthropic', explanation: 'Anthropic-provided, alongside Word, PowerPoint and PDF.' },
  { id: 'proposal', label: 'Your firm’s proposal-review checklist, uploaded as a ZIP', correctBucket: 'custom', explanation: 'A custom skill. Private until shared; Team and Enterprise owners can provision skills for everyone.' },
  { id: 'repo-skill', label: 'A SKILL.md your team committed under .claude/skills in the repository', correctBucket: 'custom', explanation: 'A project skill in Claude Code: custom, versioned with the code, shared through the repo.' },
  { id: 'superpowers', label: 'Superpowers (brainstorm, write a plan, test-driven development, subagent-driven development)', correctBucket: 'community', explanation: 'An open-source skills framework by Jesse Vincent (obra). Not an Anthropic product: read it before you adopt it.' },
  { id: 'caveman', label: 'Caveman: terse answers to save tokens', correctBucket: 'community', explanation: 'A community skill. Its savings figures are the author’s claims; measure them on your own work.' },
  { id: 'ponytail', label: 'Ponytail: the laziest solution that works, YAGNI first', correctBucket: 'community', explanation: 'A community skill that pushes towards minimal code. Useful as a counterweight to over-building.' },
  { id: 'speckit', label: 'GitHub Spec Kit: specify, plan, tasks, implement', correctBucket: 'community', explanation: 'An open-source spec-driven development toolkit from GitHub that installs its own commands into Claude Code.' },
  { id: 'claude-md', label: 'CLAUDE.md with the project’s conventions', correctBucket: 'not-skill', explanation: 'Memory, always loaded. A skill only loads its body when it is used.' },
  { id: 'hook', label: 'A script that blocks every edit to the migrations folder', correctBucket: 'not-skill', explanation: 'A hook. It runs every time and enforces; a skill is guidance Claude chooses to load.' },
]
