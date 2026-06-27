import { useEffect, useState } from 'react'
import { buildPages, type ModuleManifest, type Page } from '../content/module.ts'
import { fetchManifest, fetchNotebook } from '../content/client.ts'
import type { Concept } from '../content/catalog.ts'
import { replaceRoute } from '../router.ts'

// Map `items` through `fn` with at most `limit` calls in flight at once, returning
// results in the original order. A tiny worker-pool — keeps us from firing every
// notebook fetch in one concurrent burst (see the call site for why that matters).
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

// Owns the content/navigation state for a concept: fetches every module, flattens
// them into one continuous page list, tracks the current page index, restores the
// position from a deep link, and keeps the URL in sync as the user pages. The shell
// drives the index (keyboard, tap zones, clip auto-advance) via `goto`/`setPageIdx`;
// `moduleId`/`section` come from the route and seed the restore.
export function useContentNav(
  concept: Concept | undefined,
  moduleId: string,
  section: string,
) {
  const [pages, setPages] = useState<Page[]>([])
  const [allModules, setAllModules] = useState<ModuleManifest[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string>()
  const [pageIdx, setPageIdx] = useState(0)
  // Which concept the current `pages` belong to. Guards the URL-sync below so it never
  // writes the new concept's id against the previous concept's still-loaded pages
  // (which would corrupt the deep link the instant you switch concepts).
  const [loadedConceptId, setLoadedConceptId] = useState<string>()

  // Load the selected concept and flatten EVERY module into one continuous page list,
  // so paging runs straight across module boundaries (end of module 1 → start of
  // module 2) with no refetch. Re-runs only when the concept changes; switching
  // modules is just a jump within this list (see the restore effect below).
  useEffect(() => {
    if (!concept) return
    let cancelled = false
    setStatus('loading')
    setPageIdx(0)
    setPages([])
    setAllModules([])
    void (async () => {
      try {
        const manifest = await fetchManifest(concept.contentBaseUrl)
        // Fetch notebooks with a small concurrency cap rather than all at once:
        // bursting every module's notebook at raw.githubusercontent.com is what
        // provokes Fastly's intermittent transient rejections. Order is preserved so
        // `buildPages(notebooks[i], p)` below still lines up with `presentations[i]`.
        const notebooks = await mapWithConcurrency(
          manifest.presentations,
          3,
          (p) => fetchNotebook(p.notebook, concept.contentBaseUrl),
        )
        if (cancelled) return
        const flat = manifest.presentations.flatMap((p, i) => buildPages(notebooks[i], p))
        setAllModules(manifest.presentations)
        setPages(flat)
        setLoadedConceptId(concept.id)
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

  // Restore position from the route after content loads (refresh / deep link): a
  // `section` slug lands on that exact slide; a bare `module` lands on its first page.
  // Manual paging syncs the URL silently (below), so this fires only on an explicit
  // route change (☰ picker, Back/Forward, or a fresh refresh).
  useEffect(() => {
    if (pages.length === 0 || (!moduleId && !section)) return
    let idx = -1
    if (section) idx = pages.findIndex((p) => p.slug === section && (!moduleId || p.moduleId === moduleId))
    if (idx < 0 && moduleId) idx = pages.findIndex((p) => p.moduleId === moduleId)
    if (idx >= 0) setPageIdx(idx)
  }, [moduleId, section, pages])

  // Keep the address bar deep-linkable as the user pages: silently rewrite the URL to
  // the current slide (concept/module/slug). `replaceRoute` uses replaceState so it
  // neither fires `hashchange` (no effect loop) nor adds Back/Forward churn.
  useEffect(() => {
    if (pages.length === 0 || !concept || loadedConceptId !== concept.id) return
    const p = pages[pageIdx]
    if (p) replaceRoute(concept.id, p.moduleId, p.slug)
  }, [pageIdx, pages, concept, loadedConceptId])

  // Clamped index setter — the one way the shell moves between slides.
  const goto = (next: number) => setPageIdx(Math.min(pages.length - 1, Math.max(0, next)))

  return { pages, allModules, status, error, pageIdx, setPageIdx, goto }
}
