import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react({ include: /\.(mdx|jsx|tsx|ts|js)$/ }),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
  },
})
