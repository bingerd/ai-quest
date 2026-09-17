import type { QuizQuestion } from '../../../engine/types'

export const memoryQuiz: QuizQuestion[] = [
  {
    id: 'concatenate',
    prompt: 'You have ~/.claude/CLAUDE.md and ./CLAUDE.md. What does Claude Code load?',
    options: [
      { id: 'a', label: 'Only the project file; it overrides the user file' },
      { id: 'b', label: 'Both: memory files are combined, not overridden' },
      { id: 'c', label: 'Only the user file' },
    ],
    correctOptionId: 'b',
    explanation: 'CLAUDE.md files from different locations are concatenated. That is why personal preferences belong in your user file and team facts in the project file.',
  },
  {
    id: 'personal',
    prompt: 'Where should "I like terse answers" go?',
    options: [
      { id: 'a', label: 'The committed ./CLAUDE.md' },
      { id: 'b', label: '~/.claude/CLAUDE.md or ./CLAUDE.local.md' },
      { id: 'c', label: '.mcp.json' },
    ],
    correctOptionId: 'b',
    explanation: 'Personal preferences go in your user memory (all projects) or CLAUDE.local.md (this project, not committed).',
  },
  {
    id: 'every-session',
    prompt: 'Why keep CLAUDE.md short?',
    options: [
      { id: 'a', label: 'It is loaded into every session, so every line costs context every time' },
      { id: 'b', label: 'Claude only reads the first paragraph' },
      { id: 'c', label: 'Long files are rejected' },
    ],
    correctOptionId: 'a',
    explanation: 'Memory loads at the start of each session. Aim for under about 200 lines and move long references into imported files.',
  },
]
