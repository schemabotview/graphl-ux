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

const sceneAudioFallback: Record<string, string> = {
  'spark-execution': 'audio/spark-execution.wav',
}

export default function App() {
  const route = useRoute()
  const concept = conceptById(route.concept)

  const { pages, allModules, status, error, pageIdx, setPageIdx, goto } =
    useContentNav(concept, route.module, route.section)

  const { panelOpen, setPanelOpen, panelWidth, startResize } = usePanelPrefs()
  const [showFull, setShowFull] = useState(false)

  const { audioRef, playing, setPlaying, progress, seek, nudge, onTimeUpdate } = useNarration(pageIdx)

  useEffect(() => setShowFull(false), [pageIdx])

  const [showHint, setShowHint] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPageIdx((i) => Math.min(pages.length - 1, i + 1))
      else if (e.key === 'ArrowLeft') setPageIdx((i) => Math.max(0, i - 1))
      else if (e.key === ',' || e.key === '<') nudge(-5)
      else if (e.key === '.' || e.key === '>') nudge(5)
      else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pages.length])

  const page = pages[pageIdx]
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
