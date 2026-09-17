import { defineConfig } from 'vitest/config'

// Logic tests run in node. Component tests (*.test.tsx) opt into jsdom with
// a `// @vitest-environment jsdom` docblock at the top of the file.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
