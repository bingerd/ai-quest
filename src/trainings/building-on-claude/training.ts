import type { Training } from '../../engine/types'
import {
  agentToolboxChallenge,
  cacheArchitectChallenge,
  evalLabChallenge,
  leastPrivilegeChallenge,
  platformWeekChallenge,
  shipItChallenge,
  workloadChallenge,
} from './challenges/definitions'
import { costQuiz } from './data/quizzes'
import Welcome from './lessons/00-welcome.mdx'
import Cost from './lessons/01-cost.mdx'
import Agents from './lessons/02-agents.mdx'
import Evals from './lessons/03-evals.mdx'
import Rollout from './lessons/04-rollout.mdx'
import CheatSheet from './lessons/05-cheat-sheet.mdx'

export const buildingOnClaudeTraining: Training = {
  id: 'building-on-claude',
  title: 'Building on Claude',
  tagline: 'For engineers',
  description: 'Prompt caching and batching, agent tool design and least privilege, eval suites that catch regressions, and rolling Claude Code out across an organisation.',
  estimatedMinutes: 35,
  audience: 'engineer',
  level: 'advanced',
  recommendedAfter: ['token-management'],
  modules: [
    {
      id: 'cost',
      title: 'Cost engineering',
      description: 'Caching, batching and measuring.',
      lessons: [
        { id: 'engineer-welcome', title: 'Welcome', type: 'explanation', component: Welcome, estimatedMinutes: 1 },
        { id: 'cost-levers', title: 'The three levers on cost', type: 'explanation', component: Cost, estimatedMinutes: 2 },
        { id: 'cache-architect', title: 'Challenge: Cache Architect', type: 'challenge', challenge: cacheArchitectChallenge, estimatedMinutes: 4 },
        { id: 'workload-planner', title: 'Challenge: Workload Planner', type: 'challenge', challenge: workloadChallenge, estimatedMinutes: 3 },
        { id: 'cost-quiz', title: 'Quick check', type: 'quiz', questions: costQuiz, estimatedMinutes: 1 },
      ],
    },
    {
      id: 'agents',
      title: 'Agents, tools and MCP',
      description: 'Interfaces and blast radius.',
      lessons: [
        { id: 'tool-design', title: 'Tools are an interface, and a blast radius', type: 'explanation', component: Agents, estimatedMinutes: 2 },
        { id: 'agent-toolbox', title: 'Challenge: Agent Toolbox', type: 'challenge', challenge: agentToolboxChallenge, estimatedMinutes: 4 },
        { id: 'least-privilege', title: 'Challenge: Least privilege', type: 'challenge', challenge: leastPrivilegeChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'evals',
      title: 'Evals and quality',
      description: 'Knowing instead of hoping.',
      lessons: [
        { id: 'why-evals', title: 'Evals: shipping instead of hoping', type: 'explanation', component: Evals, estimatedMinutes: 2 },
        { id: 'eval-lab', title: 'Challenge: Eval Lab', type: 'challenge', challenge: evalLabChallenge, estimatedMinutes: 4 },
      ],
    },
    {
      id: 'rollout',
      title: 'Enterprise rollout',
      description: 'Hundreds of engineers, one paved road.',
      lessons: [
        { id: 'rollout', title: 'Rolling out to everyone', type: 'explanation', component: Rollout, estimatedMinutes: 2 },
        { id: 'platform-week', title: 'Scenario: A week on the platform team', type: 'challenge', challenge: platformWeekChallenge, estimatedMinutes: 4 },
      ],
    },
    {
      id: 'ship',
      title: 'Ship it',
      description: 'Everything at once.',
      lessons: [
        { id: 'engineer-cheat-sheet', title: 'Cheat sheet', type: 'explanation', component: CheatSheet, estimatedMinutes: 1 },
        { id: 'ship-it', title: 'Final Challenge: ship an AI feature', type: 'challenge', challenge: shipItChallenge, estimatedMinutes: 4 },
      ],
    },
  ],
}
