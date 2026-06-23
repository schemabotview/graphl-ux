// Minimal hash router — no dependency. The path after `#/` is the selected
// concept's id; an optional second segment is the module id.
//
//   #/                          -> { concept: '',             module: '' }  (home / catalog)
//   #/apache-spark              -> { concept: 'apache-spark', module: '' }  (concept, first module)
//   #/apache-spark/02-rdd-api   -> { concept: 'apache-spark', module: '02-rdd-api' }
//
// Hash routing keeps deep links refresh-safe on static hosting (no server
// rewrites) and gives Back/Forward for free.

import { useEffect, useState } from 'react'

/** A parsed hash route. `concept` and `module` are '' when absent. */
export interface Route {
  concept: string
  module: string
}

/** Parse the current hash into `{ concept, module }`. */
function readRoute(): Route {
  const path = window.location.hash.replace(/^#\/?/, '')
  const [concept = '', module = ''] = path.split('/')
  return { concept, module }
}

/** Navigate to a concept + optional module, e.g. navigate('apache-spark', '02-rdd-api'). */
export function navigate(conceptId: string, moduleId?: string): void {
  if (!conceptId) { window.location.hash = '/'; return }
  window.location.hash = moduleId ? `/${conceptId}/${moduleId}` : `/${conceptId}`
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
