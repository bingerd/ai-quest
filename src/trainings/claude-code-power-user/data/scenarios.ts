import type { Scenario } from '../../../simulation/scenario'

export const longSessionScenario: Scenario = {
  id: 'three-hour-session',
  title: 'The three-hour session',
  intro: 'A long afternoon in Claude Code. The context window keeps filling up. Each situation has a command that fits, and some that quietly make things worse.',
  dimensions: [
    { id: 'focus', label: 'Focus', weight: 2 },
    { id: 'continuity', label: 'Continuity', weight: 2 },
    { id: 'cost', label: 'Cost', weight: 1 },
  ],
  decisions: [
    {
      id: 'new-task',
      title: 'Switching tasks',
      situation: 'You spent an hour debugging a flaky test. It is fixed. The context is 85% full. Next up: an unrelated feature in a different module.',
      question: 'What do you do?',
      options: [
        { id: 'clear', label: '/clear and start the feature fresh', outcome: { score: 95, consequence: 'The feature starts with a clean window. CLAUDE.md loads again, so the project facts are still there. None of the debugging noise follows you.', dimensions: ['focus', 'cost'], concept: 'context' } },
        { id: 'compact', label: '/compact and carry on', outcome: { score: 50, consequence: 'It works, but you now carry a summary of a debugging session that has nothing to do with the feature. Unrelated history is still pollution, just smaller.', dimensions: ['focus', 'cost'], concept: 'context' } },
        { id: 'continue', label: 'Just keep going', outcome: { score: 15, consequence: 'Every message now re-processes an hour of test logs. Auto-compact eventually kicks in at a moment you did not choose.', dimensions: ['focus', 'cost'], concept: 'context' } },
      ],
    },
    {
      id: 'mid-feature',
      title: 'Halfway through the feature',
      situation: 'Deep into the feature, the context is 80% full. There is a lot of exploration noise, but you and Claude made important API design decisions you need to keep.',
      question: 'What do you do?',
      options: [
        { id: 'focused-compact', label: '/compact keep the API design decisions and the open TODOs', outcome: { score: 95, consequence: 'The summary keeps what matters and drops the exploration. Giving /compact a focus is the difference between a useful summary and a generic one.', dimensions: ['continuity', 'focus', 'cost'], concept: 'context' } },
        { id: 'clear', label: '/clear', outcome: { score: 25, consequence: 'The window is empty, and so is Claude’s memory of the design decisions. You spend twenty minutes re-explaining them.', dimensions: ['continuity'], concept: 'context' } },
        { id: 'wait', label: 'Let auto-compact handle it', outcome: { score: 45, consequence: 'Auto-compact runs eventually, but it decides what to keep without knowing which decisions matter to you.', dimensions: ['continuity', 'focus'], concept: 'context' } },
      ],
    },
    {
      id: 'big-search',
      title: 'The big search',
      situation: 'You need every call site of an old logger across 400 files before you can replace it.',
      question: 'How do you find them?',
      options: [
        { id: 'subagent', label: 'Ask a subagent to search and report back a list of files and lines', outcome: { score: 95, consequence: 'The subagent reads hundreds of files in its own context. Your session receives a tidy list of 37 call sites.', dimensions: ['focus', 'cost', 'continuity'], concept: 'subagents' } },
        { id: 'main', label: 'Let the main session open the files one by one', outcome: { score: 30, consequence: 'It finds them, but your context is now full of file contents you will never look at again.', dimensions: ['focus', 'cost'], concept: 'subagents' } },
        { id: 'paste', label: 'Run grep yourself and paste the 5,000 lines of output', outcome: { score: 20, consequence: 'The raw output floods the window. Claude has to wade through it on every message that follows.', dimensions: ['focus', 'cost'], concept: 'context' } },
      ],
    },
    {
      id: 'what-is-in-there',
      title: 'Something feels heavy',
      situation: 'Even fresh sessions start with a surprisingly full context window. You want to know why.',
      question: 'What do you do first?',
      options: [
        { id: 'context', label: 'Run /context to see what fills the window', outcome: { score: 95, consequence: 'It shows a 30,000-token CLAUDE.md and several MCP servers loading tool definitions you never use. Now you know what to fix.', dimensions: ['focus', 'cost'], concept: 'context' } },
        { id: 'delete', label: 'Delete CLAUDE.md to be safe', outcome: { score: 20, consequence: 'The window is smaller, and Claude no longer knows your test command or conventions. You removed the useful part along with the bloat.', dimensions: ['continuity'], concept: 'claude-md' } },
        { id: 'bigger', label: 'Switch to a 1M-token model', outcome: { score: 35, consequence: 'More room, same waste. Every session still starts by loading content you do not need.', dimensions: ['cost'], concept: 'context' } },
      ],
    },
  ],
}
