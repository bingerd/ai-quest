// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeLiveChecklist } from '../../../lessons/factories/liveChecklist'
import { AudienceCheck } from './AudienceCheck'
import { NextTokenGame } from './NextTokenGame'

afterEach(cleanup)

describe('NextTokenGame', () => {
  it('unlocks Continue after two different sentences', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<NextTokenGame onComplete={onComplete} completed={false} />)
    const cont = () => screen.getByRole('button', { name: /continue/i })
    expect(cont()).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /^email/ }))
    await user.click(screen.getByRole('button', { name: /^\.\s*55%/ }))
    await user.click(screen.getByRole('button', { name: /new sentence/i }))
    await user.click(screen.getByRole('button', { name: /^time/ }))
    await user.click(screen.getByRole('button', { name: /^yesterday/ }))

    expect(cont()).toBeEnabled()
    await user.click(cont())
    expect(onComplete).toHaveBeenCalledOnce()
  })
})

describe('AudienceCheck', () => {
  it('suggests a track once every question is answered', async () => {
    const user = userEvent.setup()
    render(<AudienceCheck onComplete={() => {}} completed={false} />)
    for (const label of [/writing and reviewing code/i, /every day/i, /all the time/i, /written my own skills/i]) await user.click(screen.getByText(label))
    expect(screen.getByRole('status')).toHaveTextContent('Builders')
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })
})

describe('makeLiveChecklist', () => {
  it('needs every step ticked', async () => {
    const user = userEvent.setup()
    const List = makeLiveChecklist({ intro: 'Do it', items: [{ id: 'a', label: 'First' }, { id: 'b', label: 'Second' }] })
    render(<List onComplete={() => {}} completed={false} />)
    await user.click(screen.getByRole('checkbox', { name: /first/i }))
    expect(screen.getByRole('button', { name: /tick every step/i })).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: /second/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })
})
