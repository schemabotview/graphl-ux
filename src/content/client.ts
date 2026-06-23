// Runtime content client. graphl-ux ships no content of its own: each concept's
// manifest, notebooks, and audio live in that concept's content repo and are
// fetched at runtime. (Scenes are the exception: they stay bundled in src/scenes.)
//
// WHERE to fetch is per-concept routing config — it comes from the concept
// catalog (`catalog.ts`, `Concept.contentBaseUrl`). These functions therefore take
// a `base` URL. It defaults to VITE_CONTENT_BASE_URL (or the published Spark repo),
// which now serves only as a dev override / single-concept fallback — set it in an
// .env file (see .env.example) to point the default at a local static server.

import type { ModuleManifest } from './module.ts'
import type { NotebookJson } from './notebook.ts'

const DEFAULT_BASE = 'https://raw.githubusercontent.com/schemabotview/apache-spark-content/main'

// Fallback base when a caller doesn't pass a concept's base (dev override / the
// single-concept case). Trailing slash trimmed so `contentUrl` joins with one '/'.
const FALLBACK_BASE = (import.meta.env.VITE_CONTENT_BASE_URL ?? DEFAULT_BASE).replace(/\/+$/, '')

export interface Manifest {
  presentations: ModuleManifest[]
}

/**
 * Resolve a content-repo-relative path (e.g. "audio/x.wav") to an absolute URL
 * under `base` (a concept's `contentBaseUrl`; falls back to VITE_CONTENT_BASE_URL).
 */
export function contentUrl(path: string, base: string = FALLBACK_BASE): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

async function fetchText(path: string, base: string): Promise<string> {
  const res = await fetch(contentUrl(path, base))
  if (!res.ok) throw new Error(`content fetch failed: ${path} (HTTP ${res.status})`)
  return res.text()
}

/** Fetch and parse a concept's manifest (wires modules → notebook + overlays). */
export async function fetchManifest(base: string = FALLBACK_BASE): Promise<Manifest> {
  return JSON.parse(await fetchText('manifest.json', base)) as Manifest
}

/** Fetch and parse a notebook by its manifest-relative path within `base`. */
export async function fetchNotebook(path: string, base: string = FALLBACK_BASE): Promise<NotebookJson> {
  return JSON.parse(await fetchText(path, base)) as NotebookJson
}
