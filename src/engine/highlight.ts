// Syntax highlighting for `code` nodes. Uses highlight.js core with only the
// grammars we actually author, so the bundle stays small (the full highlight.js
// pulls every language). The TOKEN THEME is graphl-ux's existing one —
// `atom-one-dark`, imported once globally in `src/main.tsx` (and reused by the
// content panel). We deliberately do NOT import a theme here, so code nodes and
// the panel share the single app theme.
//
// To support a new language: import its grammar, registerLanguage it, and add it
// to REGISTERED — that's the whole change.
import hljs from 'highlight.js/lib/core'
import scala from 'highlight.js/lib/languages/scala'

hljs.registerLanguage('scala', scala)

const REGISTERED = new Set(['scala'])

/**
 * Highlight a code snippet to HTML (hljs token spans). `lang` defaults to scala;
 * an unregistered language falls back to scala so a render never throws.
 */
export function highlightCode(code: string, lang = 'scala'): string {
  const language = REGISTERED.has(lang) ? lang : 'scala'
  return hljs.highlight(code, { language, ignoreIllegals: true }).value
}
