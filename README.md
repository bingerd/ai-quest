# AI Quest

An interactive, game-like training platform for teaching practical AI concepts to enterprise users.

> **AI Quest does not make LLM calls. All AI behavior shown in the training is simulated deterministically.**
> There are no API keys, no model calls, no external AI dependencies and no paid inference.

The first training is **Token & Context Management**: what tokens are, how context windows work, why more
context is not always better, how to select a model for a task, and what all of this means at enterprise scale.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest unit tests
npm run typecheck  # strict TypeScript
npm run build      # production build to dist/
npm run preview    # serve the production build
```

Requires Node 20.19+ (developed on Node 26). No environment variables, credentials or backend.

## Architecture

Single Vite + React + TypeScript application with strictly separated modules:

```
src/
├── app/          Shell: catalogue, training overview, lesson page, results, theme, routing
├── engine/       GENERIC training engine: types, progression rules, registry, persisted store
├── simulation/   PURE deterministic simulations (tokens, context, models, retrieval, scenarios)
├── ui/           Reusable interactive components for training authors
├── lessons/      Renderers for each lesson type (MDX explanation, quiz, challenge binding)
├── games/        Phaser scenes (lazy-loaded) with React bridges and accessible fallbacks
├── concepts/     Vendor-neutral concept vocabulary + vendor terminology mapping
└── trainings/    Training content. One folder per training, registered in trainings/index.ts
```

Design rules:

- **The engine is subject-agnostic.** It knows trainings, modules, lessons, challenges, scores, feedback and
  progression. It never imports from `simulation/` or `trainings/`.
- **Simulations are pure functions.** `input → result`, no randomness, no clock, no React. This is where the
  unit tests are concentrated.
- **UI components hold no training state.** They receive props. Lesson renderers read and write the Zustand store.
- **Content is data.** A training is a `Training` object referencing MDX files, interactive components and
  challenge definitions whose `evaluate()` calls the simulation layer.
- **Progress persists in localStorage** (`ai-quest:progress:v1`) via Zustand's `persist` middleware, with
  an in-memory fallback when storage is unavailable.

See `docs/IMPLEMENTATION_PLAN.md` for the phase plan and `docs/ADDING_A_TRAINING.md` for how to add a training.

## Simulation model

Token counts use an explicit approximation (`tokens ≈ characters / 4`) and every number is labelled as simulated.
Model profiles are fictional. Nothing here reproduces a real tokenizer or real vendor pricing; the point is to
teach resource management and decision-making.
