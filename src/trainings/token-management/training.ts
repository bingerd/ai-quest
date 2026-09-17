import type { Training } from '../../engine/types'
import Welcome from './lessons/00-welcome.mdx'
import WhatIsAnLlm from './lessons/01-what-is-an-llm.mdx'
import WhatIsAToken from './lessons/02-what-is-a-token.mdx'
import WhatIsAContextWindow from './lessons/03-context-window.mdx'
import ContextPollution from './lessons/04-context-pollution.mdx'
import Models from './lessons/05-models.mdx'
import ToolsAndRetrieval from './lessons/06-tools-and-retrieval.mdx'
import Enterprise from './lessons/07-enterprise.mdx'
import { RetrievalLab } from './lessons/RetrievalLab'
import { ScaleCalculator } from './lessons/ScaleCalculator'
import { InteractiveContextWindow } from './lessons/InteractiveContextWindow'
import { TokenVisualizer } from './lessons/TokenVisualizer'
import { foundationsQuiz } from './data/quizzes'
import { contextSurgeonChallenge, tokenHeistChallenge } from './challenges/contextChallenges'
import { modelSelectionChallenge } from './challenges/modelSelectionDefinition'
import { promptSurgeryChallenge } from './challenges/promptSurgeryDefinition'
import { enterpriseChallenge } from './challenges/enterpriseDefinition'
import { finalChallenge } from './challenges/finalDefinition'

export const tokenManagementTraining: Training = {
  id: 'token-management',
  title: 'Token & Context Management',
  tagline: 'Foundations',
  description:
    'Learn what tokens and context windows are, why more context is not always better, and how to choose the right model for the job. Hands-on, fully simulated.',
  estimatedMinutes: 20,
  audience: 'everyone',
  level: 'beginner',
  modules: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'Tokens, models and the language of AI budgets.',
      lessons: [
        { id: 'welcome', title: 'Welcome to AI Quest', type: 'explanation', component: Welcome, estimatedMinutes: 1 },
        { id: 'what-is-an-llm', title: 'What is an LLM?', type: 'explanation', component: WhatIsAnLlm, estimatedMinutes: 2 },
        { id: 'what-is-a-token', title: 'What is a token?', type: 'explanation', component: WhatIsAToken, estimatedMinutes: 2 },
        { id: 'token-visualizer', title: 'Token visualizer', type: 'interactive', component: TokenVisualizer, estimatedMinutes: 2 },
        { id: 'foundations-quiz', title: 'Quick check', type: 'quiz', questions: foundationsQuiz, estimatedMinutes: 1 },
      ],
    },
    {
      id: 'context',
      title: 'The context window',
      description: 'Where everything you send has to fit.',
      lessons: [
        { id: 'what-is-a-context-window', title: 'What is a context window?', type: 'explanation', component: WhatIsAContextWindow, estimatedMinutes: 2 },
        { id: 'interactive-context-window', title: 'Make it fit', type: 'interactive', component: InteractiveContextWindow, estimatedMinutes: 2 },
        { id: 'context-pollution', title: 'Pollution, repetition and caching', type: 'explanation', component: ContextPollution, estimatedMinutes: 2 },
        { id: 'context-surgeon', title: 'Challenge: Context Surgeon', type: 'challenge', challenge: contextSurgeonChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'budgets',
      title: 'Budgets',
      description: 'Choosing what goes in when you cannot have everything.',
      lessons: [
        { id: 'token-heist', title: 'Challenge: Token Heist', type: 'challenge', challenge: tokenHeistChallenge, estimatedMinutes: 4 },
        { id: 'scale-calculator', title: 'Why efficiency matters at scale', type: 'interactive', component: ScaleCalculator, estimatedMinutes: 2 },
        { id: 'prompt-surgery', title: 'Editor: Prompt Surgery', type: 'editor', challenge: promptSurgeryChallenge, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'models-and-tools',
      title: 'Models and tools',
      description: 'Choosing the engine, and what tools do to your context.',
      lessons: [
        { id: 'models', title: 'Match the tool to the task', type: 'explanation', component: Models, estimatedMinutes: 1 },
        { id: 'model-selection', title: 'Simulation: Model Selection', type: 'challenge', challenge: modelSelectionChallenge, estimatedMinutes: 4 },
        { id: 'tools-and-retrieval', title: 'Tools and retrieval grow context', type: 'explanation', component: ToolsAndRetrieval, estimatedMinutes: 1 },
        { id: 'retrieval-lab', title: 'Retrieval lab', type: 'interactive', component: RetrievalLab, estimatedMinutes: 3 },
      ],
    },
    {
      id: 'enterprise',
      title: 'Enterprise scale',
      description: 'The same ideas as policy, then the final mission.',
      lessons: [
        { id: 'enterprise', title: 'From one prompt to five thousand people', type: 'explanation', component: Enterprise, estimatedMinutes: 1 },
        { id: 'enterprise-scenario', title: 'Scenario: AI Adoption Lead', type: 'challenge', challenge: enterpriseChallenge, estimatedMinutes: 4 },
        { id: 'final-challenge', title: 'Final Challenge', type: 'challenge', challenge: finalChallenge, estimatedMinutes: 5 },
      ],
    },
  ],
}
