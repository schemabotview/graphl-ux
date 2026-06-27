import { useEffect, useState } from 'react'

// Panel open/width are a personal viewing preference (not a shareable location), so
// they persist in localStorage across refreshes rather than in the URL. Width is
// clamped to the same floor the drag-resize uses.
const PANEL_OPEN_KEY = 'graphl-ux:panelOpen'
const PANEL_WIDTH_KEY = 'graphl-ux:panelWidth'
const DEFAULT_PANEL_WIDTH = 520
const MIN_PANEL_WIDTH = 340

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
    return w >= MIN_PANEL_WIDTH ? w : DEFAULT_PANEL_WIDTH
  } catch {
    return DEFAULT_PANEL_WIDTH
  }
}

// Owns the content panel's open state + width: seeds them from localStorage, persists
// each change back, and provides the left-edge drag-resize handler. Returns only what
// the shell renders with — the storage keys and clamping stay private here.
export function usePanelPrefs() {
  const [panelOpen, setPanelOpen] = useState(() => readPanelOpen())
  const [panelWidth, setPanelWidth] = useState(() => readPanelWidth())

  // Persist each preference so a refresh restores it.
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

  // Drag the panel's left edge to resize (panel is on the right): width = distance
  // from the cursor to the right viewport edge, clamped MIN_PANEL_WIDTH–60vw.
  const startResize = (e: React.PointerEvent) => {
    e.preventDefault()
    const onMove = (ev: PointerEvent) => {
      const w = Math.min(Math.max(window.innerWidth - ev.clientX, MIN_PANEL_WIDTH), window.innerWidth * 0.6)
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

  return { panelOpen, setPanelOpen, panelWidth, startResize }
}
