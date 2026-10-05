import type { NextTokenTable } from '../../../simulation/nextToken'

export const nextTokenPrompt = 'Thank you for your'
export const nextTokenStart = 'start'

/** Hand-written teaching probabilities. Not taken from any model. */
export const nextTokenTable: NextTokenTable = {
  start: [
    { token: ' patience', p: 0.34, next: 'patience' },
    { token: ' email', p: 0.27, next: 'email' },
    { token: ' time', p: 0.21, next: 'time' },
    { token: ' proposal', p: 0.12, next: 'proposal' },
    { token: ' giraffe', p: 0.01, next: 'giraffe' },
  ],
  patience: [
    { token: ' while', p: 0.52, next: 'while' },
    { token: '.', p: 0.31 },
    { token: ' and understanding.', p: 0.17 },
  ],
  while: [
    { token: ' we finalise the report.', p: 0.58 },
    { token: ' we look into this.', p: 0.37 },
    { token: ' I finish my lunch.', p: 0.05 },
  ],
  email: [
    { token: '.', p: 0.55 },
    { token: ' about the steering deck.', p: 0.33 },
    { token: ' from 2019.', p: 0.12 },
  ],
  time: [
    { token: ' yesterday.', p: 0.48 },
    { token: ' and input.', p: 0.4 },
    { token: ' machine.', p: 0.12 },
  ],
  proposal: [
    { token: ', which we have reviewed.', p: 0.61 },
    { token: '. We accept it.', p: 0.39 },
  ],
  giraffe: [
    { token: ', which arrived safely.', p: 0.7 },
    { token: '.', p: 0.3 },
  ],
}
