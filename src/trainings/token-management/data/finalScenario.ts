import type { FinalScenario } from '../../../simulation/finalChallenge'

export const finalScenario: FinalScenario = {
  id: 'final',
  task: 'Analyse an escalated customer issue and recommend a resolution: an enterprise customer says they were double-billed after adding seats mid-term.',
  framing:
    'Design the workflow for the support team. Pick the model, choose what goes into context, decide whether to use retrieval, give the agent the tools it needs, and set an output budget. Then run it.',
  tokenLimit: 12_000,
  modelIds: ['heron', 'albatross'],
  complexity: 0.6,
  idealOutputTokens: 600,
  retrievalKeepShare: 0.3,
  retrievalLatencySeconds: 0.5,
  items: [
    { id: 'ticket', label: 'The escalated ticket', tokens: 1_500, relevance: 1, required: true, description: 'The customer’s messages and screenshots.' },
    { id: 'contract', label: 'Customer contract', tokens: 6_000, relevance: 0.9, description: 'Seats, pricing, mid-term change clauses.' },
    { id: 'billing-policy', label: 'Billing policy', tokens: 3_000, relevance: 0.8, description: 'How proration and seat changes are billed.' },
    { id: 'faq', label: 'Public billing FAQ', tokens: 2_500, relevance: 0.3, description: 'Customer-facing help articles.' },
    { id: 'roadmap', label: 'Product roadmap', tokens: 5_000, relevance: 0.05, description: 'Upcoming features.' },
    { id: 'history', label: 'Company history', tokens: 2_000, relevance: 0.05, description: 'Founding story and milestones.' },
    { id: 'prev', label: 'Previous conversation', tokens: 3_000, relevance: 0.5, description: 'Earlier chat with the account manager about this customer.' },
    { id: 'project', label: 'Project context: support playbook', tokens: 1_000, relevance: 0.6, description: 'Tone, escalation rules, refund authority limits.' },
  ],
  tools: [
    { id: 'billing', label: 'Billing system lookup', description: 'Fetches the invoices and seat changes for the account.', resultTokens: 800, latencySeconds: 0.6, costPerCall: 0.002, relevance: 0.95, required: true },
    { id: 'web', label: 'Web search', description: 'Searches the public web.', resultTokens: 4_000, latencySeconds: 2.5, costPerCall: 0.01, relevance: 0.1 },
    { id: 'email', label: 'Send email', description: 'Sends an email to the customer on the team’s behalf.', resultTokens: 200, latencySeconds: 0.8, costPerCall: 0.001, relevance: 0.15 },
  ],
}
