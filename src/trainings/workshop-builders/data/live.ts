import type { LiveChecklistItem } from '../../../lessons/factories/liveChecklist'

export const breakoutSteps: LiveChecklistItem[] = [
  { id: 'group', label: 'Join your breakout group and note the approach you were given', detail: 'Plain Claude Code (control group), Spec Kit, Superpowers, Caveman or Ponytail.' },
  { id: 'install', label: 'Install it from its repository README and read the main skill file first', detail: 'Two minutes of reading. What will it make Claude do differently?' },
  { id: 'task', label: 'Run the shared task from the handout, starting from the same commit as everyone else', detail: 'Timebox: 25 minutes. Stop when the timer ends, finished or not.' },
  { id: 'score', label: 'Fill in the rubric', detail: 'Does it meet the acceptance criteria? Lines changed, time spent, how long a review would take, what surprised you.' },
  { id: 'report', label: 'Prepare a two-minute report for the room', detail: 'One thing to steal, one thing to avoid.' },
]
