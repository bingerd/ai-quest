import type { Scenario } from '../../../simulation/scenario'

export const sdlcScenario: Scenario = {
  id: 'sdlc-guardrails',
  title: 'One feature, five people, one week',
  intro:
    'Your team of five adds a returns dashboard to Northwind Logistics’ internal portal. Everyone uses Claude Code. Five moments from the week. There is no single right method; these are the trade-offs we will discuss afterwards.',
  dimensions: [
    { id: 'speed', label: 'Delivery speed', weight: 1 },
    { id: 'quality', label: 'Quality', weight: 2 },
    { id: 'coordination', label: 'Team coordination', weight: 2 },
  ],
  decisions: [
    {
      id: 'requirement',
      title: 'The ticket',
      situation: 'The ticket says: “Returns dashboard for ops. Should show the important stuff.”',
      question: 'What happens first?',
      options: [
        {
          id: 'spec',
          label: 'Draft a short spec with Claude (users, data, acceptance criteria), then get the product owner to correct it.',
          outcome: { score: 90, consequence: 'Half a day on the spec. The product owner deletes two features and adds one you had missed. Everyone, and every agent, now builds against the same written target.', dimensions: ['quality', 'coordination'], concept: 'spec-first' },
        },
        {
          id: 'just-build',
          label: 'Paste the ticket into Claude Code and start building.',
          outcome: { score: 35, consequence: 'A working dashboard by lunch, showing what Claude guessed “the important stuff” was. Two of its five charts are not what ops needed.', dimensions: ['speed', 'quality'], concept: 'spec-first' },
        },
        {
          id: 'big-spec',
          label: 'Write a 30-page specification before any code.',
          outcome: { score: 45, consequence: 'Thorough, out of date by Wednesday, and nobody reads past page 6. A spec should be the smallest document that removes the guessing.', dimensions: ['quality'], concept: 'spec-first' },
        },
      ],
    },
    {
      id: 'plan',
      title: 'Before the code',
      situation: 'The spec is agreed. A developer is about to let Claude implement the data layer.',
      question: 'How do they start?',
      options: [
        {
          id: 'plan-first',
          label: 'Ask Claude for a step-by-step plan first, review it, then let it implement.',
          outcome: { score: 90, consequence: 'The plan shows Claude wants to add a new database table. A two-minute review catches it: the data already exists in a view. Fixing a plan is cheap, fixing code is not.', dimensions: ['quality', 'speed'], concept: 'plan' },
        },
        {
          id: 'one-shot',
          label: 'Let it implement everything in one go and look at the diff.',
          outcome: { score: 45, consequence: 'A 1,800-line diff with the new table baked into every layer. Reviewing it takes longer than writing it would have.', dimensions: ['speed'], concept: 'plan' },
        },
      ],
    },
    {
      id: 'parallel',
      title: 'Five people at once',
      situation: 'Five developers and their agents all work on the dashboard at the same time.',
      question: 'How do you split the work?',
      options: [
        {
          id: 'slices',
          label: 'Split by spec slices with clear boundaries, each on its own branch, merged in small pull requests.',
          outcome: { score: 90, consequence: 'Each person owns a slice. Agents can go fast inside a slice without colliding. Merges are small and boring.', dimensions: ['coordination', 'speed', 'quality'], concept: 'parallel' },
        },
        {
          id: 'free-for-all',
          label: 'Everyone picks whatever looks undone and pushes often.',
          outcome: { score: 20, consequence: 'Two agents implement the same filter in different ways. Merge conflicts eat Thursday. Faster typing did not make the team faster.', dimensions: ['coordination'], concept: 'parallel' },
        },
        {
          id: 'one-driver',
          label: 'One person drives Claude, the other four review.',
          outcome: { score: 55, consequence: 'No conflicts, but four people mostly wait. Safe, and slow.', dimensions: ['quality', 'coordination'], concept: 'parallel' },
        },
      ],
    },
    {
      id: 'conventions',
      title: 'Conventions',
      situation: 'Each developer has their own prompts and habits. The code looks like five different teams wrote it.',
      question: 'What do you change?',
      options: [
        {
          id: 'shared',
          label: 'Put conventions in the repository’s CLAUDE.md, and commit the team’s skills next to the code.',
          outcome: { score: 90, consequence: 'Every session, for every person, starts from the same rules. Changes to them go through review like any other code.', dimensions: ['coordination', 'quality'], concept: 'shared-config' },
        },
        {
          id: 'wiki',
          label: 'Write a wiki page about the conventions.',
          outcome: { score: 45, consequence: 'People read it once. The agents never do.', dimensions: ['coordination'], concept: 'shared-config' },
        },
        {
          id: 'personal',
          label: 'Leave it. Everyone works their own way.',
          outcome: { score: 20, consequence: 'Reviews turn into style arguments, and every agent keeps relearning the same project.', dimensions: ['coordination', 'quality'], concept: 'shared-config' },
        },
      ],
    },
    {
      id: 'review',
      title: 'The review',
      situation: 'A pull request with 2,400 changed lines arrives on Friday. All the tests pass.',
      question: 'What do you do?',
      options: [
        {
          id: 'merge',
          label: 'Merge it. The tests pass.',
          outcome: { score: 10, consequence: 'The tests were written by the same session as the code, and they test what it built rather than what the spec asked for. Ops finds the gap on Monday.', dimensions: ['speed'], concept: 'review' },
        },
        {
          id: 'split-review',
          label: 'Ask for it to be split, check it against the spec’s acceptance criteria, and use an AI review as a second pair of eyes, not the only one.',
          outcome: { score: 90, consequence: 'Three readable pull requests. A human checks the spec, an AI review catches two edge cases. You stay responsible for what ships.', dimensions: ['quality', 'coordination'], concept: 'review' },
        },
        {
          id: 'ai-only',
          label: 'Have another Claude session review it and merge if it approves.',
          outcome: { score: 40, consequence: 'Useful findings, but nobody on the team actually read the change. If it breaks, nobody knows how it works.', dimensions: ['speed', 'quality'], concept: 'review' },
        },
      ],
    },
  ],
}
