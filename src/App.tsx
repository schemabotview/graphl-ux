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
import { ScrubBar } from './components/ScrubBar.tsx'
import { usePanelPrefs } from './hooks/usePanelPrefs.ts'
import { useNarration } from './hooks/useNarration.ts'
import { useContentNav } from './hooks/useContentNav.ts'

const sceneAudioFallback: Record<string, string> = {
  'spark-execution': 'audio/spark-execution.wav',
}

export default function App() {
  const route = useRoute()
  const concept = conceptById(route.concept)

  const {
    allModules,
    modulePages,
    page,
    pageInModule,
    status,
    error,
    next,
    prev,
    canPrev,
    canNext,
    atModuleEnd,
    gotoInModule,
  } = useContentNav(concept, route.module, route.section)

  const { panelOpen, setPanelOpen, panelWidth, startResize } = usePanelPrefs()
  const [showFull, setShowFull] = useState(false)

  // Per-page identity drives the narration clip reset (no global index any more).
  const pageKey = page ? `${page.moduleId}:${page.slug}` : ''
  const { audioRef, playing, setPlaying, progress, seekToFraction, nudge, onTimeUpdate } = useNarration(pageKey)

  useEffect(() => setShowFull(false), [pageKey])

  const [showHint, setShowHint] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === ',' || e.key === '<') nudge(-5)
      else if (e.key === '.' || e.key === '>') nudge(5)
      else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, nudge, setPlaying])

  const scene = page ? (scenes[page.sceneId] ?? Object.values(scenes)[0]) : undefined

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

  const handleClipEnded = () => {
    // Hands-free playthrough, bounded to the current module: advance within the module
    // on clip end, but stop at its last page rather than crossing the boundary.
    if (!atModuleEnd) next()
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
            canPrev={canPrev}
            canNext={canNext}
            showHint={showHint}
            playing={playing}
            playDisabled={!audioUrl}
            onPrev={prev}
            onNext={next}
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

          <ScrubBar progress={progress} onSeek={seekToFraction} />

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
        <RightPanel
          section={{ heading: page.heading, body: page.body }}
          index={pageInModule}
          headings={modulePages.map((p) => p.heading)}
          width={panelWidth}
          onJump={gotoInModule}
          onClose={() => setPanelOpen(false)}
          onResizeStart={startResize}
        />
      )}
    </div>
  )
}
