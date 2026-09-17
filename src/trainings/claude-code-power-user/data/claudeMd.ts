import type { ClaudeMdExercise } from '../../../simulation/claudeMd'

export const claudeMdOriginal = `# CLAUDE.md

You are a helpful AI assistant. Always write clean, high-quality code and follow best practices.

## Project
Acme Billing: a TypeScript monorepo that generates and sends invoices.

## Commands
- Install: pnpm install
- Test: pnpm test
- Lint: pnpm lint

## Conventions
- Tests use Vitest and live next to the code as *.test.ts
- Money is stored as integer cents, never floats

## API reference
[Full 3,000-line API reference pasted here]

## Environment
STRIPE_SECRET_KEY=sk_live_51HqZr8Kx2Lm9Pq4Rt

## About me
I prefer dark mode and my editor is Neovim.

Always write clean, high-quality code and follow best practices.
`

export const claudeMdExercise: ClaudeMdExercise = {
  original: claudeMdOriginal,
  requiredMarkers: [
    { marker: 'pnpm test', label: 'the test command' },
    { marker: 'pnpm lint', label: 'the lint command' },
    { marker: 'integer cents', label: 'the money convention' },
    { marker: 'Vitest', label: 'the testing convention' },
  ],
  pastedBlocks: [{ marker: '[Full 3,000-line API reference pasted here]', label: 'the API reference', tokens: 30_000 }],
  personalMarkers: ['Neovim', 'dark mode'],
  fillerPhrases: ['helpful AI assistant', 'clean, high-quality code', 'follow best practices'],
  tokenBudget: 400,
}
