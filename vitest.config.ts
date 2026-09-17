import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Logic tests run in node. Component tests (*.test.tsx) opt into jsdom with
// a `// @vitest-environment jsdom` docblock at the top of the file.
// MDX is compiled so tests can import whole training definitions.
export default defineConfig({
  plugins: [{ enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) }, react({ include: /\.(mdx|jsx|tsx|ts|js)$/ })],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
