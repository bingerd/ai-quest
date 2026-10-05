import type { LiveChecklistItem } from '../../../lessons/factories/liveChecklist'

export const desktopSetupSteps: LiveChecklistItem[] = [
  { id: 'open', label: 'Open Claude Desktop and sign in with your firm account', detail: 'Not a personal account. Check the account name in the bottom-left corner.' },
  { id: 'capabilities', label: 'Check Settings › Capabilities', detail: 'Make sure “Code execution and file creation” is on. Skills and file creation need it.' },
  { id: 'memory', label: 'Look at Settings › Memory', detail: 'See whether memory is on, and where to view, edit, pause or reset it.' },
  { id: 'project', label: 'Create a project called “Workshop – Meridian”', detail: 'Projects are in the sidebar.' },
  { id: 'instructions', label: 'Write three lines of project instructions', detail: 'Who you write for, the tone, and one format rule.' },
  { id: 'knowledge', label: 'Upload the workshop handout as project knowledge', detail: 'The facilitator shares it. It is fictional, no client data.' },
  { id: 'chat', label: 'Start a chat inside the project and ask: “What do you know about this engagement, and what rules will you follow?”', detail: 'You should see your instructions and the handout reflected in the answer.' },
]

export const roundsLiveSteps: LiveChecklistItem[] = [
  { id: 'r1', label: 'Round 1: outside any project, send only the one-line requirement', detail: 'Save the result. This is the baseline.' },
  { id: 'r2', label: 'Round 2: send the same requirement inside your workshop project', detail: 'Compare with round 1. What changed without you asking?' },
  { id: 'r3', label: 'Round 3: add the house style rules (or the design system) and run it again', detail: 'Compare the look and the structure.' },
  { id: 'r4', label: 'Round 4: run the facilitator’s status-update skill on the same input', detail: 'Compare all four. Which round gave you something you would send?' },
  { id: 'share', label: 'Put your round 1 and round 4 side by side for your table', detail: 'One sentence each: what made the biggest difference?' },
]

export const designLiveSteps: LiveChecklistItem[] = [
  { id: 'open', label: 'Open Claude Design (or ask for a one-pager in a normal chat)', detail: 'If your plan or admin settings do not show Claude Design, use a chat artifact instead.' },
  { id: 'brief', label: 'Ask for a one-page summary of the Meridian status update from your project', detail: 'Name the audience and the one message it must land.' },
  { id: 'comment', label: 'Make two targeted changes', detail: 'Comment on one element, edit one text directly. Do not regenerate the whole thing.' },
  { id: 'export', label: 'Export it as PDF or PPTX', detail: 'Open the export and check it survived the trip.' },
  { id: 'review', label: 'Swap with a neighbour and check each other’s numbers and claims', detail: 'On brand is not the same as correct.' },
]
