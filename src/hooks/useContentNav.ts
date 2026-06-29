import { useEffect, useRef, useState } from 'react'
import { buildPages, type ModuleManifest, type Page } from '../content/module.ts'
import { fetchManifest, fetchNotebook } from '../content/client.ts'
import type { Concept } from '../content/catalog.ts'
import { replaceRoute } from '../router.ts'

// Where a pending position lands once the current module's pages are available:
// a section slug (deep link / ☰), or a module edge (start when paging forward into
// a module, end when paging backward into one). Resolved by effect (4) below.
type PendingTarget = { section?: string; edge?: 'start' | 'end' }

// Owns the content/navigation state for a concept, addressed as (module, pageInModule)
// rather than one flat index. Only the manifest + the CURRENT module's notebook are
// fetched up front; the immediate neighbors are prefetched in the background so
// crossing a module boundary is instant. This replaces the old "fetch every module's
// notebook at once" load, whose burst at raw.githubusercontent.com intermittently
// drew transient HTTP 400s. `routeModuleId`/`routeSection` come from the route and
// drive explicit module switches (☰ picker, deep link, Back/Forward); internal paging
// moves position directly and rewrites the URL silently (no hashchange → no loop).
export function useContentNav(
  concept: Concept | undefined,
  routeModuleId: string,
  routeSection: string,
) {
  const [allModules, setAllModules] = useState<ModuleManifest[]>([])
  // Loaded modules only, keyed by module id — filled lazily as the user reaches them.
  // cacheRef mirrors `cache` so the async loader (and `goToModule`) can read the
  // latest without re-subscribing; both are always written together via `putModule`.
  const [cache, setCache] = useState<Record<string, Page[]>>({})
  const cacheRef = useRef<Record<string, Page[]>>({})
  const [curModuleId, setCurModuleId] = useState('')
  const [pageInModule, setPageInModule] = useState(0)
  const [pending, setPending] = useState<PendingTarget | null>(null)
  const [error, setError] = useState<string>()
  // Which concept `cache`/`allModules` belong to. Guards the route + URL-sync effects
  // so they never act on a stale concept's data the instant you switch concepts.
  const [loadedConceptId, setLoadedConceptId] = useState<string>()

  const putModule = (id: string, pages: Page[]) => {
    cacheRef.current = { ...cacheRef.current, [id]: pages }
    setCache(cacheRef.current)
  }

  const moduleIndex = (id: string) => allModules.findIndex((m) => m.id === id)

  // (1) Concept change → reset, fetch the (cheap) manifest, and pick the start module
  // (the deep-linked module, else the first). The start module's notebook is loaded by
  // the loader effect (3). routeModuleId/routeSection are read once here to seed the
  // deep link; later route changes are owned by effect (2).
  useEffect(() => {
    if (!concept) return
    let cancelled = false
    cacheRef.current = {}
    setCache({})
    setError(undefined)
    setAllModules([])
    setCurModuleId('')
    setPageInModule(0)
    setPending(null)
    void (async () => {
      try {
        const manifest = await fetchManifest(concept.contentBaseUrl)
        if (cancelled) return
        const mods = manifest.presentations
        const start =
          routeModuleId && mods.some((m) => m.id === routeModuleId)
            ? routeModuleId
            : mods[0]?.id ?? ''
        setAllModules(mods)
        setLoadedConceptId(concept.id)
        setPending(routeSection ? { section: routeSection } : { edge: 'start' })
        setCurModuleId(start)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [concept])

  // (2) Explicit route change (☰ picker, deep link, Back/Forward) → select that module
  // + section. Internal paging rewrites the URL via replaceState (no hashchange), so
  // `routeModuleId`/`routeSection` change ONLY on an explicit nav — this never fights
  // paging. (On mount it re-asserts the deep link once `allModules` arrives.)
  useEffect(() => {
    if (!concept || loadedConceptId !== concept.id) return
    if (!routeModuleId || !allModules.some((m) => m.id === routeModuleId)) return
    setPending(routeSection ? { section: routeSection } : { edge: 'start' })
    setCurModuleId(routeModuleId)
  }, [routeModuleId, routeSection, allModules, loadedConceptId, concept])

  // (3) Ensure the current module's notebook is loaded, then prefetch its neighbors so
  // a boundary cross is instant. Neighbor failures are swallowed — they'll surface
  // (and retry) if/when that module is actually navigated to.
  useEffect(() => {
    if (!concept || !curModuleId || allModules.length === 0) return
    let cancelled = false
    const ensure = async (id: string): Promise<void> => {
      if (!id || cacheRef.current[id]) return
      const mod = allModules.find((m) => m.id === id)
      if (!mod) return
      const nb = await fetchNotebook(mod.notebook, concept.contentBaseUrl)
      if (cancelled || loadedConceptId !== concept.id) return
      putModule(id, buildPages(nb, mod))
    }
    void (async () => {
      try {
        await ensure(curModuleId)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
        return
      }
      if (cancelled) return
      const i = moduleIndex(curModuleId)
      void ensure(allModules[i - 1]?.id ?? '').catch(() => {})
      void ensure(allModules[i + 1]?.id ?? '').catch(() => {})
    })()
    return () => {
      cancelled = true
    }
  }, [concept, curModuleId, allModules, loadedConceptId])

  // (4) Resolve a pending position once the current module's pages are available
  // (fired on load, since `cache` is a dep). A section slug lands on that slide; the
  // `end` edge lands on the last page (paged backward into the module); else page 0.
  useEffect(() => {
    if (!pending) return
    const pages = cache[curModuleId]
    if (!pages) return
    let idx = 0
    if (pending.section) {
      const found = pages.findIndex((p) => p.slug === pending.section)
      idx = found >= 0 ? found : 0
    } else if (pending.edge === 'end') {
      idx = pages.length - 1
    }
    setPageInModule(idx)
    setPending(null)
  }, [pending, cache, curModuleId])

  const modulePages = cache[curModuleId] ?? []
  const page: Page | undefined = modulePages[pageInModule]

  // (5) Keep the address bar deep-linkable as the user pages — silently (replaceState).
  // Skipped while a position is pending so it never writes a stale slug mid-resolve.
  useEffect(() => {
    if (!concept || loadedConceptId !== concept.id || pending || !page) return
    replaceRoute(concept.id, page.moduleId, page.slug)
  }, [page, pending, concept, loadedConceptId])

  // Jump to another module at a given edge — instant when cached (the common case,
  // thanks to neighbor prefetch); otherwise the loader effect + (4) resolve it.
  const goToModule = (modId: string, edge: 'start' | 'end') => {
    setCurModuleId(modId)
    const pages = cacheRef.current[modId]
    if (edge === 'start') {
      setPageInModule(0)
      setPending(null)
    } else if (pages) {
      setPageInModule(pages.length - 1)
      setPending(null)
    } else {
      setPending({ edge: 'end' })
    }
  }

  const next = () => {
    if (pageInModule < modulePages.length - 1) {
      setPageInModule(pageInModule + 1)
      return
    }
    const i = moduleIndex(curModuleId)
    if (i >= 0 && i < allModules.length - 1) goToModule(allModules[i + 1].id, 'start')
  }

  const prev = () => {
    if (pageInModule > 0) {
      setPageInModule(pageInModule - 1)
      return
    }
    const i = moduleIndex(curModuleId)
    if (i > 0) goToModule(allModules[i - 1].id, 'end')
  }

  // Jump within the current module (the content panel's section list).
  const gotoInModule = (i: number) =>
    setPageInModule(Math.min(modulePages.length - 1, Math.max(0, i)))

  const i = moduleIndex(curModuleId)
  const canPrev = pageInModule > 0 || i > 0
  const canNext = pageInModule < modulePages.length - 1 || (i >= 0 && i < allModules.length - 1)
  // At the last page of the current module — clip auto-advance stops here rather than
  // crossing the boundary (a module is one hands-free playthrough, as before).
  const atModuleEnd = pageInModule >= modulePages.length - 1

  const status: 'loading' | 'ready' | 'error' = error
    ? 'error'
    : allModules.length > 0 && Boolean(cache[curModuleId]) && Boolean(page)
      ? 'ready'
      : 'loading'

  return {
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
  }
}
