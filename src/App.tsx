import { useEffect, useState } from 'react'
import { SceneViewer } from './engine/SceneViewer.tsx'
import { scenes } from './scenes/index.ts'
import { RightPanel } from './components/RightPanel.tsx'
import { contentUrl } from './content/client.ts'
import { conceptById } from './content/catalog.ts'
import { useRoute } from './router.ts'
import { Home } from './components/Home.tsx'
import { Header } from './components/Header.tsx'
import { ReelCaption } from './components/ReelCaption.tsx'
import { ReelControls } from './components/ReelControls.tsx'
import { TapZones } from './components/TapZones.tsx'
import { usePanelPrefs } from './hooks/usePanelPrefs.ts'
import { useNarration } from './hooks/useNarration.ts'
import { useContentNav } from './hooks/useContentNav.ts'

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
  // The hash route selects the concept; `conceptById` resolves it to a catalog
  // entry (id + label + accent + content base URL). An empty/unknown route =
  // no concept = the home/catalog view.
  const route = useRoute()
  const concept = conceptById(route.concept)

  // Content + navigation (page list, current index, deep-link restore, URL sync) live
  // in a hook; the shell drives the index via goto/setPageIdx below.
  const { pages, allModules, status, error, pageIdx, setPageIdx, goto } =
    useContentNav(concept, route.module, route.section)

  // Panel open/width + drag-resize live in a hook (persisted to localStorage — a
  // personal viewing preference, not a shareable location, so kept out of the URL).
  const { panelOpen, setPanelOpen, panelWidth, startResize } = usePanelPrefs()
  // "Show full scene" — momentarily suppress the section's spotlight/focus so the
  // learner can read the whole map. Per-step (resets on page change below), NOT a
  // persisted preference: the authored narration spotlight should return on the
  // next slide.
  const [showFull, setShowFull] = useState(false)

  // Narration <audio> (ref + play/progress + clip reset on page change) lives in a
  // hook; the shell still owns navigation (handleClipEnded, keyboard) below.
  const { audioRef, playing, setPlaying, progress, seek, onTimeUpdate } = useNarration(pageIdx)

  // Each new slide reasserts its authored spotlight — a scene concern, so it stays in
  // the shell rather than in the narration hook.
  useEffect(() => setShowFull(false), [pageIdx])

  // One-time hint: flash the tap-zone chevrons on first load, then let them fade
  // (the zones themselves are invisible, so first-timers need a nudge).
  const [showHint, setShowHint] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2600)
    return () => clearTimeout(t)
  }, [])

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

  // When a clip finishes during playback, auto-advance to the next slide and keep
  // playing — a hands-free playthrough. Bounded to the current module: at the module
  // boundary (or the very end) we stop instead of running away into the next topic.
  // (Play state stays true, so the page-change effect auto-plays the next clip.)
  const handleClipEnded = () => {
    const next = pageIdx + 1
    if (next < pages.length && pages[next].moduleId === page.moduleId) setPageIdx(next)
    else setPlaying(false)
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
            highlight={showFull ? undefined : page.highlight}
            focus={showFull ? undefined : page.focus}
          />

          <Header concept={concept} modules={allModules} activeModuleId={page.moduleId} />

          <TapZones
            canPrev={pageIdx > 0}
            canNext={pageIdx < pages.length - 1}
            showHint={showHint}
            playing={playing}
            playDisabled={!audioUrl}
            onPrev={() => goto(pageIdx - 1)}
            onNext={() => goto(pageIdx + 1)}
            onTogglePlay={() => setPlaying((p) => !p)}
          />

          <ReelCaption
            moduleTitle={page.moduleTitle}
            heading={page.heading}
            moduleIndex={page.moduleIndex}
            moduleCount={page.moduleCount}
          />

          <ReelControls
            canShowFull={Boolean(page.highlight?.length || page.focus)}
            showFull={showFull}
            playing={playing}
            playDisabled={!audioUrl}
            panelOpen={panelOpen}
            onToggleShowFull={() => setShowFull((f) => !f)}
            onTogglePlay={() => setPlaying((p) => !p)}
            onTogglePanel={() => setPanelOpen((o) => !o)}
          />

          <div className="scene-progress" onClick={seek}>
            <div className="scene-progress__fill" style={{ width: `${progress * 100}%` }} />
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            onTimeUpdate={onTimeUpdate}
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
