import { parseNotebook, type NotebookJson } from './notebook.ts'

// A module = a notebook + a per-section overlay (from the manifest). The notebook
// is the source of truth for prose/code; the overlay only *wires* each `##`
// section to a scene, a spine flag, and (later) an audio clip. `buildPages`
// matches the two by normalized heading and emits normalized Pages.

export interface SectionOverlay {
  heading: string
  scene?: string
  spine?: boolean
  audio?: string
  role?: string
}

export interface ModuleManifest {
  id: string
  title: string
  notebook: string
  defaultScene?: string
  sections?: SectionOverlay[]
}

export interface Page {
  heading: string
  body: string
  sceneId: string
  spine: boolean
  audio?: string
  role?: string
}

const norm = (h: string): string => h.toLowerCase().replace(/`/g, '').replace(/\s+/g, ' ').trim()

/** Split the notebook into sections and apply the module overlay → Pages. */
export function buildPages(nb: NotebookJson, module: ModuleManifest): Page[] {
  const byHeading = new Map((module.sections ?? []).map((o) => [norm(o.heading), o]))
  return parseNotebook(nb).map((s) => {
    const o = byHeading.get(norm(s.heading))
    return {
      heading: s.heading,
      body: s.body,
      sceneId: o?.scene ?? module.defaultScene ?? '',
      spine: o?.spine ?? false,
      audio: o?.audio,
      role: o?.role,
    }
  })
}
