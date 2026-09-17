import type { ModelSelectionScenario } from '../../../simulation/modelSelection'
import { getModel, type ModelProfile } from '../../../simulation/models'

/**
 * Simulated tier profiles named after Claude Code's model aliases. The numbers are
 * relative teaching values borrowed from the fictional catalogue, not real pricing.
 */
export const tierCatalogue: ModelProfile[] = [
  { ...getModel('sparrow'), id: 'haiku', name: 'haiku', tagline: 'Fastest and cheapest tier. Simple, high-volume work. (simulated profile)', contextLimit: 200_000 },
  { ...getModel('heron'), id: 'sonnet', name: 'sonnet', tagline: 'The everyday coding tier. (simulated profile)', contextLimit: 200_000 },
  { ...getModel('albatross'), id: 'opus', name: 'opus', tagline: 'Deepest reasoning, slowest and priciest tier. (simulated profile)', contextLimit: 200_000 },
]

export const routingScenarios: ModelSelectionScenario[] = [
  {
    id: 'architecture',
    title: 'Plan the architecture for a new payments module',
    description: 'A handful of long, hard turns. Mistakes here are expensive later.',
    requests: 6,
    avgInputTokens: 30_000,
    avgOutputTokens: 4_000,
    complexity: 0.8,
    budget: 5,
    maxLatencySeconds: 60,
    qualityTarget: 0.9,
  },
  {
    id: 'implement',
    title: 'Implement the approved plan',
    description: 'Thirty turns of normal coding against a clear plan.',
    requests: 30,
    avgInputTokens: 20_000,
    avgOutputTokens: 3_000,
    complexity: 0.6,
    budget: 6,
    maxLatencySeconds: 30,
    qualityTarget: 0.9,
  },
  {
    id: 'rename',
    title: 'Rename a prop across 40 files',
    description: 'Mechanical, repetitive edits.',
    requests: 40,
    avgInputTokens: 8_000,
    avgOutputTokens: 800,
    complexity: 0.25,
    budget: 1,
    maxLatencySeconds: 5,
    qualityTarget: 0.9,
  },
  {
    id: 'search',
    title: 'A subagent searching 400 files for a deprecated logger',
    description: 'Hundreds of small, simple read-and-report steps.',
    requests: 400,
    avgInputTokens: 3_000,
    avgOutputTokens: 200,
    complexity: 0.2,
    budget: 1.5,
    maxLatencySeconds: 3,
    qualityTarget: 0.85,
  },
]
