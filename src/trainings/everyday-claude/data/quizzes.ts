import type { QuizQuestion } from '../../../engine/types'

export const basicsQuiz: QuizQuestion[] = [
  {
    id: 'long-chat',
    prompt: 'Your chat about the Meridian steering deck is now 60 messages long and answers are getting slow. What helps most?',
    options: [
      { id: 'a', label: 'Keep going, Claude remembers everything anyway' },
      { id: 'b', label: 'Ask Claude for a short summary, then continue in a fresh chat with that summary' },
      { id: 'c', label: 'Type your messages more politely' },
    ],
    correctOptionId: 'b',
    explanation: 'Every message sends the whole conversation again. A fresh chat that starts from a short summary carries only what matters.',
  },
  {
    id: 'project-vs-chat',
    prompt: 'You write a proposal most months from the same firm template, credentials deck and rate card. Where should those files live?',
    options: [
      { id: 'a', label: 'In a project, as project knowledge' },
      { id: 'b', label: 'Uploaded fresh into each new chat' },
      { id: 'c', label: 'Pasted as text at the top of every message' },
    ],
    correctOptionId: 'a',
    explanation: 'Project knowledge is set up once and reused. Re-uploading the same files every time costs time and more of your usage limit.',
  },
  {
    id: 'real-file',
    prompt: 'Can Claude give you an actual PowerPoint file?',
    options: [
      { id: 'a', label: 'No, only text you paste into slides yourself' },
      { id: 'b', label: 'Yes, it can create .pptx files (with file creation turned on), and there is a PowerPoint add-in' },
      { id: 'c', label: 'Only if you pay for a separate design tool' },
    ],
    correctOptionId: 'b',
    explanation: 'With code execution and file creation enabled, Claude can create .pptx, .docx, .xlsx and PDF files. The PowerPoint add-in works inside your own template.',
  },
]
