import type { SortBucket, SortItem } from '../../../simulation/sorting'

export const placeBuckets: SortBucket[] = [
  { id: 'knowledge', label: 'Project knowledge', description: 'Reference files you reuse' },
  { id: 'instructions', label: 'Project instructions', description: 'How Claude should always work here' },
  { id: 'chat', label: 'Just this chat', description: 'One-off questions and files' },
  { id: 'never', label: 'Don’t share', description: 'Should not go into Claude at all' },
]

export const placeItems: SortItem[] = [
  { id: 'brand', label: 'Brand guidelines PDF', detail: 'Used for every deck you make', correctBucket: 'knowledge', explanation: 'A reference document you need again and again belongs in project knowledge, so you never re-upload it.' },
  { id: 'british', label: '"Always use British English and one message per slide."', correctBucket: 'instructions', explanation: 'A rule for how Claude should work every time is an instruction, not a document.' },
  { id: 'template-report', label: 'Last quarter’s report', detail: 'The example every new quarterly report should follow', correctBucket: 'knowledge', acceptable: ['chat'], explanation: 'You reuse it every quarter, so keep it in the project. Uploading it once to a chat works but you will be uploading it again next quarter.' },
  { id: 'synonym', label: '"What’s a good synonym for ‘robust’?"', correctBucket: 'chat', explanation: 'A quick one-off question needs no setup at all.' },
  { id: 'salaries', label: 'Spreadsheet of colleagues’ salaries and home addresses', correctBucket: 'never', explanation: 'Personal data that the task does not need never goes in, in any workspace.' },
  { id: 'audience', label: '"Our audience is non-technical managers. Avoid jargon."', correctBucket: 'instructions', explanation: 'Who you are writing for applies to every conversation in the project: an instruction.' },
  { id: 'survey', label: 'This year’s customer survey results', detail: 'For the project you work on all quarter', correctBucket: 'knowledge', explanation: 'Material you draw on for weeks belongs in the project.' },
  { id: 'reformat', label: 'A table you need reformatted once', correctBucket: 'chat', explanation: 'A single task with a single file: paste it into a chat and move on.' },
  { id: 'passwords', label: 'An export of your password manager', correctBucket: 'never', explanation: 'Credentials never belong in any AI tool, no matter what you want to do with them.' },
]
