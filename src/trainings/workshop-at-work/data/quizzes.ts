import type { QuizQuestion } from '../../../engine/types'

export const llmQuiz: QuizQuestion[] = [
  {
    id: 'fluent',
    prompt: 'Claude gives you a confident, well-written figure for Meridian’s store count. What does that tell you?',
    options: [
      { id: 'a', label: 'It is correct, because Claude sounded sure' },
      { id: 'b', label: 'It is a likely-sounding figure. Check it against a source.' },
      { id: 'c', label: 'It must have looked it up' },
    ],
    correctOptionId: 'b',
    explanation: 'Fluent means likely, not checked. Unless you gave it the source, or it searched and cited one, verify the number.',
  },
  {
    id: 'context',
    prompt: 'Why does the same request get a much better answer inside a well-set-up project?',
    options: [
      { id: 'a', label: 'Projects use a smarter model' },
      { id: 'b', label: 'The instructions and files change what text is likely to come next' },
      { id: 'c', label: 'Claude tries harder in projects' },
    ],
    correctOptionId: 'b',
    explanation: 'Everything before your request shapes the prediction. Better context, better next words.',
  },
  {
    id: 'memory',
    prompt: 'You start a brand-new chat outside any project. What does Claude have to work with?',
    options: [
      { id: 'a', label: 'Everything you have ever told it' },
      { id: 'b', label: 'What is in this chat, plus whatever memory and settings you have switched on' },
      { id: 'c', label: 'All your files' },
    ],
    correctOptionId: 'b',
    explanation: 'The model itself remembers nothing between chats. What it sees is what is in the context: the chat, plus memory if it is on, plus project material if you are in a project.',
  },
]
