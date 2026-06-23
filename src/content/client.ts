// Runtime content client. graphl-ux ships no content of its own: the manifest,
// notebooks, and audio live in the apache-spark-content repo and are fetched at
// runtime from VITE_CONTENT_BASE_URL — a raw GitHub URL in prod, a local static
// server in dev. (Scenes are the exception: they stay bundled in src/scenes.)
//
// Set the base in an .env file (see .env.example). It defaults to the published
// raw GitHub URL so a plain `npm run build` needs no configuration.

import type { ModuleManifest } from './module.ts'
import type { NotebookJson } from './notebook.ts'

const DEFAULT_BASE = 'https://raw.githubusercontent.com/schemabotview/apache-spark-content/main'

// Trailing slash trimmed so `contentUrl` can join with a single '/'.
const BASE = (import.meta.env.VITE_CONTENT_BASE_URL ?? DEFAULT_BASE).replace(/\/+$/, '')

export interface Manifest {
  presentations: ModuleManifest[]
}

/** Resolve a content-repo-relative path (e.g. "audio/x.wav") to an absolute URL. */
export function contentUrl(path: string): string {
  return `${BASE}/${path.replace(/^\/+/, '')}`
}

async function fetchText(path: string): Promise<string> {
  const res = await fetch(contentUrl(path))
  if (!res.ok) throw new Error(`content fetch failed: ${path} (HTTP ${res.status})`)
  return res.text()
}

/** Fetch and parse the content manifest (wires modules → notebook + overlays). */
export async function fetchManifest(): Promise<Manifest> {
  return JSON.parse(await fetchText('manifest.json')) as Manifest
}

/** Fetch and parse a notebook by its manifest-relative path. */
export async function fetchNotebook(path: string): Promise<NotebookJson> {
  return JSON.parse(await fetchText(path)) as NotebookJson
}
