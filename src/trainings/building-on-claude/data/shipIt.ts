import type { CompositeSpec } from '../../../simulation/composite'

export const shipItSpec: CompositeSpec = {
  passScore: 75,
  summaries: {
    excellent: 'This is a feature you can put in front of customers and sleep at night.',
    pass: 'Shippable, with a couple of things to tighten before it grows.',
    fail: 'This would be expensive, unsafe, or silently broken.',
  },
  parts: [
    {
      kind: 'choice',
      id: 'model',
      label: 'Model tier',
      question: 'Classifying support tickets into 20 categories, 200,000 a day, accuracy target 95%.',
      weight: 2,
      options: [
        { id: 'small', label: 'The small, fast tier', detail: 'Validated against your eval set', score: 100, explanation: 'Simple, high-volume classification is exactly what a small model is for, once your evals show it clears the bar.' },
        { id: 'large', label: 'The largest reasoning tier', score: 30, explanation: 'Many times the cost and latency for a task the small tier handles. Capability you do not need is pure spend.' },
        { id: 'unknown', label: 'Whichever model the last project used', score: 20, explanation: 'Model choice is a measurable decision. Run the eval set against two tiers and read the numbers.' },
      ],
    },
    {
      kind: 'choice',
      id: 'prompt-shape',
      label: 'Request layout',
      question: 'Every request carries the same 18,000-token taxonomy and examples.',
      weight: 3,
      options: [
        { id: 'cached-prefix', label: 'Stable prefix first, cache breakpoint after it, ticket last', score: 100, explanation: 'The taxonomy is written to the cache once and read back at 0.1x. This is the single biggest cost lever you have.' },
        { id: 'ticket-first', label: 'Ticket first, then the taxonomy', score: 10, cap: 60, explanation: 'The prefix changes on every call, so nothing can be cached. Order decides whether caching is possible at all.' },
        { id: 'no-cache', label: 'Send everything fresh every time', score: 25, cap: 70, explanation: 'Simple, and you pay full price for the same 18,000 tokens 200,000 times a day.' },
      ],
    },
    {
      kind: 'choice',
      id: 'delivery',
      label: 'Delivery',
      question: 'Most tickets are classified overnight; about 5% need a label within seconds for live routing.',
      weight: 2,
      options: [
        { id: 'split', label: 'Batches overnight, realtime for the live 5%', score: 100, explanation: 'Half price for the bulk, immediate answers where someone is waiting.' },
        { id: 'all-realtime', label: 'Everything realtime', score: 45, explanation: 'Works, and pays full price for work nobody is waiting for.' },
        { id: 'all-batch', label: 'Everything batched', score: 20, explanation: 'Live routing would wait up to an hour. Batches are for asynchronous work.' },
      ],
    },
    {
      kind: 'checklist',
      id: 'evals',
      label: 'Eval suite before launch',
      question: 'Tick what goes into the suite that runs on every prompt or model change.',
      weight: 3,
      items: [
        { id: 'happy', label: 'Typical tickets, code-graded against expected labels', shouldInclude: true, explanation: 'The backbone: many cases, graded automatically, cheap to run on every change.' },
        { id: 'edge', label: 'Rare locales, empty bodies, 30-page attachments', shouldInclude: true, explanation: 'Rare inputs are where silent breakage lives, and you only find them if the suite contains them.' },
        { id: 'adversarial', label: 'Tickets containing instructions aimed at the model', shouldInclude: true, explanation: 'Customer text is untrusted input. Test that your prompt holds.' },
        { id: 'regression', label: 'Every bug you have already fixed', shouldInclude: true, explanation: 'Regression cases are the cheapest tests you will ever write.' },
        { id: 'human-all', label: 'A person reviewing all 1,000 cases every run', shouldInclude: false, explanation: 'Too slow to run on every change, so it will not be run. Keep a small human-reviewed sample instead.' },
        { id: 'vibes', label: 'A quick look at three outputs before merging', shouldInclude: false, explanation: 'That is not an eval, it is a vibe. It will miss anything that affects 2% of traffic.' },
      ],
    },
    {
      kind: 'choice',
      id: 'agent-scope',
      label: 'The auto-reply agent',
      question: 'The same feature can draft replies. What can it do on its own?',
      weight: 2,
      options: [
        { id: 'draft', label: 'Read the account, draft a reply, a human sends it', score: 100, explanation: 'Read-only tools plus a draft. The irreversible step keeps a person in it.' },
        { id: 'send', label: 'Draft and send replies automatically', score: 40, explanation: 'Defensible once you have the numbers, but not on day one and not without a tested rollback.' },
        { id: 'refund', label: 'Draft, send, and issue refunds within policy', score: 10, cap: 45, explanation: 'Moving money on the strength of a generated argument. Recommend the refund, let an approved flow execute it.' },
      ],
    },
    {
      kind: 'choice',
      id: 'rollout',
      label: 'Rollout and monitoring',
      question: 'How does it reach production?',
      weight: 2,
      options: [
        { id: 'staged', label: 'Shadow mode, then 5%, with cost and quality dashboards and a kill switch', score: 100, explanation: 'You see real traffic before it sees customers, and you can turn it off in seconds.' },
        { id: 'big-bang', label: 'Enable it for everyone on release day', score: 25, explanation: 'Your first real-traffic signal arrives as customer complaints.' },
        { id: 'manual-checks', label: 'Release to everyone, check the logs each morning', score: 35, explanation: 'A whole day of unnoticed breakage between checks, and no way to compare against the old behaviour.' },
      ],
    },
  ],
}
