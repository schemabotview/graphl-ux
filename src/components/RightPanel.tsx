import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Section } from '../content/notebook.ts'
import './panel.css'

interface RightPanelProps {
  section: Section
  index: number
  headings: string[]
  width: number
  onJump: (index: number) => void
  onClose: () => void
  onResizeStart: (e: React.PointerEvent) => void
}

// The content panel for one section: heading + Markdown body (prose, bullets,
// GFM tables, fenced code). Images are already stripped by the notebook parser.
// Resizable via the left-edge handle. Paging is owned by ←/→ and the mobile
// tap-zones, so the panel has no stepper — just a top-right contents list (jump to
// any slide) and a close button.
export function RightPanel({
  section,
  index,
  headings,
  width,
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
        <div className="panel__head-actions">
          <button
            className="panel__headbtn"
            onClick={() => setTocOpen((o) => !o)}
            aria-expanded={tocOpen}
            aria-label="All slides"
          >
            {/* Contents (bulleted-list) icon — distinct from the brand-bar ☰, which
                switches modules. This jumps to any slide within the reading. */}
            <svg viewBox="0 0 24 24" fill="none" width={18} height={18} aria-hidden>
              <circle cx="5" cy="7" r="1.4" fill="currentColor" />
              <circle cx="5" cy="12" r="1.4" fill="currentColor" />
              <circle cx="5" cy="17" r="1.4" fill="currentColor" />
              <line x1="9" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="9" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="9" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button className="panel__headbtn" onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>
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

    </aside>
  )
}
