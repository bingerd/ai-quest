import type { Training } from '../../engine/types'
import {
  claudeMdChallenge,
  extensionPointChallenge,
  hookLabChallenge,
  longSessionChallenge,
  permissionPuzzleChallenge,
  routeSessionChallenge,
  teamSetupChallenge,
} from './challenges/definitions'
import { memoryQuiz } from './data/quizzes'
import Welcome from './lessons/00-welcome.mdx'
import Memory from './lessons/01-memory.mdx'
import Settings from './lessons/02-settings.mdx'
import Hooks from './lessons/03-hooks.mdx'
import ExtensionPoints from './lessons/04-extension-points.mdx'
import Models from './lessons/05-models.mdx'
import Context from './lessons/06-context.mdx'
import CheatSheet from './lessons/07-cheat-sheet.mdx'
import { WhoWins } from './lessons/WhoWins'

export const claudeCodePowerUserTraining: Training = {
  id: 'claude-code-power-user',
  title: 'Claude Code Power User',
  tagline: 'Configuration mastery',
  description: 'CLAUDE.md that carries facts, settings layers and permission rules that hold, hooks, skills, subagents, MCP, model routing and long-session hygiene.',
  estimatedMinutes: 35,
  audience: 'power-user',
  level: 'intermediate',
  recommendedAfter: ['token-management'],
  modules: [
    {
      id: 'memory',
      title: 'Memory: CLAUDE.md',
      description: 'What every session starts with.',
      lessons: [
        { id: 'power-welcome', title: 'Welcome', type: 'explanation', component: Welcome, estimatedMinutes: 1 },
        { id: 'claude-md', title: 'CLAUDE.md: the memory every session starts with', type: 'explanation', component: Memory, estimatedMinutes: 2 },
        { id: 'claude-md-surgery', title: 'Editor: CLAUDE.md Surgery', type: 'editor', challenge: claudeMdChallenge, estimatedMinutes: 4 },
        { id: 'memory-quiz', title: 'Quick check', type: 'quiz', questions: memoryQuiz, estimatedMinutes: 1 },
      ],
    },
    {
      id: 'settings',
      title: 'settings.json and permissions',
      description: 'Layers, precedence and rules that hold.',
      lessons: [
        { id: 'settings-layers', title: 'Layers that decide what wins', type: 'explanation', component: Settings, estimatedMinutes: 2 },
        { id: 'who-wins', title: 'Who wins?', type: 'interactive', component: WhoWins, estimatedMinutes: 3 },
        { id: 'permission-puzzle', title: 'Editor: Permission Puzzle', type: 'editor', challenge: permissionPuzzleChallenge, estimatedMinutes: 5 },
      ],
    },
    {
      id: 'automation',
      title: 'Hooks and extension points',
      description: 'Guarantees, workflows and clean context.',
      lessons: [
        { id: 'hooks', title: 'Hooks: things that must happen every time', type: 'explanation', component: Hooks, estimatedMinutes: 2 },
        { id: 'hook-lab', title: 'Challenge: Hook Lab', type: 'challenge', challenge: hookLabChallenge, estimatedMinutes: 4 },
        { id: 'extension-points', title: 'Skills, subagents, MCP and output styles', type: 'explanation', component: ExtensionPoints, estimatedMinutes: 2 },
        { id: 'which-extension-point', title: 'Challenge: Which extension point?', type: 'challenge', challenge: extensionPointChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'models-context',
      title: 'Models and long sessions',
      description: 'Be your own router and keep the window clean.',
      lessons: [
        { id: 'you-are-the-router', title: 'You are the router', type: 'explanation', component: Models, estimatedMinutes: 1 },
        { id: 'route-the-session', title: 'Simulation: Route the session', type: 'challenge', challenge: routeSessionChallenge, estimatedMinutes: 3 },
        { id: 'long-sessions', title: 'Keeping long sessions sharp', type: 'explanation', component: Context, estimatedMinutes: 1 },
        { id: 'three-hour-session', title: 'Scenario: The three-hour session', type: 'challenge', challenge: longSessionChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'team-setup',
      title: 'Bring it together',
      description: 'A repo setup your whole team benefits from.',
      lessons: [
        { id: 'power-cheat-sheet', title: 'Cheat sheet', type: 'explanation', component: CheatSheet, estimatedMinutes: 1 },
        { id: 'team-setup', title: 'Final Challenge: set up the team repo', type: 'challenge', challenge: teamSetupChallenge, estimatedMinutes: 4 },
      ],
    },
  ],
}
