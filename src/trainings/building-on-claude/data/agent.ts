import type { AgentTaskSpec } from '../../../simulation/agent'

export const supportAgentSpec: AgentTaskSpec = {
  task: 'A customer asks why their invoice is higher than last month. The agent should explain the difference and, if our billing policy allows it, offer the right remedy.',
  contextLimit: 40_000,
  baseContextTokens: 8_000,
  forbiddenRisks: ['dangerous'],
  passScore: 70,
  steps: [
    { id: 'invoice', label: 'Fetch the two invoices', needs: 'billing', required: true },
    { id: 'policy', label: 'Check the billing policy', needs: 'policy', required: true },
    { id: 'history', label: 'Look at earlier tickets from this customer', needs: 'tickets', required: false },
  ],
  tools: [
    { id: 'billing-read', label: 'billing.getInvoices(accountId, months)', capability: 'billing', description: 'Returns the invoices for an account for the given months, including line items.', resultTokens: 1_200, latencySeconds: 0.5, costPerCall: 0.002, risk: 'read' },
    { id: 'data-service', label: 'data.query(q)', capability: 'billing', description: 'Queries data.', vague: true, resultTokens: 1_400, latencySeconds: 0.9, costPerCall: 0.003, risk: 'read' },
    { id: 'policy-search', label: 'policy.search(question)', capability: 'policy', description: 'Searches the billing and refund policies and returns the relevant passages.', resultTokens: 900, latencySeconds: 0.6, costPerCall: 0.002, risk: 'read' },
    { id: 'tickets', label: 'tickets.search(accountId)', capability: 'tickets', description: 'Returns past support tickets for an account.', resultTokens: 1_500, latencySeconds: 0.7, costPerCall: 0.002, risk: 'read' },
    { id: 'web', label: 'web.search(query)', capability: 'web', description: 'Searches the public web.', resultTokens: 7_000, latencySeconds: 2.5, costPerCall: 0.01, risk: 'read' },
    { id: 'refund', label: 'billing.issueRefund(accountId, amount)', capability: 'refund', description: 'Issues a refund immediately.', resultTokens: 200, latencySeconds: 0.8, costPerCall: 0, risk: 'dangerous', riskNote: 'Moving money must not be one hallucinated argument away. Let the agent recommend a refund and have a person or a separate approved flow execute it.' },
    { id: 'db-write', label: 'db.execute(sql)', capability: 'sql', description: 'Runs arbitrary SQL against the production database.', resultTokens: 500, latencySeconds: 1.2, costPerCall: 0, risk: 'dangerous', riskNote: 'Arbitrary SQL on production gives an agent the ability to delete data. No support task needs it.' },
  ],
}
