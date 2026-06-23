import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Section } from '../content/notebook.ts'
import './panel.css'

interface RightPanelProps {
  section: Section
  index: number
  count: number
  headings: string[]
  width: number
  onPrev: () => void
  onNext: () => void
  onJump: (index: number) => void
  onClose: () => void
  onResizeStart: (e: React.PointerEvent) => void
}

// The content panel for one section: heading + Markdown body (prose, bullets,
// GFM tables, fenced code). Images are already stripped by the notebook parser.
// Resizable via the left-edge handle. The N/M counter opens an overlay list of
// all sections (the "contents" jump); ◀▶ step one at a time.
export function RightPanel({
  section,
  index,
  count,
  headings,
  width,
  onPrev,
  onNext,
  onJump,
  onClose,
  onResizeStart,
}: RightPanelProps) {
  const [tocOpen, setTocOpen] = useState(false)

  // Esc closes the contents list (then, on a second press, isn't our concern).
  useEffect(() => {
    if (!tocOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTocOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tocOpen])

  const jump = (i: number) => {
    onJump(i)
    setTocOpen(false)
  }

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

      {tocOpen && (
        <div className="panel__toc">
          <div className="panel__toc-head">
            <span>Contents</span>
            <button onClick={() => setTocOpen(false)} aria-label="Close contents">
              ✕
            </button>
          </div>
          <ol className="panel__toc-list">
            {headings.map((h, i) => (
              <li key={i}>
                <button
                  className={i === index ? 'is-active' : undefined}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => jump(i)}
                >
                  <span className="panel__toc-num">{i + 1}</span>
                  <span className="panel__toc-text">{h.replace(/`/g, '')}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="panel__nav">
        <button onClick={onPrev} disabled={index === 0} aria-label="Previous section">
          ◀
        </button>
        <button
          className="panel__count"
          onClick={() => setTocOpen((o) => !o)}
          aria-expanded={tocOpen}
          aria-label="Show all sections"
        >
          {index + 1}/{count}
        </button>
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
