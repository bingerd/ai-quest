import type { ChallengeResult, Feedback, ScoreDimension } from '../engine/types'
import { clamp, round, weightedTotal } from './scoring'
import { formatTokens } from './tokens'

/**
 * Deterministic agent run: a task needs capabilities in order, the agent uses the
 * best tool it has for each step, and every tool result lands in the context window.
 * Vague tool descriptions cause a wrong tool to be tried first. No model is involved.
 */

export interface AgentTool {
  id: string
  label: string
  /** What the tool can do, matched against what each step needs. */
  capability: string
  description: string
  /** A vague description costs one wrong call before the right one. */
  vague?: boolean
  resultTokens: number
  latencySeconds: number
  /** Simulated cost per call, in the same units as model cost. */
  costPerCall: number
  /** Tools that can change the world or reach sensitive data. */
  risk: 'read' | 'write' | 'dangerous'
  riskNote?: string
}

export interface AgentStepSpec {
  id: string
  label: string
  needs: string
  /** Without this capability the task cannot be completed. */
  required: boolean
}

export interface AgentTaskSpec {
  task: string
  steps: AgentStepSpec[]
  tools: AgentTool[]
  /** Tokens already in context before the run. */
  baseContextTokens: number
  contextLimit: number
  /** Risk levels that should never be handed to this agent. */
  forbiddenRisks: ('write' | 'dangerous')[]
  passScore?: number
}

export interface AgentStepResult {
  stepId: string
  toolId: string | null
  wrongToolId: string | null
  contextAfter: number
  cost: number
  latency: number
  note: string
}

export interface AgentRunResult extends ChallengeResult {
  steps: AgentStepResult[]
  completed: boolean
  metrics: Record<string, number>
}

export function simulateAgentRun(spec: AgentTaskSpec, selectedToolIds: string[]): AgentRunResult {
  const selected = spec.tools.filter((t) => selectedToolIds.includes(t.id))
  const steps: AgentStepResult[] = []
  let context = spec.baseContextTokens
  let cost = 0
  let latency = 0
  let completed = true

  for (const step of spec.steps) {
    const candidates = selected.filter((t) => t.capability === step.needs)
    const clear = candidates.find((t) => !t.vague)
    const tool = clear ?? candidates[0] ?? null
    if (!tool) {
      if (step.required) completed = false
      steps.push({ stepId: step.id, toolId: null, wrongToolId: null, contextAfter: context, cost: 0, latency: 0, note: step.required ? 'No tool could do this. The agent gives up or guesses.' : 'Skipped: no tool for it.' })
      continue
    }
    // A vague description sends the agent to the wrong tool once first.
    const decoy = tool.vague ? selected.find((t) => t.id !== tool.id && t.risk === 'read') ?? null : null
    let stepCost = tool.costPerCall
    let stepLatency = tool.latencySeconds
    let stepTokens = tool.resultTokens
    if (decoy) {
      stepCost += decoy.costPerCall
      stepLatency += decoy.latencySeconds
      stepTokens += decoy.resultTokens
    }
    context += stepTokens
    cost += stepCost
    latency += stepLatency
    steps.push({
      stepId: step.id,
      toolId: tool.id,
      wrongToolId: decoy?.id ?? null,
      contextAfter: context,
      cost: round(stepCost, 4),
      latency: round(stepLatency, 2),
      note: decoy ? `"${tool.label}" does not say what it is for, so the agent tried "${decoy.label}" first.` : `Used ${tool.label}.`,
    })
  }

  const overflow = Math.max(0, context - spec.contextLimit)
  const risky = selected.filter((t) => spec.forbiddenRisks.includes(t.risk as 'write' | 'dangerous'))
  // Tools already flagged as forbidden are not repeated as merely unused.
  const unused = selected.filter((t) => !spec.steps.some((s) => s.needs === t.capability) && !risky.includes(t))

  const completeness = completed ? 100 : 30
  const efficiency = clamp(100 - unused.length * 20 - steps.filter((s) => s.wrongToolId).length * 15)
  const contextScore = overflow > 0 ? 20 : clamp(100 - ((context - spec.baseContextTokens) / Math.max(1, spec.contextLimit - spec.baseContextTokens)) * 60)
  const safety = risky.length > 0 ? 0 : 100

  const breakdown: ScoreDimension[] = [
    { id: 'completeness', label: 'Task completed', score: completeness, weight: 3 },
    { id: 'safety', label: 'Least privilege', score: safety, weight: 3 },
    { id: 'efficiency', label: 'Tool efficiency', score: efficiency, weight: 2 },
    { id: 'context', label: 'Context growth', score: round(contextScore), weight: 1 },
  ]
  let score = weightedTotal(breakdown)
  if (!completed) score = Math.min(score, 45)
  if (risky.length > 0) score = Math.min(score, 40)

  const feedback: Feedback[] = []
  for (const t of risky) feedback.push({ tone: 'warning', title: `${t.label} should not be in this agent's toolbox`, body: t.riskNote ?? 'It can act beyond what the task needs. Every extra capability is an extra way for a mistake to become an incident.', concept: 'least-privilege' })
  for (const s of steps.filter((x) => x.toolId === null)) {
    const step = spec.steps.find((x) => x.id === s.stepId)!
    feedback.push({ tone: 'warning', title: `No tool for "${step.label}"`, body: step.required ? 'This step is essential: without it the agent cannot finish the task.' : 'The agent worked around it.', concept: 'tools' })
  }
  for (const s of steps.filter((x) => x.wrongToolId)) feedback.push({ tone: 'warning', title: 'A vague tool description cost an extra call', body: s.note + ' Tool descriptions are prompts: say what the tool does and when to use it.', concept: 'tool-design' })
  for (const t of unused) feedback.push({ tone: 'neutral', title: `${t.label} was never used`, body: `Its definition still costs context in every request. Give an agent the tools the task needs.`, concept: 'tools' })
  if (overflow > 0) feedback.push({ tone: 'warning', title: `Context overflowed by ${formatTokens(overflow)} tokens`, body: 'Tool results accumulate. Return summaries, not raw dumps, or hand the work to a subagent.', concept: 'context-window' })
  if (feedback.length === 0) feedback.push({ tone: 'positive', title: 'Exactly the tools the task needed', body: `The agent finished in ${steps.length} steps, used ${formatTokens(context - spec.baseContextTokens)} tokens of tool results, and had no way to do anything it should not.`, concept: 'least-privilege' })

  return {
    score,
    passed: score >= (spec.passScore ?? 70),
    breakdown,
    feedback,
    summary: completed ? (risky.length > 0 ? 'Task done, with more power than it needed.' : score >= 90 ? 'Finished cleanly, with least privilege.' : 'Finished, with room to tighten.') : 'The agent could not finish the task.',
    steps,
    completed,
    metrics: { cost: round(cost, 4), latency: round(latency, 2), contextTokens: context, overflow, wrongCalls: steps.filter((s) => s.wrongToolId).length },
  }
}

export function parseToolIds(answer: unknown): string[] {
  const raw = typeof answer === 'object' && answer !== null ? (answer as { toolIds?: unknown }).toolIds : null
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
}
