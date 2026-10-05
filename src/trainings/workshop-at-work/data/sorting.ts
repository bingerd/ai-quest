import type { SortBucket, SortItem } from '../../../simulation/sorting'

export const contextBuckets: SortBucket[] = [
  { id: 'instructions', label: 'Project instructions', description: 'How Claude should always work here' },
  { id: 'knowledge', label: 'Project knowledge', description: 'Files every chat in the project can use' },
  { id: 'chat', label: 'This chat only', description: 'Needed once, for this task' },
  { id: 'fresh', label: 'Start a fresh chat', description: 'Carry a short summary, drop the rest' },
  { id: 'never', label: 'Keep it out', description: 'Should not go into Claude' },
]

export const contextItems: SortItem[] = [
  { id: 'tone', label: '“Write for the client’s operations director. Plain English, no consulting jargon.”', correctBucket: 'instructions', explanation: 'A rule for every chat on the account is an instruction.' },
  { id: 'sow', label: 'The signed statement of work', detail: 'You refer to it all quarter', correctBucket: 'knowledge', explanation: 'Reference material you will reuse belongs in project knowledge. It is uploaded once and reused rather than re-sent.' },
  { id: 'long-thread', label: 'A 70-message chat that has drifted from the deck to the budget to a workshop plan', correctBucket: 'fresh', explanation: 'Every message re-sends the whole chat. Ask for a short summary of what matters and continue in a fresh chat.' },
  { id: 'screenshot', label: 'A screenshot of one chart you want described in words', correctBucket: 'chat', explanation: 'A one-off file for a one-off question: attach it to the chat.' },
  { id: 'rates', label: 'The team’s day rates and margin sheet', detail: 'Not needed for the status update', correctBucket: 'never', explanation: 'Commercially sensitive and irrelevant to the task. Irrelevant context hurts the answer and creates risk.' },
  { id: 'glossary', label: 'The client’s glossary of internal system names', correctBucket: 'knowledge', explanation: 'You will need it in many chats. Knowledge, not a paste.' },
  { id: 'format', label: '“Status updates: one page, RAG status first, decisions needed last.”', correctBucket: 'instructions', explanation: 'A format rule you want every time is an instruction.' },
  { id: 'api-key', label: 'The API key for the client’s reporting dashboard', correctBucket: 'never', explanation: 'Credentials never go into a chat.' },
  { id: 'new-topic', label: 'You finished the deck and now want to plan next week’s workshop', correctBucket: 'fresh', acceptable: ['chat'], explanation: 'A new topic deserves a new chat in the same project. The project still gives it the instructions and files.' },
]

export const workflowBuckets: SortBucket[] = [
  { id: 'project', label: 'A project', description: 'Shared instructions and files for ongoing work' },
  { id: 'skill', label: 'A skill', description: 'A repeatable method, packaged once' },
  { id: 'connector', label: 'A connector', description: 'Claude reaches another app' },
  { id: 'design', label: 'Claude Design', description: 'Visual work on a canvas' },
  { id: 'file', label: 'File creation in chat', description: 'A real .docx, .xlsx or .pptx' },
  { id: 'cowork', label: 'Cowork / a scheduled task', description: 'Claude carries out a multi-step task, or repeats it on a schedule' },
]

export const workflowItems: SortItem[] = [
  { id: 'account-hub', label: 'Everything about the Northwind account in one place, for the whole account team', correctBucket: 'project', explanation: 'Ongoing work with shared files and rules is what projects are for. On Team and Enterprise you can share it.' },
  { id: 'proposal-method', label: 'The firm’s way of writing a proposal: structure, checks, tone. Every account team should use it.', correctBucket: 'skill', acceptable: ['project'], explanation: 'A method that should travel across accounts is a skill. A project is tied to one body of work and its files.' },
  { id: 'drive-docs', label: 'Answer questions from documents that already live in Google Drive', correctBucket: 'connector', explanation: 'A connector lets Claude reach the app where the files already are, instead of re-uploading them.' },
  { id: 'one-pager', label: 'A branded one-pager and an interactive prototype for a pitch', correctBucket: 'design', explanation: 'Visual work and prototypes, picking up the organisation’s design system: Claude Design.' },
  { id: 'budget-sheet', label: 'Turn a pasted table into a formatted Excel budget with formulas', correctBucket: 'file', explanation: 'Claude can create .xlsx files directly in the chat.' },
  { id: 'meeting-notes', label: 'Turn every workshop transcript into minutes in the same format', correctBucket: 'skill', acceptable: ['project'], explanation: 'The same steps, every time: a skill. A project works too if it is one engagement.' },
  { id: 'slack-summary', label: 'Summarise what the delivery team said in the project Slack channel this week', correctBucket: 'connector', explanation: 'The information is in another app. Connect it rather than copy-pasting it.' },
  { id: 'briefing', label: 'Every weekday at 8:00, a briefing of what changed in Slack and Drive overnight', correctBucket: 'cowork', explanation: 'A recurring task on a cadence is a scheduled task. It runs remotely, even when your laptop is closed.' },
  { id: 'folder', label: 'Rename and sort 200 scanned receipts in a folder on your laptop', correctBucket: 'cowork', explanation: 'Multi-step work on local files is what Cowork does in the Desktop app. Be selective about which folders it can reach: it can also delete.' },
  { id: 'memo', label: 'A two-page decision memo as a Word document', correctBucket: 'file', explanation: 'A document you will edit and send: create the .docx in the chat.' },
]
