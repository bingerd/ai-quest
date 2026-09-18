import type { SortBucket, SortItem } from '../../../simulation/sorting'

/* Action titles: does the title carry the message, or just name the subject? */

export const titleBuckets: SortBucket[] = [
  { id: 'action', label: 'Action title', description: 'States the message. A reader could skim only the titles and get the argument.' },
  { id: 'topic', label: 'Topic label', description: 'Names the subject and stops. True of any slide on that subject.' },
  { id: 'unsupported', label: 'Claim with nothing behind it', description: 'Makes an assertion the slide cannot evidence.' },
]

export const titleItems: SortItem[] = [
  { id: 't-churn', label: 'Adoption stalled at 61% in Q3, concentrated in one business unit', correctBucket: 'action', explanation: 'A number, a direction and where it sits. The slide only has to show the workings.' },
  { id: 't-overview', label: 'Q3 engagement overview', correctBucket: 'topic', explanation: 'Could sit on top of any slide in the deck. It asks the reader to work out the point themselves.' },
  { id: 't-best', label: 'Our delivery is best in class', correctBucket: 'unsupported', explanation: 'Best against whom? Without a benchmark on the slide this is marketing, and the first client who asks will derail the meeting.' },
  { id: 't-pipeline', label: 'Benefits tracking', correctBucket: 'topic', explanation: 'A subject. Compare with "Benefits are tracking at 2.1x the programme cost, ahead of the 1.5x business case".' },
  { id: 't-owners', label: 'Naming a client owner per unit cut sign-off time from 9 days to 2', correctBucket: 'action', explanation: 'Cause and effect with both numbers present. This is the kind of title a reader remembers.' },
  { id: 't-transform', label: 'This will transform how we work', correctBucket: 'unsupported', explanation: 'Nothing on a slide can support "transform". Vague superlatives read as filler and invite scepticism about the rest.' },
  { id: 't-budget', label: 'Phase two request', correctBucket: 'topic', explanation: 'Name the ask instead: "Phase two needs a team of four from January to cover the third business unit".' },
  { id: 't-three', label: 'Two of three business units are live; the third has not started', correctBucket: 'action', explanation: 'Says the good and the bad in one line, so the client trusts you before the detail arrives.' },
  { id: 't-leader', label: 'We are the clear partner of choice in this sector', correctBucket: 'unsupported', explanation: 'A claim that needs a market-share figure and a source. Without one, cut it — a client buying from you will notice.' },
]

/* The fact-check pass: reading a draft and deciding what can actually go out. */

export const claimBuckets: SortBucket[] = [
  { id: 'publish', label: 'Publish as is', description: 'Verifiable from what you already have, or clearly framed as an opinion.' },
  { id: 'source', label: 'Needs a source first', description: 'Might be true. You cannot show that it is.' },
  { id: 'never', label: 'Never publish', description: 'Personal data, or something you know to be wrong.' },
]

export const claimItems: SortItem[] = [
  { id: 'c-revenue', label: '"Revenue grew 12% year on year." The figure is in the client’s finance export you attached.', correctBucket: 'publish', explanation: 'Traceable to a document you can point at in the room. That is the standard.' },
  { id: 'c-industry', label: '"Industry churn averages 7%." No source given.', correctBucket: 'source', explanation: 'A plausible number with no origin is the most dangerous kind. Plausible means nobody challenges it until it is in front of a client.' },
  { id: 'c-name', label: '"The client\u2019s finance lead has missed three deadlines this quarter."', correctBucket: 'never', explanation: 'A named individual’s performance does not belong in a circulated pack, and least of all when they work for the client. Raise it with your engagement partner, who can take it to their sponsor privately.' },
  { id: 'c-believe', label: '"We believe the third business unit is where the next year of benefits sits."', correctBucket: 'publish', explanation: 'Framed as a judgement, and honest about it. Opinions are fine when they are labelled as opinions.' },
  { id: 'c-competitor', label: '"The client\u2019s main competitor is already doing this at scale."', correctBucket: 'source', explanation: 'A claim about a third party’s business needs a citation, or it is gossip with a slide number on it — and the client may know the truth better than you do.' },
  { id: 'c-salary', label: 'A table of individual consultant day rates, pasted in to explain the cost base.', correctBucket: 'never', explanation: 'The cost base can be shown as a blended rate or a total. What each named person earns never needs to leave your firm to make that point.' },
  { id: 'c-sample', label: '"87% of surveyed users are satisfied." The survey had 11 respondents.', correctBucket: 'source', explanation: 'The number is real and still misleading. Either state the sample size next to it or leave it out.' },
  { id: 'c-target', label: '"We missed the Q3 milestone by six weeks." Matches the date in the client\u2019s own programme report.', correctBucket: 'publish', explanation: 'Bad news that reconciles with the client’s own reporting. Including it is what makes the good news believable.' },
]
