// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeStubTraining } from '../engine/fixtures'
import { clearTrainings, registerTraining } from '../engine/registry'
import { CataloguePage } from './CataloguePage'

function Location() {
  return <p data-testid="loc">{useLocation().search}</p>
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/" element={<><CataloguePage /><Location /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CataloguePage audience filter', () => {
  beforeEach(() => {
    clearTrainings()
    registerTraining({ ...makeStubTraining(), id: 'basics', title: 'Basics' })
    registerTraining({ ...makeStubTraining(), id: 'pro', title: 'Pro stuff', audience: 'power-user', level: 'intermediate', recommendedAfter: ['basics', 'missing'] })
  })
  afterEach(() => cleanup())

  it('shows all trainings, audience and level chips, and valid recommendations', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Basics' })).toBeInTheDocument()
    const pro = screen.getByRole('heading', { name: 'Pro stuff' }).closest('li')!
    expect(within(pro).getByText('For: Power users')).toBeInTheDocument()
    expect(within(pro).getByText('Intermediate')).toBeInTheDocument()
    expect(within(pro).getByRole('link', { name: 'Basics' })).toHaveAttribute('href', '/training/basics')
    // Only audiences that have trainings get a chip.
    expect(screen.queryByRole('button', { name: 'Engineers' })).not.toBeInTheDocument()
  })

  it('filters by audience and keeps it in the URL', async () => {
    renderAt('/')
    await userEvent.click(screen.getByRole('button', { name: 'Power users' }))
    expect(screen.queryByRole('heading', { name: 'Basics' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pro stuff' })).toBeInTheDocument()
    expect(screen.getByTestId('loc').textContent).toBe('?for=power-user')
    expect(screen.getByRole('button', { name: 'Power users' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByRole('heading', { name: 'Basics' })).toBeInTheDocument()
  })

  it('ignores unknown filter values', () => {
    renderAt('/?for=hackers')
    expect(screen.getByRole('heading', { name: 'Basics' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pro stuff' })).toBeInTheDocument()
  })
})
