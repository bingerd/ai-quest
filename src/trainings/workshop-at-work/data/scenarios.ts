import type { Scenario } from '../../../simulation/scenario'

/**
 * Generic, policy-agnostic calls. The facilitator maps each one onto the firm's
 * own AI policy in the room; the app never states policy specifics.
 */
export const policyScenario: Scenario = {
  id: 'policy-calls',
  title: 'Policy calls',
  intro: 'Four moments from a normal week on the Meridian Retail engagement. Pick what you would do. Afterwards, check each call against your firm’s AI policy with the facilitator.',
  dimensions: [
    { id: 'client', label: 'Client trust', weight: 2 },
    { id: 'firm', label: 'Firm policy', weight: 2 },
    { id: 'delivery', label: 'Getting the work done', weight: 1 },
  ],
  decisions: [
    {
      id: 'personal-account',
      title: 'The personal account',
      situation: 'It is late. Your work laptop is in the office, but you have a personal AI subscription on your home computer. You want to summarise the client’s 40-page process review before tomorrow.',
      question: 'What do you do?',
      options: [
        {
          id: 'paste-personal',
          label: 'Paste the review into your personal account. It is faster.',
          outcome: { score: 5, consequence: 'Client material is now in an account your firm does not manage, under consumer terms you never checked for this purpose. If the client asks where their data went, you cannot answer cleanly.', dimensions: ['client', 'firm'], concept: 'accounts' },
        },
        {
          id: 'wait',
          label: 'Do it tomorrow on the firm-provided account.',
          outcome: { score: 90, consequence: 'You lose a few hours. The client’s data stays in tooling your firm has vetted and contracted for, which is what you told the client in the first place.', dimensions: ['client', 'firm', 'delivery'], concept: 'accounts' },
        },
        {
          id: 'strip',
          label: 'Rewrite the questions in general terms with no client details, and use the personal account for that.',
          outcome: { score: 55, consequence: 'Nothing confidential left your hands, and you got some generic help. Whether even this is allowed depends on your firm’s policy for personal tools, so check it.', dimensions: ['firm', 'delivery'], concept: 'accounts' },
        },
      ],
    },
    {
      id: 'client-tooling',
      title: 'The client has its own AI',
      situation: 'Vantage Bank gives you a login to its internal AI assistant and asks you to use it for all work on their data.',
      question: 'What do you do?',
      options: [
        {
          id: 'use-theirs',
          label: 'Use the client’s tool for their data, and keep firm material out of it.',
          outcome: { score: 95, consequence: 'Their data stays in their environment, under their rules. You do not upload your firm’s methods or other clients’ material into a system the client controls.', dimensions: ['client', 'firm', 'delivery'], concept: 'client-use' },
        },
        {
          id: 'use-ours',
          label: 'Keep using your firm’s tool. It is better.',
          outcome: { score: 20, consequence: 'The client set a clear rule for their data and you ignored it. Even if your tool is approved by your firm, the client decides where their data goes.', dimensions: ['client'], concept: 'client-use' },
        },
        {
          id: 'mix',
          label: 'Use both, and copy results between them when convenient.',
          outcome: { score: 35, consequence: 'Client data drifts into your firm’s tool and firm material drifts into theirs. Nobody can say any more which data lives where.', dimensions: ['client', 'firm'], concept: 'client-use' },
        },
      ],
    },
    {
      id: 'did-ai-write-this',
      title: '“Did AI write this?”',
      situation: 'The Northwind sponsor reads your summary and asks whether it was written by AI.',
      question: 'What do you say?',
      options: [
        {
          id: 'deny',
          label: '“No, I wrote it.”',
          outcome: { score: 0, consequence: 'It was drafted with AI. If that comes out later, the issue is no longer the summary, it is your honesty.', dimensions: ['client'], concept: 'transparency' },
        },
        {
          id: 'honest',
          label: '“I drafted it with an AI assistant on our approved tooling, then checked every figure and finding myself. I stand behind it.”',
          outcome: { score: 95, consequence: 'You are open about the tool and clear about who is accountable. Most sponsors care far more about the second part.', dimensions: ['client', 'firm'], concept: 'transparency' },
        },
        {
          id: 'deflect',
          label: '“Does it matter?”',
          outcome: { score: 25, consequence: 'It matters to them, or they would not have asked. Deflecting makes a simple question feel like a problem.', dimensions: ['client'], concept: 'transparency' },
        },
      ],
    },
    {
      id: 'internal-use',
      title: 'Internal work',
      situation: 'HR asks you to help shortlist candidates for an internal role. You have twelve CVs.',
      question: 'What do you do?',
      options: [
        {
          id: 'rank',
          label: 'Upload all twelve CVs and ask Claude to rank them.',
          outcome: { score: 10, consequence: 'An automated ranking of real people, on personal data shared for a different purpose. Decisions about people need a human making them, and many policies restrict exactly this.', dimensions: ['firm', 'client'], concept: 'people-data' },
        },
        {
          id: 'criteria',
          label: 'Ask Claude to help you write clear selection criteria and interview questions, then assess the CVs yourself.',
          outcome: { score: 95, consequence: 'You get faster, fairer criteria and no personal data leaves the HR system. The judgement about people stays with people.', dimensions: ['firm', 'delivery', 'client'], concept: 'people-data' },
        },
        {
          id: 'anonymise',
          label: 'Strip the names and then upload them for ranking.',
          outcome: { score: 40, consequence: 'Better, but CVs are hard to anonymise (employers, dates, schools), and the ranking is still automated. Check the policy before doing even this.', dimensions: ['firm'], concept: 'people-data' },
        },
      ],
    },
  ],
}

/** Mirrors the live four-round exercise: same requirement, more context each round. */
export const contextRoundsScenario: Scenario = {
  id: 'context-rounds',
  title: 'Four rounds, one requirement',
  intro:
    'The requirement: “Write the one-page status update for the Meridian Retail steering committee.” You will run it four times, each time with a better environment for Claude. Pick what you add in each round.',
  dimensions: [
    { id: 'quality', label: 'Output quality', weight: 2 },
    { id: 'reuse', label: 'Reusable next time', weight: 1 },
    { id: 'safety', label: 'Data safety', weight: 1 },
  ],
  decisions: [
    {
      id: 'round-1',
      title: 'Round 1: the bare request',
      situation: 'Fresh chat, no project. You only have the one-line requirement.',
      question: 'What do you send?',
      options: [
        {
          id: 'one-line',
          label: 'The one-line requirement, as written.',
          outcome: { score: 40, consequence: 'You get a generic, plausible status update with made-up milestones. Claude filled the gaps with what is likely, not what is true. Useful as a baseline.', dimensions: ['quality'], concept: 'context' },
        },
        {
          id: 'brief',
          label: 'The requirement plus audience, goal, length and the three facts that matter this month.',
          outcome: { score: 75, consequence: 'Much closer. The structure fits the committee and the facts are yours. But you typed all of that by hand, and you will type it again next month.', dimensions: ['quality'], concept: 'context' },
        },
        {
          id: 'dump',
          label: 'Paste in every email from the engagement this month.',
          outcome: { score: 30, consequence: 'Long, unfocused, and it quotes a side conversation about rates. More text is not more context: the signal got buried.', dimensions: ['quality', 'safety'], concept: 'pollution' },
        },
      ],
    },
    {
      id: 'round-2',
      title: 'Round 2: a project',
      situation: 'You create a project for the Meridian engagement.',
      question: 'What goes in it?',
      options: [
        {
          id: 'set-up',
          label: 'Instructions: audience, tone, one-page limit. Knowledge: the statement of work and last month’s update.',
          outcome: { score: 90, consequence: 'Every chat in the project now starts knowing who it writes for and what the engagement promised. This month’s update follows last month’s shape without you asking.', dimensions: ['quality', 'reuse'], concept: 'projects' },
        },
        {
          id: 'everything',
          label: 'Upload the whole engagement folder as knowledge, no instructions.',
          outcome: { score: 45, consequence: 'Claude can find facts, but it still guesses the audience and format. And the folder includes the team’s rate card, which had no reason to be there.', dimensions: ['quality', 'safety'], concept: 'projects' },
        },
        {
          id: 'instructions-only',
          label: 'Only instructions, no files.',
          outcome: { score: 60, consequence: 'Tone and length are right, but every fact still has to be pasted in each time.', dimensions: ['quality', 'reuse'], concept: 'projects' },
        },
      ],
    },
    {
      id: 'round-3',
      title: 'Round 3: conventions and design',
      situation: 'The content is right, but it does not look like your firm’s documents.',
      question: 'What do you add?',
      options: [
        {
          id: 'design-system',
          label: 'Start from the firm’s template or design system, and add the house style rules to the project instructions.',
          outcome: { score: 90, consequence: 'The update comes out on brand, with the firm’s headings and colours, every time. Nobody restyles anything by hand.', dimensions: ['quality', 'reuse'], concept: 'design-system' },
        },
        {
          id: 'describe',
          label: 'Describe the colours and fonts in the chat this time.',
          outcome: { score: 50, consequence: 'This one looks right. Next month you will have to describe them again, and someone else on the team will describe them differently.', dimensions: ['quality'], concept: 'design-system' },
        },
        {
          id: 'manual',
          label: 'Fix the formatting yourself afterwards.',
          outcome: { score: 30, consequence: 'Twenty minutes of formatting, every month, for every person on the team.', dimensions: ['reuse'], concept: 'design-system' },
        },
      ],
    },
    {
      id: 'round-4',
      title: 'Round 4: make it reusable',
      situation: 'Three other account teams want the same kind of update for their clients.',
      question: 'How do you share what works?',
      options: [
        {
          id: 'skill',
          label: 'Package the steps, checks and template as a skill the other teams can use with their own client projects.',
          outcome: { score: 95, consequence: 'The method travels; each team’s client data stays in its own project. When you improve the skill, everyone gets the improvement.', dimensions: ['reuse', 'quality', 'safety'], concept: 'skills' },
        },
        {
          id: 'share-project',
          label: 'Share your Meridian project with them.',
          outcome: { score: 25, consequence: 'They get your method, and also Meridian’s statement of work and status history. The method should travel; the client data should not.', dimensions: ['safety', 'reuse'], concept: 'skills' },
        },
        {
          id: 'email-prompt',
          label: 'Email them your best prompt.',
          outcome: { score: 55, consequence: 'It helps for a week. Then everyone edits their own copy and you have five versions of “the prompt”.', dimensions: ['reuse'], concept: 'skills' },
        },
      ],
    },
  ],
}
