import { useEffect, useRef, useState } from 'react'
import { SceneViewer } from './engine/SceneViewer.tsx'
import { scenes } from './scenes/index.ts'
import { RightPanel } from './components/RightPanel.tsx'
import { buildPages, type ModuleManifest, type Page } from './content/module.ts'
import { contentUrl, fetchManifest, fetchNotebook } from './content/client.ts'
import { conceptById } from './content/catalog.ts'
import { replaceRoute, useRoute } from './router.ts'
import { Home } from './components/Home.tsx'
import { Header } from './components/Header.tsx'

// Narration is per-page: each slide wires its own clip via the manifest
// (`page.audio`, a content-repo-relative path resolved against
// VITE_CONTENT_BASE_URL at play time). Until per-section clips are generated,
// fall back to this per-scene map so the existing reel narration still plays.
// Remove the fallback once every section has its own `audio` in the manifest.
const sceneAudioFallback: Record<string, string> = {
  'spark-execution': 'audio/spark-execution.wav',
}

// Panel preference persisted across refreshes (localStorage — a viewing pref, not
// a shareable location). Width is clamped to the same floor the resize uses.
const PANEL_OPEN_KEY = 'graphl-ux:panelOpen'
const PANEL_WIDTH_KEY = 'graphl-ux:panelWidth'
const DEFAULT_PANEL_WIDTH = 520

function readPanelOpen(): boolean {
  try {
    return localStorage.getItem(PANEL_OPEN_KEY) === '1'
  } catch {
    return false
  }
}

function readPanelWidth(): number {
  try {
    const w = Number(localStorage.getItem(PANEL_WIDTH_KEY))
    return w >= 340 ? w : DEFAULT_PANEL_WIDTH
  } catch {
    return DEFAULT_PANEL_WIDTH
  }
}

// Slice D: the manifest drives navigation. Each `##` section is a Page wired to a
// scene; ◀▶ (panel stepper or arrow keys) swaps the scene, the panel content, the
// caption, and the audio together.
export default function App() {
  // The hash route selects the concept; `conceptById` resolves it to a catalog
  // entry (id + label + accent + content base URL). An empty/unknown route =
  // no concept = the home/catalog view.
  const route = useRoute()
  const concept = conceptById(route.concept)
  const moduleId = route.module
  const section = route.section

  const [pages, setPages] = useState<Page[]>([])
  const [allModules, setAllModules] = useState<ModuleManifest[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string>()

  const [pageIdx, setPageIdx] = useState(0)
  // Panel open/width are a personal viewing preference (not a shareable location),
  // so they persist in localStorage across refreshes rather than in the URL.
  const [panelOpen, setPanelOpen] = useState(() => readPanelOpen())
  const [panelWidth, setPanelWidth] = useState(() => readPanelWidth())

  const audioRef = useRef<HTMLAudioElement>(null)
  // Mirror `playing` in a ref so the page-change effect can read the live play
  // state without depending on it (else it would reset the clip on every toggle).
  const playingRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // One-time hint: flash the tap-zone chevrons on first load, then let them fade
  // (the zones themselves are invisible, so first-timers need a nudge).
  const [showHint, setShowHint] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2600)
    return () => clearTimeout(t)
  }, [])

  // Load the selected concept and flatten EVERY module into one continuous page
  // list, so paging runs straight across module boundaries (end of module 1 → start
  // of module 2) with no refetch. Re-runs only when the concept changes; switching
  // modules is just a jump within this list (see the jump effect below).
  useEffect(() => {
    if (!concept) return
    let cancelled = false
    setStatus('loading')
    setPageIdx(0)
    void (async () => {
      try {
        const manifest = await fetchManifest(concept.contentBaseUrl)
        const notebooks = await Promise.all(
          manifest.presentations.map((p) => fetchNotebook(p.notebook, concept.contentBaseUrl)),
        )
        if (cancelled) return
        const flat = manifest.presentations.flatMap((p, i) => buildPages(notebooks[i], p))
        setAllModules(manifest.presentations)
        setPages(flat)
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
  }, [concept])

  // Restore position from the route after content loads (refresh / deep link):
  // a `section` slug lands on that exact slide; a bare `module` lands on its first
  // page. Manual paging syncs the URL silently (below), so this fires only on an
  // explicit route change (☰ picker, Back/Forward, or a fresh refresh).
  useEffect(() => {
    if (pages.length === 0 || (!moduleId && !section)) return
    let idx = -1
    if (section) idx = pages.findIndex((p) => p.slug === section && (!moduleId || p.moduleId === moduleId))
    if (idx < 0 && moduleId) idx = pages.findIndex((p) => p.moduleId === moduleId)
    if (idx >= 0) setPageIdx(idx)
  }, [moduleId, section, pages])

  // Keep the address bar deep-linkable as the user pages: silently rewrite the URL
  // to the current slide (concept/module/slug). `replaceRoute` uses replaceState so
  // it neither fires `hashchange` (no effect loop) nor adds Back/Forward churn.
  useEffect(() => {
    if (pages.length === 0 || !concept) return
    const p = pages[pageIdx]
    if (p) replaceRoute(concept.id, p.moduleId, p.slug)
  }, [pageIdx, pages, concept])

  // Drive the <audio> element from the play state.
  useEffect(() => {
    playingRef.current = playing
    const a = audioRef.current
    if (!a) return
    if (playing) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [playing])

  // Navigating to a new slide starts its clip from the top but PRESERVES play
  // state: if narration was on, the next clip auto-plays; if paused, it stays
  // paused. (Read `playing` via the ref so this fires only on a page change, not
  // on every play/pause toggle.)
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    setProgress(0)
    if (playingRef.current) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [pageIdx])

  // Keyboard: ←/→ page through sections (horizontal scroll), Space toggles
  // play/pause — both work whether or not the panel is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPageIdx((i) => Math.min(pages.length - 1, i + 1))
      else if (e.key === 'ArrowLeft') setPageIdx((i) => Math.max(0, i - 1))
      else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault() // don't scroll the page (and don't double-fire a focused button)
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pages.length])

  // Persist the panel preference so a refresh restores it (see read helpers below).
  useEffect(() => {
    try {
      localStorage.setItem(PANEL_OPEN_KEY, panelOpen ? '1' : '0')
    } catch { /* storage unavailable (private mode) — preference just won't persist */ }
  }, [panelOpen])
  useEffect(() => {
    try {
      localStorage.setItem(PANEL_WIDTH_KEY, String(panelWidth))
    } catch { /* ignore */ }
  }, [panelWidth])

  // Derive the active page + scene once content has loaded.
  const page = pages[pageIdx]
  const scene = page ? (scenes[page.sceneId] ?? Object.values(scenes)[0]) : undefined

  // Dev scene preview: `#/preview/<sceneId>` renders any registered scene
  // standalone, with no content/manifest wiring — for authoring a scene before a
  // module points at it. An optional third segment frames a region the way a real
  // section will, e.g. `#/preview/spark-batch-api/b-rdd` — so chip legibility can
  // be judged at the camera zoom a learner actually sees, not the whole-wall fit.
  // Not linked from the UI; type the hash directly.
  if (route.concept === 'preview' && scenes[route.module]) {
    return (
      <div className="app-split">
        <div className="scene-pane">
          <div className="scene-frame">
            <SceneViewer
              key={route.module}
              scene={scenes[route.module]}
              focus={route.section || undefined}
            />
          </div>
        </div>
      </div>
    )
  }

  // Home / concept catalog (no concept in the route). Returning here also narrows
  // `concept` to defined for the content view below.
  if (!concept) return <Home />

  if (status === 'loading') return <div className="app-status">Loading content…</div>
  if (status === 'error')
    return (
      <div className="app-status app-status--error">
        Couldn’t load content.
        <span>{error}</span>
      </div>
    )
  if (!page || !scene) return <div className="app-status">No content.</div>

  const audioPath = page.audio ?? sceneAudioFallback[page.sceneId]
  const audioUrl = audioPath ? contentUrl(audioPath, concept.contentBaseUrl) : undefined

  const goto = (next: number) => setPageIdx(Math.min(pages.length - 1, Math.max(0, next)))

  // When a clip finishes during playback, auto-advance to the next slide and keep
  // playing — a hands-free playthrough. Bounded to the current module: at the module
  // boundary (or the very end) we stop instead of running away into the next topic.
  // (Play state stays true, so the page-change effect auto-plays the next clip.)
  const handleClipEnded = () => {
    const next = pageIdx + 1
    if (next < pages.length && pages[next].moduleId === page.moduleId) setPageIdx(next)
    else setPlaying(false)
  }

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
        {/* Screen-responsive stage: the frame fills the pane (wide on desktop,
            portrait on mobile); the scene fits within via the viewer's fitView. */}
        <div className="scene-frame">
          <SceneViewer
            key={page.sceneId}
            scene={scene}
            highlight={page.highlight}
            focus={page.focus}
          />

          <Header concept={concept} modules={allModules} activeModuleId={page.moduleId} />

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

          {/* Center tap zone (mobile only): tap the middle of the scene to
              play/pause, leaving the prev/next zones on the left/right thirds. */}
          <button
            className="scene-tapzone scene-tapzone--play"
            onClick={() => setPlaying((p) => !p)}
            disabled={!audioUrl}
            aria-label={playing ? 'Pause' : 'Play'}
          />

          <div className="scene-caption">
            {/* module · section — the user's place in the hierarchy. (Concept now
                lives in the top brand bar, so the old kicker line is dropped.) The
                counter rides the section line (the thing it actually counts). */}
            <h1>{page.moduleTitle}</h1>
            <p className="scene-caption__section">
              {page.heading.replace(/`/g, '')}
              <span className="scene-caption__count">
                {' '}· {page.moduleIndex + 1}/{page.moduleCount}
              </span>
            </p>
          </div>

          <div className="scene-controls">
            <button
              className="scene-playstate"
              onClick={(e) => {
                e.currentTarget.blur() // don't retain focus (Space drives play/pause globally)
                setPlaying((p) => !p)
              }}
              disabled={!audioUrl}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <button
              className="scene-iconbtn"
              onClick={(e) => {
                e.currentTarget.blur() // don't retain focus after toggling
                setPanelOpen((o) => !o)
              }}
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
            onEnded={handleClipEnded}
          />
        </div>
      </div>

      {panelOpen && (
        // Contents list is scoped to the CURRENT module (one notebook), not the flat
        // cross-module page list. The module's pages are contiguous, so its first
        // global index is pageIdx - page.moduleIndex; jumps map back by adding it.
        <RightPanel
          section={{ heading: page.heading, body: page.body }}
          index={page.moduleIndex}
          headings={pages
            .slice(pageIdx - page.moduleIndex, pageIdx - page.moduleIndex + page.moduleCount)
            .map((p) => p.heading)}
          width={panelWidth}
          onJump={(i) => goto(pageIdx - page.moduleIndex + i)}
          onClose={() => setPanelOpen(false)}
          onResizeStart={startResize}
        />
      )}
    </div>
  )
}
