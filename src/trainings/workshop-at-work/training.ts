import type { Training } from '../../engine/types'
import { makeLiveChecklist } from '../../lessons/factories/liveChecklist'
import { contextRoundsChallenge, contextSortChallenge, designSystemChallenge, policyChallenge, workflowChallenge } from './challenges/definitions'
import { designLiveSteps, desktopSetupSteps, roundsLiveSteps } from './data/live'
import { llmQuiz } from './data/quizzes'
import Welcome from './lessons/00-welcome.mdx'
import { AudienceCheck } from './lessons/AudienceCheck'
import { NextTokenGame } from './lessons/NextTokenGame'

const DesktopSetup = makeLiveChecklist({
  intro: 'Do this in Claude Desktop now, one step at a time, and tick each step off here.',
  items: desktopSetupSteps,
  done: 'You have a project that knows who you write for and what the engagement is about. Every exercise this afternoon runs inside it.',
})

const RoundsLive = makeLiveChecklist({
  intro: 'Now run the four rounds for real in Claude Desktop, with the requirement on the handout. Keep every output: you will compare them at your table.',
  items: roundsLiveSteps,
  done: 'Bring your round 1 and round 4 to the group discussion.',
})

const DesignLive = makeLiveChecklist({
  intro: 'Make a real one-pager from your round 4 output.',
  items: designLiveSteps,
})

export const workshopAtWorkTraining: Training = {
  id: 'workshop-at-work',
  title: 'Workshop 1: Claude at work',
  tagline: 'Facilitated · hands-on',
  description: 'The exercise track for the morning of the Claude onboarding workshop: policy calls, how a model writes, projects, context, design systems and everyday workflows. Most steps happen in Claude Desktop.',
  estimatedMinutes: 76,
  audience: 'everyone',
  level: 'beginner',
  modules: [
    {
      id: 'ws-start',
      title: 'Who is in the room',
      lessons: [
        { id: 'ws-welcome', title: 'Welcome', type: 'explanation', component: Welcome, estimatedMinutes: 1 },
        { id: 'audience-check', title: 'Where are you starting from?', type: 'reflection', component: AudienceCheck, estimatedMinutes: 2 },
      ],
    },
    {
      id: 'ws-policy',
      title: 'AI policy: internal and client use',
      lessons: [{ id: 'policy-calls', title: 'Scenario: policy calls', type: 'challenge', challenge: policyChallenge, estimatedMinutes: 4 }],
    },
    {
      id: 'ws-llm',
      title: 'How a model writes',
      lessons: [
        { id: 'next-token', title: 'Be the model', type: 'interactive', component: NextTokenGame, estimatedMinutes: 3 },
        { id: 'llm-quick-check', title: 'Quick check', type: 'quiz', questions: llmQuiz, estimatedMinutes: 1 },
      ],
    },
    {
      id: 'ws-desktop',
      title: 'Claude Desktop and projects',
      lessons: [
        { id: 'desktop-setup', title: 'Live: set up your project', type: 'reflection', component: DesktopSetup, estimatedMinutes: 10 },
        { id: 'where-it-goes', title: 'Challenge: where does it go?', type: 'challenge', challenge: contextSortChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'ws-context',
      title: 'Context management: four rounds',
      lessons: [
        { id: 'context-rounds', title: 'Scenario: four rounds, one requirement', type: 'challenge', challenge: contextRoundsChallenge, estimatedMinutes: 4 },
        { id: 'rounds-live', title: 'Live: run the four rounds', type: 'reflection', component: RoundsLive, estimatedMinutes: 25 },
      ],
    },
    {
      id: 'ws-design',
      title: 'Design systems',
      lessons: [
        { id: 'design-system-brief', title: 'Challenge: set up the brand once', type: 'challenge', challenge: designSystemChallenge, estimatedMinutes: 4 },
        { id: 'design-live', title: 'Live: make a one-pager', type: 'reflection', component: DesignLive, estimatedMinutes: 15 },
      ],
    },
    {
      id: 'ws-workflows',
      title: 'Workflows',
      lessons: [{ id: 'which-workflow', title: 'Final challenge: the right tool for the workflow', type: 'challenge', challenge: workflowChallenge, estimatedMinutes: 4 }],
    },
  ],
}
