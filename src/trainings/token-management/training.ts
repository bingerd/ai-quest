import type { Training } from '../../engine/types'
import Welcome from './lessons/00-welcome.mdx'

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
      lessons: [{ id: 'welcome', title: 'Welcome to AI Quest', type: 'explanation', component: Welcome }],
    },
  ],
}
