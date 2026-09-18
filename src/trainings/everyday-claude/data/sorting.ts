import type { SortBucket, SortItem } from '../../../simulation/sorting'

export const placeBuckets: SortBucket[] = [
  { id: 'knowledge', label: 'Project knowledge', description: 'Reference files you reuse' },
  { id: 'instructions', label: 'Project instructions', description: 'How Claude should always work here' },
  { id: 'chat', label: 'Just this chat', description: 'One-off questions and files' },
  { id: 'never', label: 'Don’t share', description: 'Should not go into Claude at all' },
]

export const placeItems: SortItem[] = [
  { id: 'brand', label: 'The firm’s deck template and brand guidelines', detail: 'Used for every deck you make, on every account', correctBucket: 'knowledge', explanation: 'A reference document you need again and again belongs in project knowledge, so you never re-upload it.' },
  { id: 'british', label: '"Always use British English and one message per slide."', correctBucket: 'instructions', explanation: 'A rule for how Claude should work every time is an instruction, not a document.' },
  { id: 'template-report', label: 'Last quarter’s steering report for this client', detail: 'The example every new steering report should follow', correctBucket: 'knowledge', acceptable: ['chat'], explanation: 'You reuse it every quarter the engagement runs, so keep it in the project. Uploading it once to a chat works but you will be uploading it again next quarter.' },
  { id: 'synonym', label: '"What’s a good synonym for ‘robust’?"', correctBucket: 'chat', explanation: 'A quick one-off question needs no setup at all.' },
  { id: 'salaries', label: 'Candidate CVs and interview scorecards from last week', correctBucket: 'never', explanation: 'Personal data about identifiable people, gathered for a different purpose, never goes in. Recruiting data belongs in the system your firm vetted for it.' },
  { id: 'audience', label: '"Our audience is the client’s non-technical sponsors. Avoid jargon."', correctBucket: 'instructions', explanation: 'Who you are writing for applies to every conversation on this account: an instruction.' },
  { id: 'survey', label: 'This year’s client satisfaction survey', detail: 'For the account you work on all quarter', correctBucket: 'knowledge', explanation: 'Material you draw on for weeks belongs in the project.' },
  { id: 'reformat', label: 'A table you need reformatted once', correctBucket: 'chat', explanation: 'A single task with a single file: paste it into a chat and move on.' },
  { id: 'passwords', label: 'An export of your password manager', correctBucket: 'never', explanation: 'Credentials never belong in any AI tool, no matter what you want to do with them. That goes double for a client system’s credentials.' },
]
