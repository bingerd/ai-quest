// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { simulateSorting, type SortBucket, type SortItem } from '../simulation/sorting'
import { BucketSort } from './BucketSort'
import { OrderList } from './OrderList'

const buckets: SortBucket[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
]
const items: SortItem[] = [
  { id: '1', label: 'One', correctBucket: 'a', explanation: 'Because one.' },
  { id: '2', label: 'Two', correctBucket: 'b', explanation: 'Because two.' },
]

function Harness({ submitted = false }: { submitted?: boolean }) {
  const [placements, setPlacements] = useState<Record<string, string>>(submitted ? { '1': 'b', '2': 'b' } : {})
  const result = submitted ? simulateSorting({ buckets, items, placements }) : null
  return <BucketSort buckets={buckets} items={items} placements={placements} onPlace={(i, b) => setPlacements((p) => ({ ...p, [i]: b }))} result={result} />
}

afterEach(() => cleanup())

describe('BucketSort', () => {
  it('places items with the keyboard via radio groups', async () => {
    render(<Harness />)
    const group = screen.getByRole('radiogroup', { name: 'Where does "One" belong?' })
    const alpha = screen.getAllByRole('radio', { name: 'Alpha' })[0]!
    await userEvent.click(alpha)
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getAllByRole('radio', { name: 'Beta' })[0]).toBeChecked()
    expect(group).toBeInTheDocument()
    expect(screen.getByText('1 of 2 placed')).toBeInTheDocument()
  })

  it('locks and explains after submission', () => {
    render(<Harness submitted />)
    for (const r of screen.getAllByRole('radio')) expect(r).toBeDisabled()
    expect(screen.getByText('Not quite')).toBeInTheDocument()
    expect(screen.getByText(/Because one\./)).toBeInTheDocument()
  })
})

describe('OrderList', () => {
  function OrderHarness() {
    const [order, setOrder] = useState(['x', 'y', 'z'])
    return (
      <>
        <OrderList title="Blocks" items={[{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }, { id: 'z', label: 'Z' }]} order={order} onChange={setOrder} />
        <p data-testid="order">{order.join(',')}</p>
      </>
    )
  }

  it('moves items with buttons, disables edges and announces moves', async () => {
    render(<OrderHarness />)
    expect(screen.getByRole('button', { name: 'Move X up' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move Z down' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Move Z up' }))
    expect(screen.getByTestId('order').textContent).toBe('x,z,y')
    expect(screen.getByText('Z moved to position 2 of 3')).toBeInTheDocument()
  })
})
