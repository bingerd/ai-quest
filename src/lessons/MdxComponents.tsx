import type { MDXComponents } from 'mdx/types'
import { BeforeAfter } from '../ui/BeforeAfter'
import { ConceptCard } from '../ui/ConceptCard'
import { ConceptReveal } from '../ui/ConceptReveal'
import { InteractiveDiagram } from '../ui/InteractiveDiagram'
import { VendorTerm } from '../concepts/VendorTerm'

/** Components available inside every MDX lesson without imports. */
export const mdxComponents: MDXComponents = {
  ConceptCard,
  ConceptReveal,
  InteractiveDiagram,
  BeforeAfter,
  VendorTerm,
  // Lesson titles come from the training definition; an MDX h1 is a lead-in line.
  h1: (p) => <p className="text-xl font-semibold tracking-tight ink-1" {...p} />,
  h2: (p) => <h2 className="mt-8 text-xl font-semibold" {...p} />,
  h3: (p) => <h3 className="mt-6 text-lg font-semibold" {...p} />,
  p: (p) => <p className="leading-relaxed ink-2" {...p} />,
  ul: (p) => <ul className="list-disc space-y-1 pl-6 ink-2" {...p} />,
  ol: (p) => <ol className="list-decimal space-y-1 pl-6 ink-2" {...p} />,
  li: (p) => <li className="leading-relaxed" {...p} />,
  strong: (p) => <strong className="font-semibold ink-1" {...p} />,
  code: (p) => <code className="rounded surface-2 px-1.5 py-0.5 font-mono text-[0.9em]" {...p} />,
  pre: (p) => <pre className="overflow-x-auto rounded-xl surface-2 p-4 font-mono text-sm" {...p} />,
  // Tailwind's preflight resets anchors to inherit colour and decoration, so
  // without this the source links on the cheat-sheet lessons look like prose.
  a: (p) => <a className="text-brand-600 underline underline-offset-2 hover:no-underline" {...p} />,
  blockquote: (p) => <blockquote className="border-l-4 border-brand-400 pl-4 italic ink-2" {...p} />,
  table: (p) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" {...p} />
    </div>
  ),
  th: (p) => <th className="border-b line-strong px-2 py-1.5 text-left font-semibold" {...p} />,
  td: (p) => <td className="border-b line px-2 py-1.5 ink-2" {...p} />,
}
