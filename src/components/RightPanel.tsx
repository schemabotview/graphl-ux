import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Section } from '../content/notebook.ts'
import { CheckIcon, CloseIcon, CopyIcon } from './icons.tsx'
import './panel.css'

// Pull the raw text out of a rendered <pre>'s children (highlight.js wraps tokens
// in nested spans, so we can't read a single string — walk the React tree).
function nodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props: { children?: React.ReactNode } }).props.children)
  }
  return ''
}

// <pre> override for every fenced (```) block — code, ASCII diagrams, plain text
// alike. Renders the original <pre> untouched (highlight.js tokens/styling intact)
// and floats a copy button in the top-right that writes the block's raw text to the
// clipboard, flipping to a check for ~1.5s.
function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const copy = async () => {
    const text = preRef.current?.innerText ?? nodeText(children)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked (insecure context / denied) — no-op */
    }
  }

  return (
    <div className="panel__codeblock">
      <button
        className={`panel__copy${copied ? ' is-copied' : ''}`}
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <pre {...props} ref={preRef}>
        {children}
      </pre>
    </div>
  )
}

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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{ pre: CodeBlock }}
        >
          {section.body}
        </ReactMarkdown>
      </article>
    </aside>
  )
}
