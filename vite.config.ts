import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { defineConfig, type Plugin } from 'vite'

/**
 * Static hosts such as GitHub Pages return 404 for client-side routes like
 * /training/token-management. Serving the SPA shell as 404.html lets the router
 * handle deep links and page refreshes.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'ai-quest:spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await copyFile(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react', remarkPlugins: [remarkGfm] }) },
    react({ include: /\.(mdx|jsx|tsx|ts|js)$/ }),
    tailwindcss(),
    spaFallback(),
  ],
  build: {
    chunkSizeWarningLimit: 3000,
  },
})
