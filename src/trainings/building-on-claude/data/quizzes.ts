import type { QuizQuestion } from '../../../engine/types'

export const costQuiz: QuizQuestion[] = [
  {
    id: 'prefix',
    prompt: 'Your request puts the user question first and a 20,000-token knowledge base after it. What does prompt caching do?',
    options: [
      { id: 'a', label: 'Caches the knowledge base: it is identical every time' },
      { id: 'b', label: 'Nothing: the prefix changes every call, so there is nothing stable to reuse' },
      { id: 'c', label: 'Caches everything after the first call' },
    ],
    correctOptionId: 'b',
    explanation: 'The cache is a prefix cache. Anything before a breakpoint must be byte-identical, so a changing first block makes the rest uncacheable. Stable content goes first.',
  },
  {
    id: 'batch',
    prompt: 'Which workload belongs on the Batches API?',
    options: [
      { id: 'a', label: 'A chat assistant answering customers live' },
      { id: 'b', label: 'Re-tagging six months of archived tickets' },
      { id: 'c', label: 'Autocomplete in an editor' },
    ],
    correctOptionId: 'b',
    explanation: 'Batches are half price and usually finish within an hour, which suits work nobody is waiting for.',
  },
  {
    id: 'ttl',
    prompt: 'Calls arrive every 20 minutes. Which cache lifetime makes sense?',
    options: [
      { id: 'a', label: '5 minutes: the write is cheaper' },
      { id: 'b', label: '1 hour: a 2x write beats writing again on every call' },
      { id: 'c', label: 'Neither; caching cannot help here' },
    ],
    correctOptionId: 'b',
    explanation: 'With a 5-minute lifetime the entry expires between calls, so you pay the write premium every time and never get a read.',
  },
]
