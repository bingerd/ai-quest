import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
const KEY = 'ai-quest:theme'

function readStored(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' || v === 'light' ? v : 'system'
  } catch {
    return 'system'
  }
}

function apply(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset['theme']
  else root.dataset['theme'] = theme
  try {
    if (theme === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, theme)
  } catch {
    // ignore
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  cycle: () => void
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: typeof document === 'undefined' ? 'system' : readStored(),
  setTheme: (theme) => {
    apply(theme)
    set({ theme })
  },
  cycle: () => {
    const order: Theme[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(get().theme) + 1) % order.length] ?? 'system'
    get().setTheme(next)
  },
}))
