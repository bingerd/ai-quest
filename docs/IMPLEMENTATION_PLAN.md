# AI Quest — Implementation Plan (condensed)

Goal: a working, polished MVP of an interactive training platform, with the first training
"Token & Context Management", built as a client-side app with deterministic simulations and no LLM calls.

## Decisions

- Single Vite app with separated `src/` modules (engine / simulation / ui / lessons / games / concepts / trainings).
- Phaser 4 lazy-loaded for Token Heist only, with an accessible React list fallback. Everything else is React.
- Monaco bundled locally (no CDN loader) so gameplay never touches the network.
- Zustand + `persist` (localStorage) for progress. No backend, no auth, no database.
- Fictional model profiles; `tokens ≈ chars / 4`; all numbers labelled "simulated".

## Phases

1. **Foundation** — Vite/React/TS strict, Tailwind 4, MDX, router, design tokens, shell, catalogue. ✅
2. **Training engine** — generic types, pure progression, registry, persisted store, lesson page. ✅
3. **Core components + first lessons** — TokenMeter, ContextWindow, ContextItem, Token Visualizer, Interactive Context Window, Modules 1–2 content.
4. **Token Heist** — `simulateContextSelection` + tests, Phaser scene + React bridge + list fallback.
5. **Context Surgeon** — same simulation, removal-oriented scenario, live metrics.
6. **Model Selection, retrieval lesson, Prompt Surgery editor** — `simulateModelSelection`, `simulateRetrieval`, `evaluatePrompt` + Monaco editor.
7. **Enterprise scenario + Final Challenge** — decision-point engine, composed final simulation, results page.
8. **Polish** — motion, a11y, responsive, error/empty/loading states.
9. **Content** — final copy pass, vendor mapping, docs.

Each phase ends with `npm test`, `npm run typecheck`, `npm run build` and one commit.

## Definition of done

See the checklist in the original spec (platform, token training, technical, architecture). The
architecture goal is that adding Training #2 means adding a folder under `src/trainings` and one import line.
