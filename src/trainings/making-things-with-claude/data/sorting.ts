import type { SortBucket, SortItem } from '../../../simulation/sorting'

/* Action titles: does the title carry the message, or just name the subject? */

export const titleBuckets: SortBucket[] = [
  { id: 'action', label: 'Action title', description: 'States the message. A reader could skim only the titles and get the argument.' },
  { id: 'topic', label: 'Topic label', description: 'Names the subject and stops. True of any slide on that subject.' },
  { id: 'unsupported', label: 'Claim with nothing behind it', description: 'Makes an assertion the slide cannot evidence.' },
]

export const titleItems: SortItem[] = [
  { id: 't-churn', label: 'Churn rose to 9% in Q3, concentrated in two accounts', correctBucket: 'action', explanation: 'A number, a direction and where it came from. The slide only has to show the workings.' },
  { id: 't-overview', label: 'Q3 overview', correctBucket: 'topic', explanation: 'Could sit on top of any slide in the deck. It asks the reader to work out the point themselves.' },
  { id: 't-best', label: 'Our retention is best in class', correctBucket: 'unsupported', explanation: 'Best against whom? Without a benchmark on the slide this is an opinion, and the first person to ask will derail the meeting.' },
  { id: 't-pipeline', label: 'Pipeline coverage', correctBucket: 'topic', explanation: 'A subject. Compare with "Pipeline covers 2.1x of target, below the 3x we plan against".' },
  { id: 't-owners', label: 'Naming account owners cut response time from 9 days to 2', correctBucket: 'action', explanation: 'Cause and effect with both numbers present. This is the kind of title a reader remembers.' },
  { id: 't-transform', label: 'This will transform how we work', correctBucket: 'unsupported', explanation: 'Nothing on a slide can support "transform". Vague superlatives read as filler and invite scepticism about the rest.' },
  { id: 't-budget', label: 'Budget request', correctBucket: 'topic', explanation: 'Name the ask instead: "We need £400k to cover two account managers through Q1".' },
  { id: 't-three', label: 'Three of five regions beat target; EMEA missed by 12%', correctBucket: 'action', explanation: 'Says the good and the bad in one line, so the reader trusts you before the detail arrives.' },
  { id: 't-leader', label: 'We are the clear market leader', correctBucket: 'unsupported', explanation: 'A claim that needs a market-share figure and a source. Without one, cut it — a board will notice.' },
]

/* The fact-check pass: reading a draft and deciding what can actually go out. */

export const claimBuckets: SortBucket[] = [
  { id: 'publish', label: 'Publish as is', description: 'Verifiable from what you already have, or clearly framed as an opinion.' },
  { id: 'source', label: 'Needs a source first', description: 'Might be true. You cannot show that it is.' },
  { id: 'never', label: 'Never publish', description: 'Personal data, or something you know to be wrong.' },
]

export const claimItems: SortItem[] = [
  { id: 'c-revenue', label: '"Revenue grew 12% year on year." The figure is in the finance export you attached.', correctBucket: 'publish', explanation: 'Traceable to a document you can point at. That is the standard.' },
  { id: 'c-industry', label: '"Industry churn averages 7%." No source given.', correctBucket: 'source', explanation: 'A plausible number with no origin is the most dangerous kind. Plausible means nobody challenges it until it is in front of a client.' },
  { id: 'c-name', label: '"Sarah in Accounts has missed three deadlines this quarter."', correctBucket: 'never', explanation: 'A named individual’s performance does not belong in a circulated report. Take it to their manager, not the board pack.' },
  { id: 'c-believe', label: '"We believe the mid-market segment is where the next year of growth sits."', correctBucket: 'publish', explanation: 'Framed as a judgement, and honest about it. Opinions are fine when they are labelled as opinions.' },
  { id: 'c-competitor', label: '"Our main competitor is losing customers fast."', correctBucket: 'source', explanation: 'A claim about someone else’s business needs a citation, or it is gossip with a slide number on it.' },
  { id: 'c-salary', label: 'A table of individual salaries, pasted in to explain the cost base.', correctBucket: 'never', explanation: 'The cost base can be shown as a total. Individual pay never needs to leave HR to make that point.' },
  { id: 'c-sample', label: '"87% of surveyed customers are satisfied." The survey had 11 respondents.', correctBucket: 'source', explanation: 'The number is real and still misleading. Either state the sample size next to it or leave it out.' },
  { id: 'c-target', label: '"We missed the Q3 target by £1.2m." Matches the figure in the board pack.', correctBucket: 'publish', explanation: 'Bad news that reconciles with the official number. Including it is what makes the good news believable.' },
]
