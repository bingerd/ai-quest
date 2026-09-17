import type { RetrievalDoc } from '../../../simulation/retrieval'

export const retrievalQuestion = 'Can this enterprise customer get a refund for unused seats?'

export const retrievalCorpus: RetrievalDoc[] = [
  { id: 'policy', title: 'Refund policy', tokens: 3_000, relevance: 1, keyPosition: 0.7 },
  { id: 'contract', title: 'Customer’s contract', tokens: 4_000, relevance: 0.9, keyPosition: 0.2 },
  { id: 'faq', title: 'Billing FAQ', tokens: 2_000, relevance: 0.6, keyPosition: 0.5 },
  { id: 'roadmap', title: 'Product roadmap', tokens: 5_000, relevance: 0.1, keyPosition: 0.5 },
  { id: 'hr', title: 'HR handbook', tokens: 8_000, relevance: 0.05, keyPosition: 0.5 },
  { id: 'allhands', title: 'All-hands transcript', tokens: 9_000, relevance: 0.05, keyPosition: 0.5 },
]

/** Goal for the lab: at least this coverage using at most this many tokens. */
export const retrievalGoal = { coverage: 100, maxTokens: 2_500 }
