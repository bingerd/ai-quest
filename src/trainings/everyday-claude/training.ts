import type { Training } from '../../engine/types'
import { basicsQuiz } from './data/quizzes'
import { boardDeckChallenge, deckDoctorChallenge, mondayChallenge, whereDoesItGoChallenge } from './challenges/definitions'
import Welcome from './lessons/00-welcome.mdx'
import DesktopTour from './lessons/06-desktop-tour.mdx'
import ChatsProjectsMemory from './lessons/01-chats-projects-memory.mdx'
import AnatomyOfABrief from './lessons/02-anatomy-of-a-brief.mdx'
import Projects from './lessons/03-projects.mdx'
import SlideFiles from './lessons/04-slide-files.mdx'
import CheatSheet from './lessons/05-cheat-sheet.mdx'
import { BriefBuilder } from './lessons/BriefBuilder'
import { LongChatTax } from './lessons/LongChatTax'

export const everydayClaudeTraining: Training = {
  id: 'everyday-claude',
  title: 'Claude for Everyday Work',
  tagline: 'No code needed',
  description: 'Make client-ready decks and documents that are right the first time. For sales, HR, account managers, delivery teams and partners: chats vs projects, briefing well, staying within limits and keeping client data safe.',
  estimatedMinutes: 25,
  audience: 'everyone',
  level: 'beginner',
  modules: [
    {
      id: 'how-claude-reads',
      title: 'How Claude reads your request',
      description: 'Where things are, and why long chats cost more.',
      lessons: [
        { id: 'everyday-welcome', title: 'Welcome', type: 'explanation', component: Welcome, estimatedMinutes: 1 },
        { id: 'desktop-tour', title: 'A quick tour of the window', type: 'explanation', component: DesktopTour, estimatedMinutes: 3 },
        { id: 'chats-projects-memory', title: 'Chats, projects and memory', type: 'explanation', component: ChatsProjectsMemory, estimatedMinutes: 2 },
        { id: 'long-chat-tax', title: 'The long-chat tax', type: 'interactive', component: LongChatTax, estimatedMinutes: 2 },
        { id: 'everyday-quiz', title: 'Quick check', type: 'quiz', questions: basicsQuiz, estimatedMinutes: 1 },
      ],
    },
    {
      id: 'asking-well',
      title: 'Asking well',
      description: 'Briefs that get a usable first draft.',
      lessons: [
        { id: 'anatomy-of-a-brief', title: 'The anatomy of a good brief', type: 'explanation', component: AnatomyOfABrief, estimatedMinutes: 1 },
        { id: 'brief-builder', title: 'Brief Builder', type: 'interactive', component: BriefBuilder, estimatedMinutes: 2 },
        { id: 'deck-doctor', title: 'Challenge: Deck Doctor', type: 'challenge', challenge: deckDoctorChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'right-place',
      title: 'The right place for the right thing',
      description: 'Projects, instructions, and real slide files.',
      lessons: [
        { id: 'projects', title: 'Projects: set it up once', type: 'explanation', component: Projects, estimatedMinutes: 1 },
        { id: 'where-does-it-go', title: 'Challenge: Where does it go?', type: 'challenge', challenge: whereDoesItGoChallenge, estimatedMinutes: 2 },
        { id: 'slide-files', title: 'Real slides, not just text', type: 'explanation', component: SlideFiles, estimatedMinutes: 1 },
      ],
    },
    {
      id: 'safe-and-smart',
      title: 'Safe and smart at work',
      description: 'Client data, checking, limits, and the final deck.',
      lessons: [
        { id: 'monday-at-the-office', title: 'Scenario: Monday on the account', type: 'challenge', challenge: mondayChallenge, estimatedMinutes: 3 },
        { id: 'everyday-cheat-sheet', title: 'Cheat sheet', type: 'explanation', component: CheatSheet, estimatedMinutes: 1 },
        { id: 'board-deck', title: 'Final Challenge: the client steering deck', type: 'challenge', challenge: boardDeckChallenge, estimatedMinutes: 3 },
      ],
    },
  ],
}
