# Adding a training

A training is content plus scenarios that reuse the engine, simulations and components.
You should not need to change `src/engine`, `src/app` or `src/lessons` to add one.

## 1. Create the folder

```
src/trainings/agent-basics/
├── training.ts          # the Training definition (modules → lessons)
├── lessons/             # MDX explanations and interactive lesson components
├── challenges/          # challenge components + definitions (evaluate → ChallengeResult)
└── data/                # scenario data: items, decision points, quiz questions
```

## 2. Define the training

```ts
// src/trainings/agent-basics/training.ts
import type { Training } from '../../engine/types'
import Intro from './lessons/01-intro.mdx'
import { introQuiz } from './data/quizzes'
import { toolPickerChallenge } from './challenges/toolPickerDefinition'

export const agentBasicsTraining: Training = {
  id: 'agent-basics',
  title: 'Agent Basics',
  tagline: 'Agents',
  description: 'How agents choose tools, and what each call costs.',
  estimatedMinutes: 15,
  audience: 'power-user',        // 'everyone' | 'power-user' | 'engineer' — drives the catalogue filter
  level: 'intermediate',          // 'beginner' | 'intermediate' | 'advanced'
  recommendedAfter: ['token-management'], // optional, a soft hint only: nothing is locked
  modules: [
    {
      id: 'intro',
      title: 'What is an agent?',
      lessons: [
        { id: 'intro', title: 'What is an agent?', type: 'explanation', component: Intro },
        { id: 'intro-quiz', title: 'Quick check', type: 'quiz', questions: introQuiz },
        { id: 'tool-picker', title: 'Challenge: Tool Picker', type: 'challenge', challenge: toolPickerChallenge },
      ],
    },
  ],
}
```

Lesson ids must be unique within a training. The registry rejects duplicates.

## 3. Register it

Add one line to `src/trainings/index.ts`:

```ts
import { agentBasicsTraining } from './agent-basics/training'
registerTraining(agentBasicsTraining)
```

The catalogue, progress tracking, XP, badges, results page and persistence pick it up automatically.
If you later add or remove lessons, stored learner progress is reconciled on the next visit.

Keep `estimatedMinutes` close to the sum of the lesson estimates: a test enforces it.

## Ready-made challenge factories

Most challenges need no new component. Build them from data:

| Factory | Use it for |
| --- | --- |
| `makeSortingChallenge` | "Which bucket does this belong in?" (`src/lessons/factories/sortingChallenge.tsx`) |
| `makeScenarioChallenge` | Decision points with consequences (`scenarioChallenge.tsx`) |
| `makeModelSelectionChallenge` | Pick a model per workload, with your own model catalogue (`modelSelectionChallenge.tsx`) |
| `makeCompositeChallenge` | "Assemble the setup": single choices plus include/exclude checklists, with caps (`compositeChallenge.tsx`) |

```ts
export const whereDoesItGo = makeSortingChallenge({
  title: 'Where does it go?',
  brief: 'Place each item.',
  buckets: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }],
  items: [{ id: '1', label: 'One', correctBucket: 'a', explanation: 'Because…' }],
})
```

## Lesson types

| Type | Definition | Completes when |
| --- | --- | --- |
| `explanation` | `component`: an MDX file | every engageable element is explored, then Continue |
| `interactive`, `simulation`, `reflection` | `component` receiving `{ onComplete, completed }` | the component calls `onComplete` |
| `quiz` | `questions: QuizQuestion[]`, optional `passScore` | at least one scored attempt |
| `challenge`, `editor` | `challenge: ChallengeDefinition` | at least one scored attempt |

`challenge`, `editor` and `quiz` lessons count towards the final score. XP defaults per type can be overridden with `xp`.

## Writing MDX lessons

These components are available in MDX without imports: `ConceptCard`, `ConceptReveal`, `BeforeAfter`,
`InteractiveDiagram`, `VendorTerm`. The first four register with the engagement gate. The learner must
mark, reveal, compare or click through them before Continue unlocks. `VendorTerm` is optional reading and
does not gate.

Use neutral concepts in prose and let `<VendorTerm concept="retrieval" />` show vendor names.
To add a concept or vendor term, edit `src/concepts/vendors.ts`.

## Writing a challenge

A challenge is a component plus a pure `evaluate`:

```ts
// challenges/toolPickerDefinition.ts
import { defineChallenge } from '../../../engine/types'
import { simulateToolPick } from '../../../simulation/toolPick'
import { ToolPicker, type ToolPickerAnswer } from './ToolPicker'

export const toolPickerChallenge = defineChallenge<ToolPickerAnswer>({
  kind: 'tool-pick',
  component: ToolPicker,
  passScore: 60,
  evaluate(answer) {
    // `answer` arrives as unknown at runtime. Validate it and never throw.
    const toolIds = Array.isArray((answer as ToolPickerAnswer | null)?.toolIds) ? (answer as ToolPickerAnswer).toolIds : []
    return simulateToolPick({ toolIds })
  },
})
```

The component receives `ChallengeProps`: `submit(answer)`, `result`, `attempts`, `bestScore`, `retry` and
`onContinue`. Wrap it in `ChallengeFrame` from `src/ui/Challenge.tsx` to get the brief, submit, score breakdown,
feedback and retry/continue flow for free. Set `minAttemptsToContinue` on the frame if learners should not
skip a failed attempt too quickly.

Keep definition files and component files differently named, for example `ToolPicker.tsx` and
`toolPickerDefinition.ts`. Names that differ only in case collide on macOS.

## Rules for simulations

Put subject logic in `src/simulation/*.ts`:

- Pure functions only: `input → result`. No `Math.random`, no `Date`, no React, no network.
- Return a `ChallengeResult`: `score` 0..100, `breakdown` dimensions, and `feedback` that explains *why*.
- Label numbers as simulated. Use `estimateTokens`, `requestCost` and `requestLatency` from the existing
  modules instead of inventing new formulas.
- Cap the score when a hard constraint fails (over budget, missing required information) so that a cheap
  but useless answer cannot pass.
- Test: the ideal answer, a partial answer, a wrong answer, edge cases (empty, zero tokens), malformed input,
  and determinism (`expect(run(x)).toEqual(run(x))`).

Existing simulations you can reuse:

| Module | Use it for |
| --- | --- |
| `contextSelection` | choosing which items go into a limited context |
| `sorting` | items into buckets, with partial credit and a confusion summary |
| `ruleChecker` | data-driven text checks (prompts, briefs, CLAUDE.md), with partial credit |
| `composite` | weighted choices and checklists with caps, for final challenges |
| `conversation` | how re-sent history and cached project files add up |
| `claudeSettings`, `permissions`, `hooks` | Claude Code settings layering, rule matching, hook events |
| `caching`, `workload`, `agent`, `evals` | prompt caching, batch vs realtime, agent runs, eval suites |
| `modelSelection` | choosing a model under budget, latency and quality constraints |
| `retrieval` | chunking, top-k, thresholds and reranking |
| `promptEvaluator` | rule-based checks on a structured prompt |
| `scenario` | branching decision points with consequences (no code needed, just data) |
| `finalChallenge` | composing several of the above |

`src/simulation/agent.ts` does not exist yet. An agent training is the natural place to add it.

## Reusable components

`src/ui` holds the component library: `TokenMeter`, `ContextWindow`, `ContextItem`, `ConversationMeter`,
`ModelCard`, `ToolChain`, `BucketSort`, `OrderList`, `CompositeForm`, `DecisionPoint`, `Scenario`,
`ScoreBreakdown`, `Feedback`, `MetricsTable`, `SimulationPanel`, `MultipleChoice`, `ProgressBar`,
`CodeEditor` (Monaco, lazy, with `markdown` and `json` highlighting) and the MDX components above.
Components take props and hold no training state. `BucketSort` and `OrderList` are keyboard-first: no
interaction requires dragging.

## Vendor-specific content

Anything you state about a Claude feature must trace to `docs/sources/claude-facts.md`, which carries a
source link and the date it was checked. If you cannot verify it, leave it out, and re-check the facts
before editing this kind of content: these products change every few months. End such a training with a
cheat-sheet lesson that links its sources.

## Phaser games

Use Phaser only when spatial manipulation genuinely helps learning. Follow `src/games/token-heist`:
React owns the state, the scene renders it and reports intents, Phaser is imported dynamically, and an
accessible list view offers the same interaction without dragging.

## Checklist

```bash
npm test && npm run typecheck && npx oxlint && npm run build
```

Then play the training end to end with `npm run dev`, including a narrow viewport and keyboard only.
