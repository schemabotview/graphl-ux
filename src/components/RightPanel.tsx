import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Section } from '../content/notebook.ts'
import './panel.css'

interface RightPanelProps {
  section: Section
  index: number
  count: number
  width: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onResizeStart: (e: React.PointerEvent) => void
}

// The content panel for one section: heading + Markdown body (prose, bullets,
// GFM tables, fenced code). Images are already stripped by the notebook parser.
// Resizable via the left-edge handle; the ◀ N/M ▶ stepper is a temporary preview
// affordance for judging fidelity (real per-section nav comes later).
export function RightPanel({
  section,
  index,
  count,
  width,
  onPrev,
  onNext,
  onClose,
  onResizeStart,
}: RightPanelProps) {
  return (
    <aside className="panel" style={{ flex: `0 0 ${width}px` }}>
      <div className="panel__resizer" onPointerDown={onResizeStart} />
      <header className="panel__head">
        <h2 className="panel__title">{section.heading.replace(/`/g, '')}</h2>
      </header>
      <article className="panel__body markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {section.body}
        </ReactMarkdown>
      </article>
      <div className="panel__nav">
        <button onClick={onPrev} disabled={index === 0} aria-label="Previous section">
          ◀
        </button>
        <span>
          {index + 1}/{count}
        </span>
        <button onClick={onNext} disabled={index === count - 1} aria-label="Next section">
          ▶
        </button>
        <button className="panel__close" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>
    </aside>
  )
}
