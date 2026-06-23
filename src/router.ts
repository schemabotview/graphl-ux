// Minimal hash router — no dependency. The path after `#/` is the selected
// concept's id; empty means the home (the concept catalog).
//
//   #/                 -> { concept: '' }             (home / catalog)
//   #/apache-spark     -> { concept: 'apache-spark' } (that concept's content)
//
// Hash routing keeps deep links refresh-safe on static hosting (no server
// rewrites) and gives Back/Forward for free. Only the *concept* lives in the URL
// for now; the module/section position stays in-app state (pageIdx).

import { useEffect, useState } from 'react'

/** A parsed hash route. `concept` is '' when absent (home). */
export interface Route {
  concept: string
}

/** Parse the current hash into `{ concept }`. */
function readRoute(): Route {
  const path = window.location.hash.replace(/^#\/?/, '')
  const [concept = ''] = path.split('/')
  return { concept }
}

/** Navigate to a concept (or '' for home), e.g. navigate('apache-spark'). */
export function navigate(conceptId: string): void {
  window.location.hash = conceptId ? `/${conceptId}` : '/'
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
