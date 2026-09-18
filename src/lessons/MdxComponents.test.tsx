// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { MDXProvider } from '@mdx-js/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import TokenLesson from '../trainings/token-management/lessons/02-what-is-a-token.mdx'
import { mdxComponents } from './MdxComponents'

afterEach(cleanup)

/** Every lesson, plus its raw source, so we can tell which ones author a table. */
const modules = import.meta.glob('../trainings/*/lessons/*.mdx', { eager: true }) as Record<
  string,
  { default: React.ComponentType }
>
// The MDX plugin claims `?raw` imports, so read the authored source from disk.
const sources = Object.fromEntries(
  Object.keys(modules).map((path) => [path, readFileSync(new URL(path, import.meta.url), 'utf8')]),
)

/** A GFM header divider: `| --- | :---: |`. One per authored table. */
const TABLE_DIVIDER = /^\|(?:\s*:?-+:?\s*\|)+[ \t]*$/gm
const tableCount = (source: string) => (source.match(TABLE_DIVIDER) ?? []).length
const withTables = Object.keys(sources).filter((path) => tableCount(sources[path] ?? '') > 0)

function renderLesson(Lesson: React.ComponentType) {
  render(
    <MDXProvider components={mdxComponents}>
      <Lesson />
    </MDXProvider>,
  )
}

describe('MDX lesson tables', () => {
  it('finds lessons that author markdown tables', () => {
    // Guards the suite below against silently testing nothing.
    expect(withTables.length).toBeGreaterThan(0)
  })

  it('renders a markdown table as a real table, not literal pipes', () => {
    renderLesson(TokenLesson)

    expect(screen.getByRole('table')).not.toBeNull()
    expect(screen.getByRole('columnheader', { name: 'Simulated tokens' })).not.toBeNull()
    expect(screen.getByRole('cell', { name: 'One English word' })).not.toBeNull()
    expect(document.body.textContent).not.toMatch(/\|\s*---\s*\|/)
  })

  it('renders markdown links as visibly styled anchors', async () => {
    const { default: CheatSheet } = await import(
      '../trainings/everyday-claude/lessons/05-cheat-sheet.mdx'
    )
    renderLesson(CheatSheet)

    const link = screen.getByRole('link', { name: 'Projects' })
    expect(link).toHaveAttribute('href', expect.stringContaining('support.claude.com'))
    expect(link.className).toMatch(/underline/)
  })

  it.each(withTables)('renders every authored table in %s', (path) => {
    const Lesson = modules[path]?.default
    expect(Lesson).toBeDefined()
    renderLesson(Lesson!)

    const expected = tableCount(sources[path] ?? '')
    expect(screen.getAllByRole('table')).toHaveLength(expected)
    // A pipe divider left in the text means the table fell through as prose.
    expect(document.body.textContent).not.toMatch(/\|\s*---\s*\|/)
  })
})
