import type { CompositeSpec } from '../../../simulation/composite'

export const teamSetupSpec: CompositeSpec = {
  passScore: 70,
  parts: [
    {
      kind: 'choice',
      id: 'shape',
      label: 'Assistant or agent',
      question: 'The client wants Claude to draft first replies to incoming supplier emails. What do you build first?',
      weight: 2,
      options: [
        { id: 'assistant', label: 'A drafting assistant: a person reads and sends every reply', score: 95, explanation: 'Start with the simplest thing that works. Earn autonomy with evidence.' },
        { id: 'agent', label: 'An agent that sends replies on its own from day one', score: 25, cap: 60, explanation: 'Unattended sending with no evaluation and no track record. That caps your setup.' },
        { id: 'multi-agent', label: 'Five cooperating agents with an orchestrator', score: 30, explanation: 'Agents cost more and can compound errors. Add complexity only when a simpler version has failed.' },
      ],
    },
    {
      kind: 'choice',
      id: 'method',
      label: 'Development method',
      question: 'How does the team go from requirement to code?',
      weight: 2,
      options: [
        { id: 'spec', label: 'A short written spec, then a reviewed plan, then implementation', score: 90, explanation: 'Humans agree the target; agents work against it.' },
        { id: 'adhoc', label: 'Everyone prompts their own way', score: 30, explanation: 'Fast for one person, slow for five.' },
        { id: 'heavy', label: 'A full methodology with every role as an agent, adopted on day one', score: 50, explanation: 'Might fit later. Pilot on one feature before the whole team commits.' },
      ],
    },
    {
      kind: 'checklist',
      id: 'repo',
      label: 'What goes in the repository',
      question: 'Tick what you commit for the whole team.',
      weight: 2,
      items: [
        { id: 'claude-md', label: 'CLAUDE.md with conventions and commands', shouldInclude: true, explanation: 'Every session starts from the same rules.' },
        { id: 'skills', label: 'The team’s own skills under .claude/skills', shouldInclude: true, explanation: 'Shared methods, reviewed like code.' },
        { id: 'deny', label: 'Permission rules that deny reading .env files', shouldInclude: true, explanation: 'Guardrails belong in shared settings, not in everyone’s memory.' },
        { id: 'api-key', label: 'The client’s API key, so agents can test against production', shouldInclude: false, cap: 30, explanation: 'Never commit secrets. This caps your setup.' },
        { id: 'personal', label: 'Your personal output style and shortcuts', shouldInclude: false, explanation: 'Personal preferences stay in your user settings.' },
      ],
    },
    {
      kind: 'checklist',
      id: 'community',
      label: 'Adopting a community skill',
      question: 'The team wants to try Superpowers. Tick what you do.',
      weight: 2,
      items: [
        { id: 'read', label: 'Read its skills and scripts before installing', shouldInclude: true, explanation: 'A skill can include scripts. Know what you are running.' },
        { id: 'pilot', label: 'Pilot it on one feature and compare with your current way', shouldInclude: true, explanation: 'The breakout this afternoon, in miniature.' },
        { id: 'measure', label: 'Measure review effort and rework, not just speed', shouldInclude: true, explanation: 'The author’s numbers are not your numbers.' },
        { id: 'everything', label: 'Install every trending skill so the agent has more options', shouldInclude: false, explanation: 'More instructions are more noise, and more code you did not read.' },
      ],
    },
    {
      kind: 'choice',
      id: 'review',
      label: 'Merging',
      question: 'Who decides that agent-written code is ready?',
      weight: 2,
      options: [
        { id: 'human', label: 'A human reviewer, with AI review as an extra pair of eyes', score: 95, explanation: 'Someone on the team understands and owns every change.' },
        { id: 'tests', label: 'Green tests are enough', score: 30, cap: 60, explanation: 'Tests written by the same session prove it built what it built. That caps your setup.' },
      ],
    },
  ],
  summaries: {
    excellent: 'A setup you could take to a client on Monday: simple first, shared rules, vetted skills and human ownership.',
    pass: 'Workable. Look at the notes before rolling it out to a team.',
    fail: 'This setup trades control for speed somewhere it matters. Look at what capped your score.',
  },
}
