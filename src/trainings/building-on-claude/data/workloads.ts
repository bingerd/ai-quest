import type { Workload } from '../../../simulation/workload'

export const workloads: Workload[] = [
  {
    id: 'support-chat',
    title: 'Live support assistant',
    description: 'Customers are waiting. Every request carries the same 14,000 tokens of policy documents.',
    interactive: true,
    requests: 40_000,
    sharedPrefixTokens: 14_000,
    uniqueTokensPerRequest: 400,
    outputTokens: 500,
    best: 'realtime-cached',
    why: {
      realtime: 'It works, and you pay for the same 14,000 tokens of policy on all 40,000 requests.',
      batch: 'Batches can take up to an hour. Nobody waits an hour in a chat window.',
      'realtime-cached': 'The policies are identical every time, so cache them once and read them back at a tenth of the price.',
    },
  },
  {
    id: 'nightly-tagging',
    title: 'Nightly ticket classification',
    description: 'Every night, 200,000 tickets from the day are tagged. The results are needed by morning.',
    interactive: false,
    requests: 200_000,
    sharedPrefixTokens: 400,
    uniqueTokensPerRequest: 250,
    outputTokens: 15,
    best: 'batch',
    why: {
      realtime: 'You pay full price for work nobody is waiting for.',
      batch: 'Nobody is waiting until morning, and the Batches API is half the price.',
      'realtime-cached': 'There is barely a shared prefix to cache, so caching adds a write premium for almost nothing.',
    },
  },
  {
    id: 'onboarding-summary',
    title: 'One-off migration summary',
    description: 'A one-time job: summarise 900 legacy documents. Each document is different. An engineer runs it once and reads the results tomorrow.',
    interactive: false,
    requests: 900,
    sharedPrefixTokens: 300,
    uniqueTokensPerRequest: 9_000,
    outputTokens: 700,
    best: 'batch',
    why: {
      realtime: 'It finishes sooner, at twice the price, for results nobody reads until tomorrow.',
      batch: 'Asynchronous work at half the price. Exactly what batches are for.',
      'realtime-cached': 'Every document is different: there is no stable prefix worth caching.',
    },
  },
]
