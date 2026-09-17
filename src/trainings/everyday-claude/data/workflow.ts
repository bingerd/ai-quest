import type { DeckWorkflowSpec } from '../../../simulation/deckWorkflow'
import { q3DeckBrief } from './brief'

export const boardDeckWorkflow: DeckWorkflowSpec = {
  task: 'Prepare the Q3 deck for next week’s board meeting. You will update it with the board’s feedback over the next two weeks.',
  tokenLimit: 40_000,
  modelId: 'heron',
  passScore: 70,
  sensitiveIds: ['salaries'],
  items: [
    { id: 'report', label: 'Q3 financial report', tokens: 9_000, relevance: 1, required: true, description: '32 pages: revenue, costs, regions.' },
    { id: 'targets', label: 'Regional targets', tokens: 1_500, relevance: 0.9, description: 'What each region was supposed to hit.' },
    { id: 'last-deck', label: 'Last quarter’s board deck', tokens: 4_000, relevance: 0.6, description: 'Shows the format the board expects.' },
    { id: 'survey', label: 'Customer survey results', tokens: 6_000, relevance: 0.3, description: 'Interesting, but not what the board asked about.' },
    { id: 'wiki', label: 'Entire company wiki export', tokens: 30_000, relevance: 0.05, description: 'Everything, just in case.' },
    { id: 'salaries', label: 'Team salary spreadsheet', tokens: 2_000, relevance: 0.02, description: 'Names, salaries, home addresses.' },
  ],
  brief: q3DeckBrief,
  workspaces: [
    { id: 'chat', label: 'A single chat', detail: 'Upload everything into one conversation.', score: 55, explanation: 'Fine for a one-off. This deck will be revised for two weeks, so you will be re-uploading files and dragging a long chat along.' },
    { id: 'project', label: 'A project for the board deck', detail: 'Files in project knowledge, brand rules in instructions.', score: 100, explanation: 'Set up once, reused for every revision, and easy to hand to a colleague.' },
  ],
  reviews: [
    { id: 'none', label: 'No check', detail: 'It looks good.', score: 0, explanation: 'Nobody checked the numbers. For a board deck that is not an option: you are accountable for what you send.' },
    { id: 'ask', label: 'Ask Claude to double-check itself', detail: '"Is everything correct?"', score: 40, explanation: 'Useful for spotting some slips, but it is the same tool checking its own work. Look at the numbers yourself.' },
    { id: 'verify', label: 'Check numbers against the report and have a colleague read it', detail: 'Ask Claude to cite page numbers, then verify.', score: 100, explanation: 'Citations make checking quick, and a second reader catches what you are too close to see.' },
  ],
}
