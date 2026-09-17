import type { Scenario } from '../../../simulation/scenario'

export const platformScenario: Scenario = {
  id: 'platform-week',
  title: 'A week on the platform team',
  intro: 'You run Claude Code and the Claude API for 800 engineers. Four things land on your desk. Each has a fix that scales and one that does not.',
  dimensions: [
    { id: 'reliability', label: 'Reliability', weight: 2 },
    { id: 'security', label: 'Security', weight: 2 },
    { id: 'cost', label: 'Cost control', weight: 2 },
    { id: 'adoption', label: 'Adoption', weight: 1 },
  ],
  decisions: [
    {
      id: 'rollout',
      title: 'Monday: the rollout',
      situation: 'Eight hundred engineers are getting Claude Code this quarter. Security wants guarantees that nobody can disable permission prompts or read secrets, and legal wants usage visibility.',
      question: 'How do you set it up?',
      options: [
        {
          id: 'managed',
          label: 'Managed settings with deny rules and telemetry enabled',
          detail: 'Deploy managed settings by MDM: permissions.deny for secrets, disableBypassPermissionsMode, and OpenTelemetry to your collector.',
          outcome: { score: 95, consequence: 'Every machine gets the same floor, and it cannot be overridden locally. Usage and cost metrics flow into your existing dashboards without collecting prompt text.', dimensions: ['security', 'reliability', 'cost'], concept: 'managed-settings' },
        },
        {
          id: 'wiki',
          label: 'Publish a wiki page with the recommended settings',
          detail: 'Ask everyone to copy it into their own settings.',
          outcome: { score: 35, consequence: 'Half the team copies it, a quarter adapts it, and nobody updates it when it changes. You have no idea what is actually configured anywhere.', dimensions: ['security', 'reliability'], concept: 'managed-settings' },
        },
        {
          id: 'block',
          label: 'Allow it for one team only, for now',
          detail: 'Wait for a formal review before wider rollout.',
          outcome: { score: 40, consequence: 'Nothing goes wrong, and nothing improves either. Engineers elsewhere start using personal accounts, which is the outcome you were trying to avoid.', dimensions: ['adoption', 'security'], concept: 'managed-settings' },
        },
      ],
    },
    {
      id: 'ci-agent',
      title: 'Tuesday: the runaway CI agent',
      situation: 'A nightly job runs Claude Code headless to triage failing tests. Last night it ran for three hours, edited files outside the repo and posted twelve comments on the same pull request.',
      question: 'What do you change?',
      options: [
        {
          id: 'constrain',
          label: 'Constrain the job: --bare, an explicit allowed-tools list, a turn limit and a scoped working directory',
          outcome: { score: 95, consequence: 'The job now loads no hooks, MCP servers or CLAUDE.md it does not need, can only use the tools you listed, and stops after a bounded number of turns. Runtime drops to eight minutes.', dimensions: ['reliability', 'security', 'cost'], concept: 'headless' },
        },
        {
          id: 'watch',
          label: 'Add alerting so someone notices sooner next time',
          outcome: { score: 45, consequence: 'You find out faster, at 3am, and still have to clean up. The agent can still do all the same things.', dimensions: ['reliability'], concept: 'headless' },
        },
        {
          id: 'delete',
          label: 'Delete the job',
          outcome: { score: 30, consequence: 'The incidents stop, and so does the value. The problem was an unbounded agent, not the idea.', dimensions: ['adoption', 'reliability'], concept: 'headless' },
        },
      ],
    },
    {
      id: 'cost-spike',
      title: 'Wednesday: the cost spike',
      situation: 'API spend tripled in a week. One internal service is responsible: it sends a 60,000-token knowledge base with every request, thousands of times a day, and nobody is waiting on most of those requests.',
      question: 'What do you do first?',
      options: [
        {
          id: 'measure-fix',
          label: 'Look at the traffic, then cache the stable prefix and move the asynchronous half to batches',
          outcome: { score: 95, consequence: 'The knowledge base is written to the cache once and read back at a tenth of the price, and the overnight half runs at half price. Spend drops below where it started, with no quality change.', dimensions: ['cost', 'reliability'], concept: 'cost' },
        },
        {
          id: 'cheaper-model',
          label: 'Switch the service to the cheapest model',
          outcome: { score: 40, consequence: 'Spend falls and quality falls with it. The waste was in sending the same 60,000 tokens every time, not in the model.', dimensions: ['cost'], concept: 'cost' },
        },
        {
          id: 'quota',
          label: 'Cap the team’s quota and tell them to be careful',
          outcome: { score: 30, consequence: 'The feature starts failing at 3pm every day. The team works around the cap instead of fixing the prompt.', dimensions: ['cost', 'adoption'], concept: 'cost' },
        },
      ],
    },
    {
      id: 'mcp-request',
      title: 'Thursday: "can you allow all MCP servers?"',
      situation: 'A team wants to install MCP servers freely, including community ones, into the shared project configuration.',
      question: 'What is your answer?',
      options: [
        {
          id: 'reviewed',
          label: 'Yes, from a reviewed list; anything else stays in personal scope',
          detail: 'Review what a server can reach, pin versions, and keep project scope for approved ones.',
          outcome: { score: 95, consequence: 'Teams get what they need within days, and a server that can read your repositories gets looked at before it is shared with everyone.', dimensions: ['security', 'adoption'], concept: 'mcp' },
        },
        {
          id: 'yes',
          label: 'Yes, anything goes',
          outcome: { score: 15, consequence: 'A community server with broad permissions is added to the project config. Every developer on that repo now runs it, and its tool definitions quietly fill everyone’s context.', dimensions: ['security', 'cost'], concept: 'mcp' },
        },
        {
          id: 'no',
          label: 'No MCP servers at all',
          outcome: { score: 35, consequence: 'You avoid the risk and lose most of the value. Teams route around you with local-scope servers you never see.', dimensions: ['adoption', 'security'], concept: 'mcp' },
        },
      ],
    },
  ],
}
