import type { Scenario } from '../../../simulation/scenario'

export const enterpriseScenario: Scenario = {
  id: 'ai-adoption-lead',
  title: 'AI Adoption Lead',
  intro:
    'You are responsible for AI adoption in a 5,000-person organisation. Four situations land on your desk this week. Each decision has consequences for cost, quality, security and governance.',
  dimensions: [
    { id: 'cost', label: 'Cost control', weight: 2 },
    { id: 'quality', label: 'Quality', weight: 2 },
    { id: 'security', label: 'Security', weight: 2 },
    { id: 'governance', label: 'Governance', weight: 1 },
  ],
  decisions: [
    {
      id: 'database-paste',
      title: 'The database paste',
      situation:
        'An analyst exported the entire customer database (400,000 rows) and pasted it into the AI assistant to ask which customers are at risk of churn. The request failed, so they tried again with half the data.',
      question: 'What do you do?',
      options: [
        {
          id: 'block',
          label: 'Block AI assistants company-wide until legal signs off',
          detail: 'Nobody can paste anything if nobody can use it.',
          outcome: {
            score: 35,
            consequence:
              'Usage moves to personal accounts on personal devices, where you have no visibility at all. Three weeks later, a customer list turns up in a consumer chatbot history. Meanwhile, 5,000 people lose a tool that was saving them hours.',
            dimensions: ['security', 'governance', 'quality'],
            concept: 'governance',
          },
        },
        {
          id: 'guide',
          label: 'Set a data-classification rule and show the analyst a better way',
          detail: 'Aggregate first, use the approved connector, ask the question on a sample.',
          outcome: {
            score: 92,
            consequence:
              'The analyst runs the churn query in the warehouse, sends a 2,000-token summary table to the assistant and gets a better answer in one turn. The rule ("no raw customer data in prompts, use approved connectors") goes into onboarding. Cost and risk both drop.',
            dimensions: ['security', 'governance', 'cost', 'quality'],
            concept: 'context-pollution',
          },
        },
        {
          id: 'ignore',
          label: 'Let it go, the assistant is an enterprise product',
          detail: 'Enterprise terms mean the data is not used for training.',
          outcome: {
            score: 15,
            consequence:
              'Not training on data is not the same as being allowed to send it. Data protection flags the transfer, and the half-database prompts cost more than the analyst’s monthly licence each, for answers that were mostly noise.',
            dimensions: ['security', 'cost', 'governance'],
            concept: 'security',
          },
        },
      ],
    },
    {
      id: 'expensive-classifier',
      title: 'The premium classifier',
      situation:
        'The support team built a workflow that routes every incoming ticket through the most expensive reasoning model to pick one of 12 categories. It works well. The monthly bill just hit five figures.',
      question: 'What do you do?',
      options: [
        {
          id: 'cheapest',
          label: 'Mandate the cheapest model for all workflows',
          detail: 'One rule, easy to enforce.',
          outcome: {
            score: 40,
            consequence:
              'Ticket routing gets cheaper and stays accurate. But the legal team’s contract-summary workflow, which genuinely needs the capable model, starts producing subtle errors that nobody notices for a month.',
            dimensions: ['cost', 'quality'],
            concept: 'model-selection',
          },
        },
        {
          id: 'tiers',
          label: 'Define model tiers by task type, with a quality check',
          detail: 'Simple classification on the small model; escalate only when confidence is low.',
          outcome: {
            score: 95,
            consequence:
              'Routing moves to the small model with a spot-check sample. Accuracy holds at 94%, the bill drops by 90%, and the premium model is reserved for the workflows that need it. The tiering guide becomes the default for new projects.',
            dimensions: ['cost', 'quality', 'governance'],
            concept: 'model-selection',
          },
        },
        {
          id: 'leave',
          label: 'Leave it, the quality is excellent',
          detail: 'If it works, why touch it?',
          outcome: {
            score: 25,
            consequence:
              'Quality was never the problem. The team burns the equivalent of two salaries a year on a task a small model does equally well. When budgets tighten, the whole AI programme gets questioned.',
            dimensions: ['cost', 'governance'],
            concept: 'cost',
          },
        },
      ],
    },
    {
      id: 'repeated-documents',
      title: 'The repeated documents',
      situation:
        'A project team starts every chat by pasting the same three specification documents (about 40,000 tokens) before asking a question. They do this dozens of times a day. Chats are slow and the budget alert fired.',
      question: 'What do you do?',
      options: [
        {
          id: 'project-context',
          label: 'Move the documents into project context with retrieval, and enable caching',
          detail: 'The documents are attached once; only the relevant parts enter each request.',
          outcome: {
            score: 95,
            consequence:
              'Each request now carries about 3,000 tokens instead of 40,000. Responses are faster, cost per chat falls by more than 90%, and the team stops losing the start of long conversations to context limits.',
            dimensions: ['cost', 'quality'],
            concept: 'repetition',
          },
        },
        {
          id: 'ask',
          label: 'Ask the team to paste less',
          detail: 'A friendly reminder in the team channel.',
          outcome: {
            score: 45,
            consequence:
              'Usage dips for a week and then returns to normal. People paste everything because it is the easiest way to be sure the model has what it needs. Habits change when the tooling makes the better way the easy way.',
            dimensions: ['cost', 'governance'],
            concept: 'repetition',
          },
        },
        {
          id: 'bigger',
          label: 'Switch the team to a model with a huge context window',
          detail: 'Then 40,000 tokens is nothing.',
          outcome: {
            score: 25,
            consequence:
              'The requests stop failing, and cost more than ever: the large-context model is pricier per token and the team now pastes even more. Nothing about the repeated 40,000 tokens was necessary in the first place.',
            dimensions: ['cost', 'quality'],
            concept: 'context-window',
          },
        },
      ],
    },
    {
      id: 'agent-tools',
      title: 'The over-equipped agent',
      situation:
        'A team is deploying an agent to answer billing questions. To be safe, they gave it every connector available: CRM, billing, HR system, code repository, web search, email sending. In testing it occasionally searched the web for answers it already had, and once drafted an email to a customer.',
      question: 'What do you do?',
      options: [
        {
          id: 'least-privilege',
          label: 'Restrict it to the two tools the task needs, with logging',
          detail: 'Billing lookup and CRM read-only. Everything else off.',
          outcome: {
            score: 95,
            consequence:
              'The agent answers faster because it has fewer choices, its context stays small, and there is no path from a billing question to sending an email or reading HR records. The tool-scoping checklist becomes standard for every agent.',
            dimensions: ['security', 'cost', 'quality', 'governance'],
            concept: 'tools',
          },
        },
        {
          id: 'approve-all',
          label: 'Keep all tools but require human approval for every tool call',
          detail: 'Nothing happens without a person clicking yes.',
          outcome: {
            score: 55,
            consequence:
              'Safe, but each answer now waits minutes for approvals, and reviewers start approving on autopilot. The web-search calls still happen, still cost tokens, and still add nothing.',
            dimensions: ['security', 'quality', 'cost'],
            concept: 'tools',
          },
        },
        {
          id: 'more-capable',
          label: 'Keep everything, more tools means a more capable agent',
          detail: 'Why limit it?',
          outcome: {
            score: 15,
            consequence:
              'Every extra tool is an extra way for things to go wrong. Within a month the agent emails an internal pricing sheet to a customer who asked about discounts. The incident review asks why a billing bot could send email at all.',
            dimensions: ['security', 'governance', 'cost'],
            concept: 'security',
          },
        },
      ],
    },
  ],
}
