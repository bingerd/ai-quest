import type { CompositeSpec } from '../../../simulation/composite'

export const designSystemSpec: CompositeSpec = {
  passScore: 70,
  parts: [
    {
      kind: 'choice',
      id: 'home',
      label: 'Where the brand lives',
      question: 'Your firm makes dozens of client decks and one-pagers a week. Where should colours, fonts and components live?',
      weight: 3,
      options: [
        { id: 'org', label: 'In the organisation’s design system', score: 95, explanation: 'Every design project inherits it, so it is in place without anyone uploading anything.' },
        { id: 'project', label: 'A brand sheet in each project’s instructions', score: 65, explanation: 'It works, but every project owner keeps their own copy and they drift.' },
        { id: 'chat', label: 'Described in each chat when needed', score: 25, explanation: 'Retyped every time, and slightly different every time.' },
      ],
    },
    {
      kind: 'checklist',
      id: 'source',
      label: 'What goes into the source',
      question: 'Design system import is only as good as its source. Tick what you would feed it.',
      weight: 3,
      items: [
        { id: 'logos', label: 'Logo files in the right variants', shouldInclude: true, explanation: 'The basics, in the forms you actually use.' },
        { id: 'palette', label: 'The colour palette with exact values', shouldInclude: true, explanation: 'Exact values, not “our blue”.' },
        { id: 'type', label: 'Fonts and type scale', shouldInclude: true, explanation: 'Headings and body text that match the template.' },
        { id: 'good-examples', label: 'Three recent decks the brand team considers good', shouldInclude: true, explanation: 'Good examples teach layout and tone better than rules alone.' },
        { id: 'old-template', label: 'The 2019 template nobody uses any more', shouldInclude: false, explanation: 'Outdated sources make outdated designs. Garbage in, garbage on brand.' },
        { id: 'client-deck', label: 'A recent client deck full of Meridian’s confidential figures', shouldInclude: false, cap: 50, explanation: 'Client data has no place in a firm-wide design system that every project inherits.' },
        { id: 'every-deck', label: 'Every deck on the shared drive, “so it learns”', shouldInclude: false, explanation: 'Quantity dilutes the signal. You get the average of good and bad.' },
      ],
    },
    {
      kind: 'choice',
      id: 'iterate',
      label: 'Fixing a draft',
      question: 'The first one-pager is close, but the chart on the right uses the wrong colours and the title is too long.',
      weight: 2,
      options: [
        { id: 'comment', label: 'Comment on the chart and the title directly, one change each', score: 95, explanation: 'Targeted edits change only what you point at. Fewer iterations also means less usage.' },
        { id: 'regen', label: 'Ask for the whole thing again, “but better”', score: 25, explanation: 'Everything moves, including the parts that were right, and it uses a full generation of your limit.' },
        { id: 'export-fix', label: 'Export and fix it by hand', score: 50, explanation: 'Fine for one copy, but the next one will have the same problem.' },
      ],
    },
    {
      kind: 'choice',
      id: 'review',
      label: 'Before it reaches the client',
      question: 'It looks finished. What happens next?',
      weight: 2,
      options: [
        { id: 'human', label: 'You check every number and claim, and a colleague reads the message', score: 95, explanation: 'On brand is not the same as correct. A human signs off client work.' },
        { id: 'trust', label: 'Send it. It matches the brand perfectly.', score: 10, cap: 55, explanation: 'Looking right is not being right. Unchecked client deliverables cap your score.' },
      ],
    },
  ],
  summaries: {
    excellent: 'A setup the whole firm can reuse: one design system, clean sources, targeted edits and a human check.',
    pass: 'A workable setup. Look at the notes to make it scale beyond your own decks.',
    fail: 'This setup will produce off-brand or risky material. Look at what capped your score.',
  },
}
