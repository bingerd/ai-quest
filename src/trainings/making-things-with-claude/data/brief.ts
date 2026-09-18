import type { BriefSpec } from '../../../simulation/brief'

/**
 * A one-page decision memo to an engagement partner, briefed bottom-line-first.
 * BLUF is a writing convention, not a Claude feature.
 */
export const decisionMemoBrief: BriefSpec = {
  passScore: 70,
  blocks: [
    {
      id: 'bottomline',
      label: 'The bottom line',
      weight: 3,
      concept: 'bluf',
      options: [
        { id: 'none', text: 'Write a memo about the Meridian extension.', quality: 'missing' },
        { id: 'topic', text: 'Write a memo reviewing our options on the Meridian extension.', quality: 'weak' },
        { id: 'recommend', text: 'Write a memo recommending we extend the Meridian engagement for two quarters with a team of four, rather than rolling it one quarter at a time, and open with that recommendation in the first sentence.', quality: 'strong' },
      ],
      strong: ['The reader knows the answer in one line', 'Bottom line up front means the first sentence is the recommendation. Everything after it is support, and a partner between meetings can stop whenever they are convinced.'],
      weak: ['"Reviewing our options" defers the decision', 'A memo that surveys without recommending pushes the work back onto the reader. You are closer to this account than they are — say what you think, then defend it.'],
      missing: ['No position at all', 'Without a recommendation you get a description of the engagement, which the partner already has.'],
    },
    {
      id: 'decider',
      label: 'Who decides',
      weight: 2,
      concept: 'audience',
      options: [
        { id: 'none', text: '', quality: 'missing' },
        { id: 'general', text: 'It is for management.', quality: 'weak' },
        { id: 'named', text: 'The reader is the engagement partner, who signs it off alone, knows the client well and has not seen the margin modelling.', quality: 'strong' },
      ],
      strong: ['Pitched at the person holding the pen', 'Knowing what the decider already knows tells you what to cut and what to explain. The partner needs no introduction to Meridian; they need the numbers.'],
      weak: ['"Management" is not a reader', 'Name the person or the role that signs. A partner signing alone and a resourcing committee need different memos.'],
      missing: ['No reader in mind', 'The same facts make a very different memo for a partner, a resourcing lead or the client.'],
    },
    {
      id: 'evidence',
      label: 'Evidence',
      weight: 3,
      concept: 'evidence',
      options: [
        { id: 'none', text: '', quality: 'missing' },
        { id: 'vague', text: 'Use our account data.', quality: 'weak' },
        { id: 'sourced', text: 'Use the attached Q3 delivery review and the two staffing options. Cite the file and page for every figure, and say so explicitly where a number is not in the sources.', quality: 'strong' },
      ],
      strong: ['Every number can be traced', 'Asking for citations up front is what stops a confident-sounding margin figure that came from nowhere. Asking it to flag gaps is what surfaces the ones it could not find.'],
      weak: ['"Our account data" is not a source', 'Name the files. Otherwise you cannot tell which numbers came from them and which were filled in.'],
      missing: ['No sources named', 'A memo full of unattributed numbers takes longer to check than it took to write, and the partner will check.'],
    },
    {
      id: 'shape',
      label: 'Length and shape',
      weight: 2,
      concept: 'shape',
      options: [
        { id: 'none', text: '', quality: 'missing' },
        { id: 'short', text: 'Keep it short.', quality: 'weak' },
        { id: 'onepage', text: 'One page: recommendation, three supporting points with the numbers, the main risk and what happens if we do nothing. No executive summary, because the first line is the summary.', quality: 'strong' },
      ],
      strong: ['A shape the reader can scan', 'Naming the sections gets you the structure you wanted instead of an essay you have to restructure.'],
      weak: ['"Short" is not a length', 'Short means different things to different people. A page, three points, a risk.'],
      missing: ['No shape', 'Left to guess, you tend to get headings and padding you will delete.'],
    },
    {
      id: 'ask',
      label: 'The ask',
      weight: 2,
      concept: 'ask',
      options: [
        { id: 'none', text: '', quality: 'missing' },
        { id: 'implicit', text: 'End with next steps.', quality: 'weak' },
        { id: 'explicit', text: 'End with exactly what is needed from the reader: a yes or no on the two-quarter extension by 30 October, and who signs the change order.', quality: 'strong' },
      ],
      strong: ['The reader knows what to do', 'A decision memo that does not say what it needs becomes a document people agree with and then file, while the team rolls onto another month of uncertainty.'],
      weak: ['"Next steps" is where memos go to die', 'Say who does what, by when.'],
      missing: ['No ask', 'Without one, the memo informs and nothing moves.'],
    },
  ],
  outline: {
    generic: ['Introduction', 'Background on the Meridian engagement', 'Options considered', 'Analysis', 'Conclusion', 'Next steps'],
    partial: [
      'Meridian extension: recommendation',
      'Background and current position',
      'Option A: roll one quarter at a time',
      'Option B: two-quarter extension',
      'Costs and risks',
      'Recommendation and next steps',
    ],
    specific: [
      'Recommend: extend Meridian for two quarters with a team of four, signed by 30 October.',
      'Two quarters is €180k better on margin than rolling monthly (delivery review, p.4).',
      'Rolling renewals repriced the rate card twice this year (staffing option B, p.2).',
      'The team is 94% utilised, so a smaller team means declining scope, not saving cost (p.7).',
      'Main risk: a two-quarter commitment if the client pauses — break clause at one quarter covers it.',
      'Do nothing and we lose two of the four consultants to other accounts in November.',
      'Needed from you: yes or no on the two-quarter extension by 30 October.',
    ],
  },
}
