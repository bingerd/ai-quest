/**
 * Simplified, explicit token model.
 *
 * This is a TRAINING SIMULATOR. It does not reproduce any vendor's tokenizer.
 * We use `tokens ≈ characters / 4`, which is a widely quoted rule of thumb for
 * English text, and is good enough to teach resource management.
 */

export const CHARS_PER_TOKEN = 4

export function estimateTokens(text: string): number {
  if (text.length === 0) return 0
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Split text into visual "token chips" for the visualizer. Deterministic and
 * purely illustrative: words are broken into ~4-character pieces, punctuation
 * and whitespace become their own tiny pieces.
 */
export function tokenizeForDisplay(text: string): string[] {
  const chips: string[] = []
  const re = /\s+|[A-Za-z0-9]+|[^\sA-Za-z0-9]/g
  for (const m of text.matchAll(re)) {
    const piece = m[0]
    if (/^\s+$/.test(piece)) {
      chips.push(piece)
      continue
    }
    if (/^[A-Za-z0-9]+$/.test(piece)) {
      for (let i = 0; i < piece.length; i += CHARS_PER_TOKEN) chips.push(piece.slice(i, i + CHARS_PER_TOKEN))
      continue
    }
    chips.push(piece)
  }
  return chips
}

export function formatTokens(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

export function formatCurrency(eur: number): string {
  if (eur < 0.01 && eur > 0) return `€${eur.toFixed(4)}`
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(eur)
}

export function formatSeconds(s: number): string {
  if (s < 1) return `${Math.round(s * 1000)} ms`
  if (s < 90) return `${s.toFixed(1)} s`
  const m = Math.floor(s / 60)
  const rest = Math.round(s % 60)
  return `${m} min ${rest} s`
}
