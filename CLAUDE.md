# AI Quest

A browser-based training app that teaches how large language models behave —
tokens, context windows, cost, Claude Code, and building on the Claude API.

**Everything AI in this app is simulated deterministically.** There are no LLM
calls, no API keys, no backend, no environment variables and no network traffic at
runtime. Every number the learner sees comes from a pure function in
`src/simulation/`. If a change would introduce a real model call, it is the wrong
change.

React 19 · TypeScript · Vite 8 · Tailwind 4 · Zustand · MDX · Vitest · Phaser
(one game) · Monaco (bundled locally, never from a CDN). Node 20.19+.

## Commands

```bash
npm run dev        # http://localhost:5173
npm test           # vitest run
npm run test:watch
npm run typecheck  # tsc -b --noEmit
npm run lint       # oxlint
npm run build      # tsc -b && vite build -> dist/ (+ dist/404.html for Pages)
npm run preview    # serve the production build, http://localhost:4173
```

Before committing, run the full gate:

```bash
npm test && npm run typecheck && npx oxlint && npm run build
```

CI (`.github/workflows/deploy.yml`) only builds and deploys to GitHub Pages on
push to `main` — it does **not** run tests, typecheck or lint. Those are local
gates, so do not skip them.

## Layout

| Path | What lives there |
| --- | --- |
| `src/app/` | Router, layout, and the Catalogue / Training / Lesson / Results pages |
| `src/engine/` | Subject-agnostic progression, registry, Zustand store, quiz, types |
| `src/simulation/` | Pure simulation modules, each with a `*.test.ts` sibling |
| `src/ui/` | Stateless presentational components (props in, events out) |
| `src/lessons/` | Lesson renderers, MDX component map, engagement gate, challenge factories |
| `src/trainings/` | The five trainings: `training.ts` + `lessons/` + `challenges/` + `data/` |
| `src/concepts/` | Vendor-neutral vocabulary (`vendors.ts`) and `<VendorTerm>` |
| `src/games/token-heist/` | Phaser scene, React owner, and an accessible list fallback |
| `docs/` | `ADDING_A_TRAINING.md`, `IMPLEMENTATION_PLAN.md`, `sources/claude-facts.md` |

## Architecture rules

- **The engine is subject-agnostic.** `src/engine/` must never import from
  `src/simulation/` or `src/trainings/`.
- **Simulations are pure.** `input -> result`. No `Math.random`, no `Date`, no
  React, no network. Determinism is tested: `expect(run(x)).toEqual(run(x))`.
- **UI components hold no training state.** They take props. Lesson renderers read
  and write the Zustand store.
- **Content is data.** A training is a `Training` object referencing MDX files,
  components and challenge definitions. Adding one should not require touching
  `src/engine`, `src/app` or `src/lessons`.
- **Progress lives in localStorage** (`ai-quest:progress:v1`) via Zustand
  `persist`, with an in-memory fallback. No accounts, no sync, no analytics.
- **Learners must engage.** Explanation lessons unlock Continue only once every
  concept card, reveal, comparison and diagram has been explored. An element that
  is already visible on mount should count as explored — do not make someone click
  what they are already reading.
- **No network at runtime.** Monaco is bundled; Phaser and Monaco are lazy chunks.

## Conventions

- TypeScript is strict, including `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes` and `verbatimModuleSyntax`. Expect to handle
  `undefined` from index access and to use `import type`.
- Tests run in `node` by default. A component test must opt into jsdom with a
  `// @vitest-environment jsdom` docblock on line 1.
- Tailwind 4 is configured CSS-first in `src/index.css`. There is no
  `tailwind.config.js`. Dark mode is driven by
  `document.documentElement.dataset.theme`.
- Do not name a definition file and a component file the same word in different
  case (`toolPicker.ts` vs `ToolPicker.tsx` is fine; names differing only in case
  collide on macOS).
- Interactive components are keyboard-first. Nothing may require dragging.
- Everything must work down to a 400px viewport.

## Content rule

Anything the trainings state about a Claude feature must trace back to a line in
`docs/sources/claude-facts.md`, which carries a source link and the date it was
checked. If a claim cannot be verified there, leave it out. Simulated numbers
(tokens, cost, latency, quality scores) are teaching models, not measurements, and
must be labelled as simulated in the UI.

## Testing the site in a browser

Prefer `npm test` and `npm run typecheck`. They cover almost everything and cost
close to nothing. Reach for a browser only when a change genuinely cannot be
verified any other way — layout, Monaco or Phaser mounting, real click-through of
a lesson.

**When this site has to be driven through the Claude Chrome extension
(`mcp__claude-in-chrome__*` tools), that work must run on the Haiku model.**
Delegate it to a subagent with `model: "haiku"` rather than driving the browser
from the main session. Browser automation burns a large number of tokens on
screenshots and page reads, and it is not worth a frontier model's context.

Give the subagent an explicit, narrow brief: which URL, what to click, what to
report back. Have it report findings as text, not screenshots.

## Adding a training

Read `docs/ADDING_A_TRAINING.md` first — it is the authoring contract. In short:
create a folder under `src/trainings/`, add one import and one `registerTraining(...)`
line in `src/trainings/index.ts`, keep lesson ids unique, keep `estimatedMinutes`
close to the sum of the lesson estimates (a test enforces it within 8 minutes), and
end the training with a `challenge` or `editor` lesson. Challenge `evaluate()`
receives `answer` as `unknown` — validate it and never throw. Cap the score when a
hard constraint fails, so a cheap but useless answer cannot pass.

`ConceptCard`, `ConceptReveal`, `BeforeAfter`, `InteractiveDiagram` and
`UiMockup` are available in MDX without importing them, and all five gate
Continue. `VendorTerm` does not gate.
