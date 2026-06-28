import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Section } from '../content/notebook.ts'
import { CloseIcon } from './icons.tsx'
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
// tap-zones, so the panel has no stepper — the title itself is a dropdown (jump to
// any slide, mirroring the brand-bar concept switcher) and a bare close icon.
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
  const tocRef = useRef<HTMLDivElement>(null)

  // Esc closes the section dropdown (then, on a second press, isn't our concern).
  useEffect(() => {
    if (!tocOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTocOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tocOpen])

  // Click outside the title/dropdown closes it (matches the brand-bar pickers).
  useEffect(() => {
    if (!tocOpen) return
    const onDown = (e: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(e.target as Node)) setTocOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [tocOpen])

  const jump = (i: number) => {
    onJump(i)
    setTocOpen(false)
  }

  return (
    <aside className="panel" style={{ flex: `0 0 ${width}px` }}>
      <div className="panel__resizer" onPointerDown={onResizeStart} />
      <header className="panel__head">
        {/* Title doubles as the section picker — click to drop a list of every
            slide, mirroring the brand-bar concept dropdown. */}
        <div className="panel__title-wrap" ref={tocRef}>
          <button
            className="panel__title-btn"
            onClick={() => setTocOpen((o) => !o)}
            aria-expanded={tocOpen}
            aria-label="Jump to section"
          >
            <h2 className="panel__title">{section.heading.replace(/`/g, '')}</h2>
            <span className="panel__title-caret" aria-hidden>▾</span>
          </button>
          {tocOpen && (
            <div className="panel__toc" role="menu">
              <ol className="panel__toc-list">
                {headings.map((h, i) => (
                  <li key={i}>
                    <button
                      className={i === index ? 'is-active' : undefined}
                      role="menuitem"
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
        </div>
        {/* Bare close icon — same chrome as the left scene controls (scene-iconbtn). */}
        <button className="scene-iconbtn" onClick={onClose} aria-label="Close panel">
          <CloseIcon />
        </button>
      </header>
      <article className="panel__body markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {section.body}
        </ReactMarkdown>
      </article>
    </aside>
  )
}
