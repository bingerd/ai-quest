// @vitest-environment jsdom
import { MDXProvider } from '@mdx-js/react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VendorTerm } from '../concepts/VendorTerm'
import { BeforeAfter } from '../ui/BeforeAfter'
import { ConceptCard } from '../ui/ConceptCard'
import { ConceptReveal } from '../ui/ConceptReveal'
import { InteractiveDiagram } from '../ui/InteractiveDiagram'
import { EngagementContinue, EngagementProvider } from './Engagement'
import { mdxComponents } from './MdxComponents'

afterEach(cleanup)

const NODES = [
  { id: 'a', label: 'A', detail: 'da' },
  { id: 'b', label: 'B', detail: 'db' },
]

function harness(children: React.ReactNode) {
  const onComplete = vi.fn()
  render(
    <EngagementProvider>
      {children}
      <EngagementContinue completed={false} onComplete={onComplete} />
    </EngagementProvider>,
  )
  return onComplete
}

describe('Engagement gating', () => {
  it('locks InteractiveDiagram until every node is visited', () => {
    const onComplete = harness(<InteractiveDiagram nodes={NODES} title="t" />)
    expect(screen.getByRole('status')).toHaveTextContent('0 of 2 steps explored')
    const locked = screen.getByRole('button', { name: /explore everything first \(1 left\)/i }) as HTMLButtonElement
    expect(locked.disabled).toBe(true)

    fireEvent.click(screen.getByRole('tab', { name: 'A' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 steps explored')
    expect((screen.getByRole('button', { name: /explore everything first \(1 left\)/i }) as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(screen.getByRole('tab', { name: 'B' }))
    expect(screen.getByRole('status')).toHaveTextContent('✓ All steps explored')
    const ready = screen.getByRole('button', { name: /got it, continue/i }) as HTMLButtonElement
    expect(ready.disabled).toBe(false)
    fireEvent.click(ready)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('locks ConceptCard until marked as read', () => {
    harness(
      <ConceptCard title="Stateless">
        <p>body</p>
      </ConceptCard>,
    )
    expect((screen.getByRole('button', { name: /explore everything first \(1 left\)/i }) as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))
    expect(screen.getByRole('button', { name: '✓ Read' })).not.toBeNull()
    const ready = screen.getByRole('button', { name: /got it, continue/i }) as HTMLButtonElement
    expect(ready.disabled).toBe(false)
  })

  it('locks ConceptReveal until revealed', () => {
    harness(<ConceptReveal prompt="Q">answer</ConceptReveal>)
    expect((screen.getByRole('button', { name: /explore everything first \(1 left\)/i }) as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))
    expect((screen.getByRole('button', { name: /got it, continue/i }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('locks VendorTerm until opened', () => {
    harness(<VendorTerm concept="conversation" />)
    expect((screen.getByRole('button', { name: /explore everything first \(1 left\)/i }) as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: /conversation/i }))
    expect((screen.getByRole('button', { name: /got it, continue/i }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('locks BeforeAfter until the After panel is acknowledged', () => {
    harness(
      <BeforeAfter
        before={<p>b</p>}
        after={<p>a</p>}
      />,
    )
    expect((screen.getByRole('button', { name: /explore everything first \(1 left\)/i }) as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))
    expect(screen.getByRole('button', { name: '✓ Read' })).not.toBeNull()
    expect((screen.getByRole('button', { name: /got it, continue/i }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('locks a lesson page until every element has been clicked through', () => {
    // Mirrors the engaged surface of 01-what-is-an-llm.mdx: one diagram,
    // one concept card and two vendor terms.
    const onComplete = vi.fn()
    const lesson = (
      <MDXProvider components={mdxComponents}>
        <InteractiveDiagram title="One AI request" nodes={NODES} />
        <ConceptCard title="Stateless by default">
          <p>When you continue a chat, the whole conversation is sent again.</p>
        </ConceptCard>
        <p>
          A <VendorTerm concept="conversation" /> in one product, a <VendorTerm concept="projectContext" /> in another.
        </p>
      </MDXProvider>
    )
    render(
      <EngagementProvider>
        {lesson}
        <EngagementContinue completed={false} onComplete={onComplete} />
      </EngagementProvider>,
    )

    const locked = screen.getByRole('button', { name: /explore everything first \(4 left\)/i }) as HTMLButtonElement
    expect(locked.disabled).toBe(true)

    for (const label of ['A', 'B']) {
      fireEvent.click(screen.getByRole('tab', { name: label }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))
    fireEvent.click(screen.getByRole('button', { name: /conversation/i }))
    fireEvent.click(screen.getByRole('button', { name: /project context/i }))

    const go = screen.getByRole('button', { name: /got it, continue/i }) as HTMLButtonElement
    expect(go.disabled).toBe(false)
    fireEvent.click(go)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

describe('without a provider', () => {
  it('passes through ungated', () => {
    const onComplete = vi.fn()
    render(
      <>
        <ConceptCard title="X">
          <p>body</p>
        </ConceptCard>
        <EngagementContinue completed={false} onComplete={onComplete} />
      </>,
    )
    expect(screen.queryByRole('button', { name: 'Mark as read' })).toBeNull()
    const go = screen.getByRole('button', { name: /got it, continue/i }) as HTMLButtonElement
    expect(go.disabled).toBe(false)
  })
})

describe('EngagementContinue', () => {
  it('lets a completed lesson through without exploring', () => {
    render(
      <EngagementProvider>
        <ConceptReveal prompt="Q">a</ConceptReveal>
        <EngagementContinue completed onComplete={() => {}} />
      </EngagementProvider>,
    )
    const next = screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement
    expect(next.disabled).toBe(false)
  })
})