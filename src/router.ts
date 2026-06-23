// Minimal hash router — no dependency. The path after `#/` is the selected
// concept's id; an optional second segment is the module id; an optional third is
// the section slug (so a refresh restores the exact slide).
//
//   #/                                         -> { concept: '',  module: '',  section: '' }  (home / catalog)
//   #/apache-spark                             -> { concept: 'apache-spark', module: '',           section: '' }
//   #/apache-spark/02-rdd-api                  -> { concept: 'apache-spark', module: '02-rdd-api',  section: '' }
//   #/apache-spark/01-foundations/tungsten-…   -> { concept: 'apache-spark', module: '01-foundations', section: 'tungsten-…' }
//
// Hash routing keeps deep links refresh-safe on static hosting (no server
// rewrites) and gives Back/Forward for free.

import { useEffect, useState } from 'react'

/** A parsed hash route. `concept`, `module`, and `section` are '' when absent. */
export interface Route {
  concept: string
  module: string
  section: string
}

/** Parse the current hash into `{ concept, module, section }`. */
function readRoute(): Route {
  const path = window.location.hash.replace(/^#\/?/, '')
  const [concept = '', module = '', section = ''] = path.split('/')
  return { concept, module, section }
}

function toPath(conceptId: string, moduleId?: string, section?: string): string {
  if (!conceptId) return '/'
  if (!moduleId) return `/${conceptId}`
  return section ? `/${conceptId}/${moduleId}/${section}` : `/${conceptId}/${moduleId}`
}

/** Navigate to a concept + optional module + section, e.g. navigate('apache-spark', '02-rdd-api'). */
export function navigate(conceptId: string, moduleId?: string, section?: string): void {
  window.location.hash = toPath(conceptId, moduleId, section)
}

/**
 * Silently sync the URL to the current slide WITHOUT firing `hashchange` (so it
 * doesn't re-trigger route-driven effects or add a Back/Forward entry per slide).
 * Used to keep the address bar deep-linkable as the user pages.
 */
export function replaceRoute(conceptId: string, moduleId?: string, section?: string): void {
  history.replaceState(null, '', `#${toPath(conceptId, moduleId, section)}`)
}

/** Subscribe to the current route; re-renders on Back/Forward and navigate(). */
export function useRoute(): Route {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
