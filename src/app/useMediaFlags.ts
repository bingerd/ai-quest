import { useEffect, useState } from 'react'

function query(q: string): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(q).matches
}

/** Live values for reduced motion, narrow viewport and current dark mode. */
export function useMediaFlags() {
  const [flags, setFlags] = useState(() => ({
    reducedMotion: query('(prefers-reduced-motion: reduce)'),
    narrow: query('(max-width: 639px)'),
    dark: isDark(),
  }))

  useEffect(() => {
    const update = () => setFlags({ reducedMotion: query('(prefers-reduced-motion: reduce)'), narrow: query('(max-width: 639px)'), dark: isDark() })
    const mqs = ['(prefers-reduced-motion: reduce)', '(max-width: 639px)', '(prefers-color-scheme: dark)'].map((q) => window.matchMedia(q))
    mqs.forEach((m) => m.addEventListener('change', update))
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mqs.forEach((m) => m.removeEventListener('change', update))
      observer.disconnect()
    }
  }, [])

  return flags
}

function isDark(): boolean {
  if (typeof document === 'undefined') return false
  const t = document.documentElement.dataset['theme']
  if (t === 'dark') return true
  if (t === 'light') return false
  return query('(prefers-color-scheme: dark)')
}

export function hasWebGLOrCanvas(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('2d'))
  } catch {
    return false
  }
}
