import type { ContextItemSpec } from '../../../simulation/contextSelection'

export interface ContextScenario {
  id: string
  title: string
  task: string
  /** Extra framing shown in the brief. */
  framing: string
  tokenLimit: number
  modelId: string
  items: ContextItemSpec[]
  /** Which items start selected. */
  initialSelectedIds: string[]
}

export const tokenHeistScenario: ContextScenario = {
  id: 'token-heist',
  title: 'Token Heist',
  task: 'Prepare a Q3 regional sales analysis for the leadership meeting: revenue by region, top customers, and the biggest risks.',
  framing:
    'You have a limited context budget. Move the documents you need into the context window and leave the rest on the shelf. Every token you include costs money and time.',
  tokenLimit: 16_000,
  modelId: 'heron',
  initialSelectedIds: [],
  items: [
    { id: 'sales', label: 'Q3 Sales Report', tokens: 2_800, relevance: 1, required: true, description: 'Revenue, margins and pipeline for the quarter.' },
    { id: 'regional', label: 'Regional Targets', tokens: 1_600, relevance: 0.9, description: 'Targets per region agreed at the start of the year.' },
    { id: 'customers', label: 'Customer Data', tokens: 4_200, relevance: 0.8, description: 'Top accounts, churn and expansion.' },
    { id: 'prev', label: 'Previous Conversation', tokens: 3_400, relevance: 0.6, description: 'Last week’s chat about how leadership likes the analysis framed.' },
    { id: 'faq', label: 'Customer FAQ', tokens: 3_100, relevance: 0.3, description: 'Public help-centre articles.' },
    { id: 'history', label: 'Company History', tokens: 1_900, relevance: 0.1, description: 'Founding story and milestones.' },
    { id: 'ceo', label: 'CEO Biography', tokens: 1_200, relevance: 0.05, description: 'Career highlights of the CEO.' },
    { id: 'hr', label: 'HR Handbook', tokens: 8_100, relevance: 0.05, description: 'Leave policy, expenses, code of conduct.' },
  ],
}

export const contextSurgeonScenario: ContextScenario = {
  id: 'context-surgeon',
  title: 'Context Surgeon',
  task: 'Answer an enterprise customer’s question: are they entitled to a refund for the unused seats on their contract?',
  framing:
    'A colleague built this context package by pasting in everything they could find. It is far over budget. Cut it down to what the task actually needs. Metrics update live as you toggle items.',
  tokenLimit: 12_000,
  modelId: 'heron',
  initialSelectedIds: ['refund', 'contract', 'tickets', 'pricing', 'macros', 'roadmap', 'hrpolicy', 'history', 'ceo', 'brochure', 'allhands'],
  items: [
    { id: 'refund', label: 'Refund Policy', tokens: 1_800, relevance: 1, required: true, description: 'Terms for refunds and credits.' },
    { id: 'contract', label: 'Customer’s Contract', tokens: 3_200, relevance: 1, required: true, description: 'Seats, term, renewal and special clauses.' },
    { id: 'tickets', label: 'Ticket History', tokens: 2_400, relevance: 0.8, description: 'Previous support conversations with this customer.' },
    { id: 'pricing', label: 'Pricing Information', tokens: 1_500, relevance: 0.5, description: 'List prices and discount bands.' },
    { id: 'macros', label: 'Support Reply Templates', tokens: 1_100, relevance: 0.45, description: 'Standard phrasing for common replies.' },
    { id: 'roadmap', label: 'Product Roadmap', tokens: 4_600, relevance: 0.05, description: 'Planned features for the next year.' },
    { id: 'hrpolicy', label: 'HR Policy', tokens: 5_200, relevance: 0.02, description: 'Internal HR policies.' },
    { id: 'history', label: 'Company History', tokens: 1_900, relevance: 0.05, description: 'Founding story and milestones.' },
    { id: 'ceo', label: 'CEO Biography', tokens: 1_200, relevance: 0.02, description: 'Career highlights of the CEO.' },
    { id: 'brochure', label: 'Marketing Brochure', tokens: 2_700, relevance: 0.1, description: 'Sales collateral.' },
    { id: 'allhands', label: 'All-Hands Transcript', tokens: 9_800, relevance: 0.05, description: 'Transcript of last month’s company meeting.' },
  ],
}
