// @vitest-environment jsdom
import { MDXProvider } from '@mdx-js/react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VendorTerm } from '../concepts/VendorTerm'
import { BeforeAfter } from '../ui/BeforeAfter'
import { ConceptCard } from '../ui/ConceptCard'
import { ConceptReveal } from '../ui/ConceptReveal'
import { InteractiveDiagram } from '../ui/InteractiveDiagram'
import { UiMockup } from '../ui/UiMockup'
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

function lockedButton() {
  const button = screen.getByRole('button', { name: /explore everything first/i })
  expect(button).toHaveAttribute('aria-disabled', 'true')
  return button
}

describe('Engagement gating', () => {
  it('counts the pre-selected first node as explored, and locks until the rest are visited', () => {
    const onComplete = harness(<InteractiveDiagram nodes={NODES} title="t" />)
    // Node A renders selected with its detail already visible, so asking the
    // learner to click it would be asking them to click what they are reading.
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/da/)).not.toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('1 of 2 steps explored')
    expect(lockedButton()).toHaveTextContent('Explore everything first (1 left)')

    fireEvent.click(screen.getByRole('tab', { name: 'B' }))
    expect(screen.getByRole('status')).toHaveTextContent('✓ All steps explored')
    const ready = screen.getByRole('button', { name: /got it, continue/i })
    expect(ready).toHaveAttribute('aria-disabled', 'false')
    fireEvent.click(ready)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('satisfies a one-node diagram on mount, since its only step is already shown', () => {
    harness(<InteractiveDiagram nodes={[NODES[0]!]} title="t" />)
    expect(screen.getByRole('status')).toHaveTextContent('✓ All steps explored')
    expect(screen.getByRole('button', { name: /got it, continue/i })).toHaveAttribute('aria-disabled', 'false')
  })

  it('locks ConceptCard until marked as read', () => {
    harness(
      <ConceptCard title="Stateless">
        <p>body</p>
      </ConceptCard>,
    )
    lockedButton()

    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))
    expect(screen.getByRole('button', { name: '✓ Read' })).not.toBeNull()
    expect(screen.getByRole('button', { name: /got it, continue/i })).toHaveAttribute('aria-disabled', 'false')
  })

  it('locks ConceptReveal until revealed', () => {
    harness(<ConceptReveal prompt="Q">answer</ConceptReveal>)
    lockedButton()

    fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))
    expect(screen.getByRole('button', { name: /got it, continue/i })).toHaveAttribute('aria-disabled', 'false')
  })

  it('locks BeforeAfter until the After panel is acknowledged', () => {
    harness(
      <BeforeAfter
        before={<p>b</p>}
        after={<p>a</p>}
      />,
    )
    lockedButton()

    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))
    expect(screen.getByRole('button', { name: '✓ Read' })).not.toBeNull()
    expect(screen.getByRole('button', { name: /got it, continue/i })).toHaveAttribute('aria-disabled', 'false')
  })

  it('does not gate on vendor terminology expandables', () => {
    harness(
      <p>
        A <VendorTerm concept="conversation" /> in one product, a <VendorTerm concept="projectContext" /> in another.
      </p>,
    )
    const ready = screen.getByRole('button', { name: /got it, continue/i })
    expect(ready).toHaveAttribute('aria-disabled', 'false')
    expect(screen.queryByRole('button', { name: /explore everything first/i })).toBeNull()
  })

  it('locks a lesson page until every meaningful element has been clicked through', () => {
    // Mirrors the engaged surface of 01-what-is-an-llm.mdx: one diagram, one
    // concept card and two vendor terms (which intentionally do not count).
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

    expect(lockedButton()).toHaveTextContent('Explore everything first (2 left)')

    // Only B needs a click: A is selected, and shown, from the start.
    fireEvent.click(screen.getByRole('tab', { name: 'B' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))

    const go = screen.getByRole('button', { name: /got it, continue/i })
    expect(go).toHaveAttribute('aria-disabled', 'false')
    fireEvent.click(go)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

describe('EngagementContinue', () => {
  it('shakes and flashes red when clicked while locked, without continuing', () => {
    vi.useFakeTimers()
    try {
      const onComplete = harness(<ConceptReveal prompt="Q">a</ConceptReveal>)
      const button = lockedButton()

      fireEvent.click(button)
      expect(onComplete).not.toHaveBeenCalled()
      expect(button.className).toMatch(/animate-shake/)
      expect(button.className).toMatch(/ring-bad/)

      act(() => vi.advanceTimersByTime(700))
      expect(button.className).not.toMatch(/animate-shake/)
    } finally {
      vi.useRealTimers()
    }
  })

  it('passes through ungated without a provider', () => {
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
    const go = screen.getByRole('button', { name: /got it, continue/i })
    expect(go).toHaveAttribute('aria-disabled', 'false')
    fireEvent.click(go)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('lets a completed lesson through without exploring', () => {
    render(
      <EngagementProvider>
        <ConceptReveal prompt="Q">a</ConceptReveal>
        <EngagementContinue completed onComplete={() => {}} />
      </EngagementProvider>,
    )
    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toHaveAttribute('aria-disabled', 'false')
  })
})

describe('UiMockup gating', () => {
  const ROWS = [
    [
      { id: 'sidebar', label: 'Sidebar', detail: 'chats and projects' },
      { id: 'main', label: 'Conversation', detail: 'the chat itself' },
    ],
    [{ id: 'composer', label: 'Composer', detail: 'attach, tools, model' }],
  ]

  it('counts the pre-selected first region as explored, and counts regions across every row', () => {
    const onComplete = harness(<UiMockup title="Claude" rows={ROWS} />)
    expect(screen.getByRole('tab', { name: /Sidebar/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/chats and projects/)).not.toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 parts explored')

    fireEvent.click(screen.getByRole('tab', { name: /Conversation/ }))
    expect(lockedButton()).toHaveTextContent('Explore everything first (1 left)')

    // The region on the second row must count too: a row is layout, not a boundary.
    fireEvent.click(screen.getByRole('tab', { name: /Composer/ }))
    expect(screen.getByRole('status')).toHaveTextContent('✓ All parts explored')
    fireEvent.click(screen.getByRole('button', { name: /got it, continue/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('treats a keyboard tab stop as a visit, so the gate is reachable without a mouse', () => {
    harness(<UiMockup title="Claude" rows={ROWS} />)
    fireEvent.focus(screen.getByRole('tab', { name: /Conversation/ }))
    fireEvent.focus(screen.getByRole('tab', { name: /Composer/ }))
    expect(screen.getByRole('status')).toHaveTextContent('✓ All parts explored')
  })

  it('satisfies a single-region mockup on mount, since its only part is already shown', () => {
    harness(<UiMockup title="Claude" rows={[[{ id: 'only', label: 'Only', detail: 'd' }]]} />)
    expect(screen.getByRole('button', { name: /got it, continue/i })).toHaveAttribute('aria-disabled', 'false')
  })

  it('does not lock a lesson when a mockup has no regions at all', () => {
    harness(<UiMockup title="Claude" rows={[]} />)
    expect(screen.getByRole('button', { name: /got it, continue/i })).toHaveAttribute('aria-disabled', 'false')
  })
})
