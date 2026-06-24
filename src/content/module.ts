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
  /** Scene node ids to spotlight for this section; the rest dim back. */
  highlight?: string[]
  /**
   * Scene node id(s) the camera frames for this section (`fitBounds` to their
   * union box). Absent → the camera fits the whole scene. This is the per-section
   * camera path that turns one big map into a guided walkthrough (mobile zooms to
   * the subsystem; desktop pans over it). Often the same id(s) as `highlight`.
   */
  focus?: string | string[]
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
  /** Scene node ids to spotlight for this section (rest dim back). */
  highlight?: string[]
  /** Scene node id(s) the camera frames for this section (whole scene if absent). */
  focus?: string | string[]
  // URL-safe id for the section, derived from the heading — used for refresh-safe
  // deep links (`#/<concept>/<module>/<slug>`). Stable across reordering.
  slug: string
  // Module identity, so a flat cross-module page list still knows where each page
  // belongs: the caption shows `moduleTitle`, the counter is `moduleIndex`/`moduleCount`.
  moduleId: string
  moduleTitle: string
  moduleIndex: number
  moduleCount: number
}

const norm = (h: string): string => h.toLowerCase().replace(/`/g, '').replace(/\s+/g, ' ').trim()

/** URL-safe slug for a section heading (refresh-safe deep-link id). */
export const sectionSlug = (h: string): string =>
  h
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Split the notebook into sections and apply the module overlay → Pages. */
export function buildPages(nb: NotebookJson, module: ModuleManifest): Page[] {
  const byHeading = new Map((module.sections ?? []).map((o) => [norm(o.heading), o]))
  const sections = parseNotebook(nb)
  return sections.map((s, i) => {
    const o = byHeading.get(norm(s.heading))
    return {
      heading: s.heading,
      body: s.body,
      sceneId: o?.scene ?? module.defaultScene ?? '',
      spine: o?.spine ?? false,
      audio: o?.audio,
      role: o?.role,
      highlight: o?.highlight,
      focus: o?.focus,
      slug: sectionSlug(s.heading),
      moduleId: module.id,
      moduleTitle: module.title,
      moduleIndex: i,
      moduleCount: sections.length,
    }
  })
}
