/**
 * A toy next-token predictor. Each context maps to a fixed, hand-written
 * probability table. Picking a token appends it and moves to the next context.
 * Deterministic and pure: the numbers are teaching values, not model output.
 */

export interface TokenCandidate {
  token: string
  /** 0..1, simulated probability. */
  p: number
  /** Context reached after picking this token. Missing = the sentence ends. */
  next?: string
}

export type NextTokenTable = Record<string, TokenCandidate[]>

export interface NextTokenStep {
  context: string
  picked: TokenCandidate
  /** True when the picked token was the most likely one. */
  greedy: boolean
}

export interface NextTokenRun {
  text: string
  steps: NextTokenStep[]
  finished: boolean
  /** Product of picked probabilities, as a percentage of the greedy path's. */
  likelihoodVsGreedy: number
}

/** Candidates for a context, most likely first. Unknown context → empty list. */
export function candidates(table: NextTokenTable, context: string): TokenCandidate[] {
  return [...(table[context] ?? [])].sort((a, b) => b.p - a.p || a.token.localeCompare(b.token))
}

/** Replay a list of picks (token strings) from a start context. Invalid picks stop the run. */
export function runPicks(table: NextTokenTable, start: string, prompt: string, picks: readonly string[]): NextTokenRun {
  const steps: NextTokenStep[] = []
  let context: string | undefined = start
  let text = prompt
  for (const token of picks) {
    if (context === undefined) break
    const options = candidates(table, context)
    const picked = options.find((c) => c.token === token)
    if (!picked) break
    steps.push({ context, picked, greedy: options[0]?.token === picked.token })
    text += picked.token
    context = picked.next
  }
  const finished = context === undefined || candidates(table, context).length === 0
  const likelihood = steps.reduce((acc, s) => acc * s.picked.p, 1)
  const greedyLikelihood = steps.reduce((acc, s) => acc * (candidates(table, s.context)[0]?.p ?? 1), 1)
  const likelihoodVsGreedy = greedyLikelihood === 0 ? 0 : Math.round((likelihood / greedyLikelihood) * 100)
  return { text, steps, finished, likelihoodVsGreedy }
}

/** The path that always takes the most likely token. */
export function greedyPicks(table: NextTokenTable, start: string, maxSteps = 20): string[] {
  const picks: string[] = []
  let context: string | undefined = start
  while (context !== undefined && picks.length < maxSteps) {
    const top: TokenCandidate | undefined = candidates(table, context)[0]
    if (!top) break
    picks.push(top.token)
    context = top.next
  }
  return picks
}
