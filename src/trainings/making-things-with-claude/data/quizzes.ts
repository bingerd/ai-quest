import type { QuizQuestion } from '../../../engine/types'

export const numbersQuiz: QuizQuestion[] = [
  {
    id: 'q-chart',
    prompt: 'You ask Claude for a chart of regional revenue to drop into a board deck. What do you get?',
    options: [
      { id: 'a', label: 'A description of what the chart would look like' },
      { id: 'b', label: 'A real file you can download — .xlsx, .pptx, .docx or PDF' },
      { id: 'c', label: 'A link to a chart hosted online' },
    ],
    correctOptionId: 'b',
    explanation:
      'With code execution and file creation on, Claude creates real .xlsx, .pptx, .docx and PDF files, up to 30 MB. It is on by default on Free, Pro and Max, and creating files uses more of your limit than a normal chat.',
  },
  {
    id: 'q-recompute',
    prompt: 'A summary says the average deal size is €41k. The spreadsheet you gave it has the raw deals. What is the safe move before this goes in front of the board?',
    options: [
      { id: 'a', label: 'Trust it — it had the actual data, so the arithmetic will be right' },
      { id: 'b', label: 'Recompute it yourself from the same column and check the two agree' },
      { id: 'c', label: 'Ask Claude whether it is sure' },
    ],
    correctOptionId: 'b',
    explanation:
      'Asking a model to check its own arithmetic gets you another confident answer, not an independent one. Any number that carries a decision gets recomputed by a second method — a spreadsheet formula, a colleague, the source system.',
  },
  {
    id: 'q-limits',
    prompt: 'Your usage limit resets in two hours and you still have a deck to finish. Which of these actually helps?',
    options: [
      { id: 'a', label: 'Switch from claude.ai to the desktop app to get a separate allowance' },
      { id: 'b', label: 'Turn off tools you are not using and drop the effort level for routine edits' },
      { id: 'c', label: 'Start a new chat for every single edit' },
    ],
    correctOptionId: 'b',
    explanation:
      'All surfaces — claude.ai, Claude Code, Claude Desktop — draw on the same limit, so switching apps changes nothing. Tools and connectors are token-intensive, and higher effort uses more tokens, so turning off what you do not need is the lever you actually have.',
  },
]
