import type { Training } from '../../engine/types'
import { makeLiveChecklist } from '../../lessons/factories/liveChecklist'
import { assistantOrAgentChallenge, sdlcChallenge, skillSortChallenge, teamSetupChallenge } from './challenges/definitions'
import { breakoutSteps } from './data/live'
import Harness from './lessons/00-harness.mdx'

const Breakout = makeLiveChecklist({
  intro: 'Breakout: every group runs the same task with a different approach. Then the room compares.',
  items: breakoutSteps,
  done: 'Bring your rubric to the room. The comparison matters more than the winner.',
})

export const workshopBuildersTraining: Training = {
  id: 'workshop-builders',
  title: 'Workshop 2: Building with agents',
  tagline: 'Facilitated · hands-on',
  description: 'The exercise track for the afternoon of the Claude onboarding workshop: assistants vs production agents, the harness, an AI-assisted development lifecycle, and built-in, custom and community skills.',
  estimatedMinutes: 49,
  audience: 'power-user',
  level: 'intermediate',
  recommendedAfter: ['workshop-at-work'],
  modules: [
    {
      id: 'ws-agents',
      title: 'Assistants, agents and harnesses',
      lessons: [
        { id: 'harness', title: 'The harness around the model', type: 'explanation', component: Harness, estimatedMinutes: 3 },
        { id: 'assistant-or-agent', title: 'Challenge: assistant or production agent?', type: 'challenge', challenge: assistantOrAgentChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'ws-sdlc',
      title: 'The AI-assisted development lifecycle',
      lessons: [{ id: 'sdlc-week', title: 'Scenario: one feature, five people', type: 'challenge', challenge: sdlcChallenge, estimatedMinutes: 5 }],
    },
    {
      id: 'ws-skills',
      title: 'Skills',
      lessons: [
        { id: 'skill-sort', title: 'Challenge: built-in, custom or community?', type: 'challenge', challenge: skillSortChallenge, estimatedMinutes: 3 },
        { id: 'skills-breakout', title: 'Live: compare approaches', type: 'reflection', component: Breakout, estimatedMinutes: 30 },
        { id: 'team-setup-final', title: 'Final challenge: your team’s Claude setup', type: 'challenge', challenge: teamSetupChallenge, estimatedMinutes: 5 },
      ],
    },
  ],
}
