import type { FailureMode } from '../../../simulation/evals'

export const failureModes: FailureMode[] = [
  {
    id: 'json',
    label: 'The JSON answer is sometimes wrapped in a sentence',
    surfacedBy: 'happy',
    frequency: 0.15,
    detectableBy: ['code', 'llm', 'human'],
    critical: true,
    consequence: 'Your parser throws, and the request fails for one customer in seven.',
  },
  {
    id: 'currency',
    label: 'Amounts in one locale come back without the currency',
    surfacedBy: 'edge',
    frequency: 0.02,
    detectableBy: ['code', 'llm', 'human'],
    critical: true,
    consequence: 'A handful of customers see the wrong number on an invoice email.',
  },
  {
    id: 'injection',
    label: 'The model follows instructions hidden in the customer message',
    surfacedBy: 'adversarial',
    frequency: 0.4,
    detectableBy: ['code', 'llm', 'human'],
    critical: true,
    consequence: 'A customer can make the assistant ignore your policy and promise a refund.',
  },
  {
    id: 'regression',
    label: 'A bug you fixed last month is back',
    surfacedBy: 'regression',
    frequency: 0.3,
    detectableBy: ['code', 'llm', 'human'],
    critical: true,
    consequence: 'The same customer reports the same problem again, which is the worst kind of bug report to receive.',
  },
  {
    id: 'tone',
    label: 'Replies became noticeably curt',
    surfacedBy: 'happy',
    frequency: 0.5,
    detectableBy: ['llm', 'human'],
    critical: false,
    consequence: 'Nothing breaks, but satisfaction scores drift down over a quarter.',
  },
]
