/**
 * Fictional model profiles used across the training.
 * Numbers are invented to create meaningful trade-offs and are NOT vendor pricing.
 */

export interface ModelProfile {
  id: string
  name: string
  /** Short flavour text. */
  tagline: string
  contextLimit: number
  /** Simulated € per million input tokens. */
  inputCostPerMillion: number
  /** Simulated € per million output tokens. */
  outputCostPerMillion: number
  /** Seconds of fixed overhead per request. */
  baseLatencySeconds: number
  /** Seconds per 1,000 input tokens processed. */
  latencyPerThousandInput: number
  /** Seconds per 1,000 output tokens generated. */
  latencyPerThousandOutput: number
  /**
   * Capability 0..1: how well the model handles complex tasks.
   * Quality on a task is derived from capability vs task complexity.
   */
  capability: number
  /** Max requests processed concurrently in batch scenarios. */
  parallelism: number
}

export const MODELS: ModelProfile[] = [
  {
    id: 'sparrow',
    name: 'Sparrow',
    tagline: 'Small, fast, cheap. Great for simple, high-volume work.',
    contextLimit: 32_000,
    inputCostPerMillion: 0.2,
    outputCostPerMillion: 0.8,
    baseLatencySeconds: 0.3,
    latencyPerThousandInput: 0.05,
    latencyPerThousandOutput: 0.6,
    capability: 0.55,
    parallelism: 200,
  },
  {
    id: 'heron',
    name: 'Heron',
    tagline: 'Balanced. The default for most knowledge work.',
    contextLimit: 128_000,
    inputCostPerMillion: 2.5,
    outputCostPerMillion: 10,
    baseLatencySeconds: 0.8,
    latencyPerThousandInput: 0.12,
    latencyPerThousandOutput: 1.4,
    capability: 0.8,
    parallelism: 60,
  },
  {
    id: 'albatross',
    name: 'Albatross',
    tagline: 'Deep reasoning, very large context. Slow and expensive.',
    contextLimit: 400_000,
    inputCostPerMillion: 12,
    outputCostPerMillion: 60,
    baseLatencySeconds: 2.5,
    latencyPerThousandInput: 0.3,
    latencyPerThousandOutput: 3.5,
    capability: 0.97,
    parallelism: 15,
  },
  {
    id: 'kestrel',
    name: 'Kestrel',
    tagline: 'Long context at a low price, but shallower reasoning.',
    contextLimit: 1_000_000,
    inputCostPerMillion: 0.6,
    outputCostPerMillion: 2.4,
    baseLatencySeconds: 1.2,
    latencyPerThousandInput: 0.08,
    latencyPerThousandOutput: 1.0,
    capability: 0.65,
    parallelism: 100,
  },
]

export function getModel(id: string, catalogue: ModelProfile[] = MODELS): ModelProfile {
  const m = catalogue.find((x) => x.id === id)
  if (!m) throw new Error(`Unknown model "${id}"`)
  return m
}

export function requestCost(model: ModelProfile, inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * model.inputCostPerMillion + (outputTokens / 1_000_000) * model.outputCostPerMillion
}

export function requestLatency(model: ModelProfile, inputTokens: number, outputTokens: number): number {
  return (
    model.baseLatencySeconds +
    (inputTokens / 1000) * model.latencyPerThousandInput +
    (outputTokens / 1000) * model.latencyPerThousandOutput
  )
}

/**
 * Expected quality (0..1) of a model on a task of given complexity (0..1).
 * A model comfortably above the task's complexity scores near 1; below it, quality drops steeply.
 */
export function expectedQuality(model: ModelProfile, complexity: number): number {
  const margin = model.capability - complexity
  if (margin >= 0.15) return Math.min(1, 0.93 + margin * 0.3)
  if (margin >= 0) return 0.82 + (margin / 0.15) * 0.11
  // Below the task: steep drop-off.
  return Math.max(0.2, 0.82 + margin * 1.6)
}
