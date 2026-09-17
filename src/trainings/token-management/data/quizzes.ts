import type { QuizQuestion } from '../../../engine/types'

export const foundationsQuiz: QuizQuestion[] = [
  {
    id: 'q-stateless',
    prompt: 'You send the 30th message in a long chat. What does the model receive?',
    options: [
      { id: 'a', label: 'Only your new message; it remembers the rest' },
      { id: 'b', label: 'Your new message plus the whole conversation so far' },
      { id: 'c', label: 'A summary the model wrote for itself' },
    ],
    correctOptionId: 'b',
    explanation: 'Models are stateless. The application re-sends the entire conversation on every turn, which is why long chats get slower and more expensive.',
  },
  {
    id: 'q-output',
    prompt: 'Which is usually more expensive per token?',
    options: [
      { id: 'a', label: 'Input tokens (what you send)' },
      { id: 'b', label: 'Output tokens (what the model writes)' },
      { id: 'c', label: 'They cost the same' },
    ],
    correctOptionId: 'b',
    explanation: 'Output tokens are typically priced several times higher and are generated one at a time, so they also dominate latency.',
  },
  {
    id: 'q-estimate',
    prompt: 'Roughly how many simulated tokens is a 20-page report?',
    options: [
      { id: 'a', label: 'About 1,400' },
      { id: 'b', label: 'About 14,000' },
      { id: 'c', label: 'About 140,000' },
    ],
    correctOptionId: 'b',
    explanation: 'A page is roughly 700 tokens, so 20 pages is about 14,000. Enough to fill a small context window on its own.',
  },
]
