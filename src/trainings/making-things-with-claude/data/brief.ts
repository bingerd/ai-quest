import type { BriefSpec } from '../../../simulation/brief'

/**
 * A one-page decision memo, briefed bottom-line-first.
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
        { id: 'none', text: 'Write a memo about the warehouse contract.', quality: 'missing' },
        { id: 'topic', text: 'Write a memo reviewing our options on the warehouse contract.', quality: 'weak' },
        { id: 'recommend', text: 'Write a memo recommending we renew the Rotterdam warehouse contract for two years rather than one, and open with that recommendation in the first sentence.', quality: 'strong' },
      ],
      strong: ['The reader knows the answer in one line', 'Bottom line up front means the first sentence is the recommendation. Everything after it is support, and a busy reader can stop whenever they are convinced.'],
      weak: ['"Reviewing our options" defers the decision', 'A memo that surveys without recommending pushes the work back onto the reader. Say what you think, then defend it.'],
      missing: ['No position at all', 'Without a recommendation you get a description of the situation, which the reader already has.'],
    },
    {
      id: 'decider',
      label: 'Who decides',
      weight: 2,
      concept: 'audience',
      options: [
        { id: 'none', text: '', quality: 'missing' },
        { id: 'general', text: 'It is for management.', quality: 'weak' },
        { id: 'named', text: 'The reader is the COO, who signs it off alone, knows the site well and has not seen the cost modelling.', quality: 'strong' },
      ],
      strong: ['Pitched at the person holding the pen', 'Knowing what the decider already knows tells you what to cut and what to explain.'],
      weak: ['"Management" is not a reader', 'Name the person or the role that signs. One decider and a committee need different memos.'],
      missing: ['No reader in mind', 'The same facts make a very different memo for a COO, a finance team or a supplier.'],
    },
    {
      id: 'evidence',
      label: 'Evidence',
      weight: 3,
      concept: 'evidence',
      options: [
        { id: 'none', text: '', quality: 'missing' },
        { id: 'vague', text: 'Use our warehouse data.', quality: 'weak' },
        { id: 'sourced', text: 'Use the attached 2025 logistics costs and the two supplier quotes. Cite the file and page for every figure, and say so explicitly where a number is not in the sources.', quality: 'strong' },
      ],
      strong: ['Every number can be traced', 'Asking for citations up front is what stops a confident-sounding figure that came from nowhere. Asking it to flag gaps is what surfaces the ones it could not find.'],
      weak: ['"Our data" is not a source', 'Name the files. Otherwise you cannot tell which numbers came from them and which were filled in.'],
      missing: ['No sources named', 'A memo full of unattributed numbers takes longer to check than it took to write.'],
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
        { id: 'explicit', text: 'End with exactly what is needed from the reader: a yes or no on the two-year term by 30 October, and who signs.', quality: 'strong' },
      ],
      strong: ['The reader knows what to do', 'A decision memo that does not say what it needs becomes a document people agree with and then file.'],
      weak: ['"Next steps" is where memos go to die', 'Say who does what, by when.'],
      missing: ['No ask', 'Without one, the memo informs and nothing moves.'],
    },
  ],
  outline: {
    generic: ['Introduction', 'Background on the warehouse contract', 'Options considered', 'Analysis', 'Conclusion', 'Next steps'],
    partial: [
      'Warehouse contract: recommendation',
      'Background and current position',
      'Option A: one-year renewal',
      'Option B: two-year renewal',
      'Costs and risks',
      'Recommendation and next steps',
    ],
    specific: [
      'Recommend: renew Rotterdam for two years, signed by 30 October.',
      'Two years is €180k cheaper over the term (2025 logistics costs, p.4).',
      'The one-year quote reprices in a rising market (supplier quote B, p.2).',
      'We use 94% of the floor space, so downsizing is not on the table (p.7).',
      'Main risk: a two-year term if the Antwerp move goes ahead — break clause at 12 months covers it.',
      'Do nothing and we roll onto monthly terms at a 15% premium.',
      'Needed from you: yes or no on the two-year term by 30 October.',
    ],
  },
}
