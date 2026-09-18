import type { DeckWorkflowSpec } from '../../../simulation/deckWorkflow'
import { accountReviewBrief } from './brief'

export const boardDeckWorkflow: DeckWorkflowSpec = {
  task: 'Prepare the Q3 steering deck for Meridian Retail next week. You will update it with the client’s feedback over the next two weeks.',
  tokenLimit: 40_000,
  modelId: 'heron',
  passScore: 70,
  sensitiveIds: ['salaries'],
  items: [
    { id: 'report', label: 'Q3 delivery review', tokens: 9_000, relevance: 1, required: true, description: '32 pages: scope delivered, benefits, workstreams.' },
    { id: 'targets', label: 'The signed statement of work', tokens: 1_500, relevance: 0.9, description: 'What phase one committed to.' },
    { id: 'last-deck', label: 'Last quarter’s steering deck', tokens: 4_000, relevance: 0.6, description: 'Shows the format the committee expects.' },
    { id: 'survey', label: 'Client satisfaction survey', tokens: 6_000, relevance: 0.3, description: 'Interesting, but not what the committee asked about.' },
    { id: 'wiki', label: 'The whole account SharePoint export', tokens: 30_000, relevance: 0.05, description: 'Everything, just in case.' },
    { id: 'salaries', label: 'Team rate card and salaries', tokens: 2_000, relevance: 0.02, description: 'Names, day rates, home addresses.' },
  ],
  brief: accountReviewBrief,
  workspaces: [
    { id: 'chat', label: 'A single chat', detail: 'Upload everything into one conversation.', score: 55, explanation: 'Fine for a one-off. This deck will be revised for two weeks, so you will be re-uploading files and dragging a long chat along.' },
    { id: 'project', label: 'A project for the Meridian account', detail: 'Files in project knowledge, brand rules in instructions.', score: 100, explanation: 'Set up once, reused for every revision, and easy to hand to whoever rolls onto the account next.' },
  ],
  reviews: [
    { id: 'none', label: 'No check', detail: 'It looks good.', score: 0, explanation: 'Nobody checked the numbers. In front of a client that is not an option: your firm is accountable for what you present.' },
    { id: 'ask', label: 'Ask Claude to double-check itself', detail: '"Is everything correct?"', score: 40, explanation: 'Useful for spotting some slips, but it is the same tool checking its own work. Look at the numbers yourself.' },
    { id: 'verify', label: 'Check numbers against the review and have your engagement manager read it', detail: 'Ask Claude to cite page numbers, then verify.', score: 100, explanation: 'Citations make checking quick, and a second reader catches what you are too close to see.' },
  ],
}
