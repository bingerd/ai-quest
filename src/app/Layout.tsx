import { Link, Outlet } from 'react-router-dom'
import { useTheme } from './theme'

export function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b line surface-1/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight ink-1">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white" aria-hidden>
              <svg viewBox="0 0 32 32" className="size-5">
                <path d="M8 22 16 8l8 14h-4l-4-7-4 7z" fill="currentColor" />
              </svg>
            </span>
            AI Quest
          </Link>
          <div className="flex items-center gap-2">
            <span className="chip surface-2 ink-3 hidden sm:inline-flex">No LLM calls · fully simulated</span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t line px-4 py-4 text-center text-xs ink-3">
        AI Quest · All AI behaviour in this training is simulated deterministically. No model is ever called.
      </footer>
    </div>
  )
}

function ThemeToggle() {
  const theme = useTheme((s) => s.theme)
  const cycle = useTheme((s) => s.cycle)
  const label = theme === 'system' ? 'System theme' : theme === 'light' ? 'Light theme' : 'Dark theme'
  return (
    <button type="button" onClick={cycle} className="btn btn-ghost px-2" aria-label={`${label}. Switch theme`} title={label}>
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      ) : theme === 'light' ? (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8" />
        </svg>
      )}
    </button>
  )
}
