import type { Training } from '../../engine/types'
import { actionTitlesChallenge, designRunChallenge, factCheckChallenge, qbrPackChallenge } from './challenges/definitions'
import { numbersQuiz } from './data/quizzes'
import PyramidPrinciple from './lessons/10-pyramid-principle.mdx'
import ClaudeDesign from './lessons/20-claude-design.mdx'
import PickYourSurface from './lessons/21-pick-your-surface.mdx'
import Bluf from './lessons/30-bluf.mdx'
import DataToInsight from './lessons/40-data-to-insight.mdx'
import CheatSheet from './lessons/50-cheat-sheet.mdx'
import { BurnMeter } from './lessons/BurnMeter'
import { MemoBuilder } from './lessons/MemoBuilder'
import { StorylineBuilder } from './lessons/StorylineBuilder'

export const makingThingsTraining: Training = {
  id: 'making-things-with-claude',
  title: 'Making Things with Claude',
  tagline: 'Decks, reports and designs',
  description:
    'The client deliverables, in depth. Structure an argument before you build it, use Claude Design without spending your week on it, write decision memos partners act on, and keep every number defensible in front of a client.',
  estimatedMinutes: 37,
  audience: 'everyone',
  level: 'intermediate',
  recommendedAfter: ['everyday-claude'],
  modules: [
    {
      id: 'structure-first',
      title: 'Decks that land',
      description: 'Settle the argument in plain text, where changing it is cheap.',
      lessons: [
        { id: 'pyramid-principle', title: 'Decide the argument first', type: 'explanation', component: PyramidPrinciple, estimatedMinutes: 2 },
        { id: 'storyline-builder', title: 'Storyline Builder', type: 'interactive', component: StorylineBuilder, estimatedMinutes: 3 },
        { id: 'action-titles', title: 'Challenge: Action titles', type: 'challenge', challenge: actionTitlesChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'design-without-burn',
      title: 'Design without burning your week',
      description: 'What Claude Design is, what it costs, and what to do without it.',
      lessons: [
        { id: 'what-is-claude-design', title: 'Claude Design, and what it costs', type: 'explanation', component: ClaudeDesign, estimatedMinutes: 2 },
        { id: 'burn-meter', title: 'The cost of a design run', type: 'interactive', component: BurnMeter, estimatedMinutes: 3 },
        { id: 'pick-your-surface', title: 'When you do not have Claude Design', type: 'explanation', component: PickYourSurface, estimatedMinutes: 2 },
        { id: 'design-run', title: 'Challenge: a week on the deck', type: 'challenge', challenge: designRunChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'reports-that-get-read',
      title: 'Reports that get read',
      description: 'The answer first, the evidence under it, and a real check before it goes.',
      lessons: [
        { id: 'bluf', title: 'Put the answer in the first line', type: 'explanation', component: Bluf, estimatedMinutes: 2 },
        { id: 'memo-builder', title: 'Memo Builder', type: 'interactive', component: MemoBuilder, estimatedMinutes: 3 },
        { id: 'fact-check-pass', title: 'Challenge: the fact-check pass', type: 'challenge', challenge: factCheckChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'numbers-you-can-defend',
      title: 'Numbers you can defend',
      description: 'Handing over data, and checking what comes back.',
      lessons: [
        { id: 'data-to-insight', title: 'Numbers you can defend', type: 'explanation', component: DataToInsight, estimatedMinutes: 3 },
        { id: 'numbers-quiz', title: 'Quick check', type: 'quiz', questions: numbersQuiz, estimatedMinutes: 2 },
      ],
    },
    {
      id: 'ship-it',
      title: 'Ship it',
      description: 'The whole workflow, once, under real constraints.',
      lessons: [
        { id: 'making-things-cheat-sheet', title: 'Cheat sheet', type: 'explanation', component: CheatSheet, estimatedMinutes: 1 },
        { id: 'qbr-pack', title: 'Final Challenge: the QBR pack', type: 'challenge', challenge: qbrPackChallenge, estimatedMinutes: 5 },
      ],
    },
  ],
}
