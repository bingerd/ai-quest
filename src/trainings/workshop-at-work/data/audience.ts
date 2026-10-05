export interface AudienceQuestion {
  id: string
  prompt: string
  options: { id: string; label: string; points: number }[]
}

export const audienceQuestions: AudienceQuestion[] = [
  {
    id: 'role',
    prompt: 'What is most of your work?',
    options: [
      { id: 'docs', label: 'Decks, documents, client and people conversations', points: 0 },
      { id: 'mixed', label: 'Some of both: analysis, data, a bit of scripting', points: 1 },
      { id: 'code', label: 'Writing and reviewing code', points: 2 },
    ],
  },
  {
    id: 'usage',
    prompt: 'How often do you use an AI assistant today?',
    options: [
      { id: 'never', label: 'Rarely or never', points: 0 },
      { id: 'weekly', label: 'A few times a week', points: 1 },
      { id: 'daily', label: 'Every day, it is part of how I work', points: 2 },
    ],
  },
  {
    id: 'projects',
    prompt: 'Have you set up a Claude project with instructions and files?',
    options: [
      { id: 'no', label: 'No', points: 0 },
      { id: 'once', label: 'Once or twice', points: 1 },
      { id: 'yes', label: 'Yes, I use them all the time', points: 2 },
    ],
  },
  {
    id: 'agents',
    prompt: 'Have you used a coding agent (Claude Code or similar) or written a skill?',
    options: [
      { id: 'no', label: 'No', points: 0 },
      { id: 'tried', label: 'Tried it', points: 1 },
      { id: 'built', label: 'I use one daily, or I have written my own skills', points: 2 },
    ],
  },
]

export interface Track {
  id: 'non-technical' | 'mixed' | 'technical'
  title: string
  body: string
}

export function suggestTrack(answers: Record<string, string>): Track {
  const points = audienceQuestions.reduce((sum, q) => sum + (q.options.find((o) => o.id === answers[q.id])?.points ?? 0), 0)
  if (points <= 2)
    return { id: 'non-technical', title: 'Claude at work', body: 'Spend the day in Claude Desktop: projects, context and design. Part 2 of the workshop is optional for you.' }
  if (points >= 6)
    return { id: 'technical', title: 'Builders', body: 'Move quickly through this part and spend most of your time in Part 2: harnesses, agents, the development lifecycle and skills.' }
  return { id: 'mixed', title: 'Both parts', body: 'Follow the full day. Part 1 covers Claude Desktop, Part 2 covers how the same ideas scale into agents and skills.' }
}
