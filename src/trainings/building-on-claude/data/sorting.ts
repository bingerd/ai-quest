import type { SortBucket, SortItem } from '../../../simulation/sorting'

export const privilegeBuckets: SortBucket[] = [
  { id: 'auto', label: 'Agent may do it', description: 'Read-only, reversible, low blast radius' },
  { id: 'approve', label: 'Needs a human', description: 'Real-world effect, but part of the job' },
  { id: 'never', label: 'Never give the agent this', description: 'Do it another way' },
]

export const privilegeItems: SortItem[] = [
  { id: 'read-invoice', label: 'Read an account’s invoices', correctBucket: 'auto', explanation: 'Read-only and scoped to one account: exactly what the task needs.' },
  { id: 'search-policy', label: 'Search internal policy documents', correctBucket: 'auto', explanation: 'Read-only over content the agent is meant to use.' },
  { id: 'draft-reply', label: 'Draft a reply for the support agent to review', correctBucket: 'auto', explanation: 'Drafting changes nothing until a person sends it.' },
  { id: 'send-email', label: 'Send an email to the customer', correctBucket: 'approve', explanation: 'Outward-facing and hard to take back. A person should press send, at least until you trust the flow.' },
  { id: 'refund-small', label: 'Issue a refund within policy limits', correctBucket: 'approve', explanation: 'Money moving is a decision, not a lookup. Let the agent recommend it and have a person or a dedicated approved flow execute it.' },
  { id: 'close-ticket', label: 'Close a resolved ticket', correctBucket: 'approve', acceptable: ['auto'], explanation: 'Low risk and reversible, so some teams automate it. Start with approval and relax once you have the numbers.' },
  { id: 'sql', label: 'Run arbitrary SQL on the production database', correctBucket: 'never', explanation: 'Unbounded power for a bounded task. Expose the two queries the agent actually needs instead.' },
  { id: 'prod-deploy', label: 'Deploy to production', correctBucket: 'never', explanation: 'Nothing in a support workflow needs this. Keep deployment behind your normal pipeline.' },
  { id: 'credentials', label: 'Read the secrets manager', correctBucket: 'never', explanation: 'Credentials in context can leak into logs, traces and transcripts. The agent should receive scoped tokens, never the vault.' },
]
