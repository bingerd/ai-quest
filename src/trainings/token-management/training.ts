import type { Training } from '../../engine/types'
import Welcome from './lessons/00-welcome.mdx'
import WhatIsAnLlm from './lessons/01-what-is-an-llm.mdx'
import WhatIsAToken from './lessons/02-what-is-a-token.mdx'
import WhatIsAContextWindow from './lessons/03-context-window.mdx'
import ContextPollution from './lessons/04-context-pollution.mdx'
import { InteractiveContextWindow } from './lessons/InteractiveContextWindow'
import { TokenVisualizer } from './lessons/TokenVisualizer'
import { foundationsQuiz } from './data/quizzes'

export const tokenManagementTraining: Training = {
  id: 'token-management',
  title: 'Token & Context Management',
  tagline: 'Foundations',
  description:
    'Learn what tokens and context windows are, why more context is not always better, and how to choose the right model for the job. Hands-on, fully simulated.',
  estimatedMinutes: 20,
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
      ],
    },
  ],
}
