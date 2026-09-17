import type { PromptExercise } from '../../../simulation/promptEvaluator'

export const promptOriginal = `SYSTEM
You are a helpful assistant.
Always be helpful and answer the question.
You are a helpful assistant.

CONTEXT
[Q3 regional revenue table]
[Entire employee handbook, 120 pages]
[Full Q1-Q3 sales spreadsheet export]
[Every Slack message from #sales this year]
Analyst BI login password: hunter2

TASK
Answer the user's question.
`

export const promptExercise: PromptExercise = {
  irrelevantMarkers: ['[Entire employee handbook, 120 pages]', '[Full Q1-Q3 sales spreadsheet export]', '[Every Slack message from #sales this year]'],
  requiredMarkers: ['[Q3 regional revenue table]'],
  originalText: promptOriginal,
}

export const promptUserQuestion = 'What was Q3 revenue in EMEA, and how did it compare with the target?'
