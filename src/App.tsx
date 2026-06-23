import { useEffect, useRef, useState } from 'react'
import { SceneViewer } from './engine/SceneViewer.tsx'
import { scenes } from './scenes/index.ts'
import { RightPanel } from './components/RightPanel.tsx'
import { buildPages, type Page } from './content/module.ts'
import { contentUrl, fetchManifest, fetchNotebook } from './content/client.ts'

// Narration is per-page: each slide wires its own clip via the manifest
// (`page.audio`, a content-repo-relative path resolved against
// VITE_CONTENT_BASE_URL at play time). Until per-section clips are generated,
// fall back to this per-scene map so the existing reel narration still plays.
// Remove the fallback once every section has its own `audio` in the manifest.
const sceneAudioFallback: Record<string, string> = {
  'spark-execution': 'audio/spark-execution.wav',
}

// Slice D: the manifest drives navigation. Each `##` section is a Page wired to a
// scene; ◀▶ (panel stepper or arrow keys) swaps the scene, the panel content, the
// caption, and the audio together.
export default function App() {
  const [pages, setPages] = useState<Page[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string>()

  const [pageIdx, setPageIdx] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(520)

  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // One-time hint: flash the tap-zone chevrons on first load, then let them fade
  // (the zones themselves are invisible, so first-timers need a nudge).
  const [showHint, setShowHint] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2600)
    return () => clearTimeout(t)
  }, [])

  // Load the manifest + first module's notebook from the content repo on mount.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const manifest = await fetchManifest()
        const module = manifest.presentations[0]
        const nb = await fetchNotebook(module.notebook)
        if (cancelled) return
        setPages(buildPages(nb, module))
        setStatus('ready')
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Drive the <audio> element from the play state.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (playing) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [playing])

  // Navigating resets playback (the clip belongs to a scene/section).
  useEffect(() => {
    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
    }
    setPlaying(false)
    setProgress(0)
  }, [pageIdx])

  // Arrow keys page through sections whether or not the panel is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPageIdx((i) => Math.min(pages.length - 1, i + 1))
      else if (e.key === 'ArrowLeft') setPageIdx((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pages.length])

  // Derive the active page + scene once content has loaded.
  const page = pages[pageIdx]
  const scene = page ? (scenes[page.sceneId] ?? Object.values(scenes)[0]) : undefined

  if (status === 'loading') return <div className="app-status">Loading content…</div>
  if (status === 'error')
    return (
      <div className="app-status app-status--error">
        Couldn’t load content.
        <span>{error}</span>
      </div>
    )
  if (!page || !scene) return <div className="app-status">No content.</div>

  const topicLabel = scene.topic.replace(/-/g, ' ').toUpperCase()
  const audioPath = page.audio ?? sceneAudioFallback[page.sceneId]
  const audioUrl = audioPath ? contentUrl(audioPath) : undefined

  const goto = (next: number) => setPageIdx(Math.min(pages.length - 1, Math.max(0, next)))

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current
    if (!a || !a.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
  }

  // Drag the panel's left edge to resize (panel is on the right).
  const startResize = (e: React.PointerEvent) => {
    e.preventDefault()
    const onMove = (ev: PointerEvent) => {
      const w = Math.min(Math.max(window.innerWidth - ev.clientX, 340), window.innerWidth * 0.6)
      setPanelWidth(w)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.classList.remove('resizing')
    }
    document.body.classList.add('resizing')
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className="app-split">
      <div className="scene-pane">
        <div className="scene-frame">
          <SceneViewer key={page.sceneId} scene={scene} />

          {/* Story-style tap zones (mobile only — desktop pages with arrow keys):
              left third = prev, right third = next, upper area so the bottom
              caption/controls stay tappable. Rendered only when a step exists,
              so there are no dead taps at the ends. */}
          {pageIdx > 0 && (
            <button
              className="scene-tapzone scene-tapzone--prev"
              onClick={() => goto(pageIdx - 1)}
              aria-label="Previous slide"
            >
              {showHint && <span className="scene-tapzone__hint">‹</span>}
            </button>
          )}
          {pageIdx < pages.length - 1 && (
            <button
              className="scene-tapzone scene-tapzone--next"
              onClick={() => goto(pageIdx + 1)}
              aria-label="Next slide"
            >
              {showHint && <span className="scene-tapzone__hint">›</span>}
            </button>
          )}

          <div className="scene-caption">
            <span className="scene-caption__kicker">
              {topicLabel} · {pageIdx + 1}/{pages.length}
            </span>
            <h1>{scene.title}</h1>
            {scene.subtitle && <p>{scene.subtitle}</p>}
          </div>

          <div className="scene-controls">
            <button
              className="scene-playstate"
              onClick={() => setPlaying((p) => !p)}
              disabled={!audioUrl}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <button
              className="scene-iconbtn"
              onClick={() => setPanelOpen((o) => !o)}
              aria-pressed={panelOpen}
              aria-label="Toggle content panel"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <line x1="14" y1="5" x2="14" y2="19" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          </div>

          <div className="scene-progress" onClick={seek}>
            <div className="scene-progress__fill" style={{ width: `${progress * 100}%` }} />
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            onTimeUpdate={(e) => {
              const a = e.currentTarget
              setProgress(a.duration > 0 ? a.currentTime / a.duration : 0)
            }}
            onEnded={() => setPlaying(false)}
          />
        </div>
      </div>

      {panelOpen && (
        <RightPanel
          section={{ heading: page.heading, body: page.body }}
          index={pageIdx}
          count={pages.length}
          headings={pages.map((p) => p.heading)}
          width={panelWidth}
          onPrev={() => goto(pageIdx - 1)}
          onNext={() => goto(pageIdx + 1)}
          onJump={goto}
          onClose={() => setPanelOpen(false)}
          onResizeStart={startResize}
        />
      )}
    </div>
  )
}
