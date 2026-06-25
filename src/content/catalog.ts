// The concept catalog — the app's registry of which concepts exist and where to
// fetch each one's content. This lives in graphl-ux (NOT a content repo) on
// purpose:
//   - It spans concepts, so no single per-concept content repo owns it.
//   - The per-concept content base URL is app *routing config*, not content.
//   - Adding a concept is already an app-release event (its scenes are authored
//     here as TS), so the catalog living here introduces no new coupling — it
//     matches the one src/scenes/index.ts already has.
//
// Keep this small and STABLE: concept identity + where to fetch, nothing more.
// Volatile, content-derived data (module/section counts, module titles) is
// deliberately absent — read it from the concept's own manifest.json on open so
// the home grid can never drift from the actual content.
//
// Division of ownership: the app owns *what concepts exist and where each lives*;
// each content repo owns *what's inside that one concept* (manifest + notebooks +
// audio). Mirror of src/scenes/index.ts (app owns the registry).

import { BLUE, GREEN, ORANGE, PURPLE, RED } from '../engine/colors.ts'

export interface Concept {
  /** Slug; also the hash-route id, e.g. 'apache-spark'. */
  id: string
  /** Display name on the home grid, e.g. 'Apache Spark'. */
  label: string
  /** Semantic accent (engine role hue) — the card's left border / count color. */
  accent: string
  /** One-line description shown under the label. */
  blurb?: string
  /**
   * Root URL of this concept's content repo — manifest.json, notebooks, and audio
   * resolve against it. Trailing slash optional; the content client trims it.
   */
  contentBaseUrl: string
}

// First-seen order is display order on the home grid.
export const concepts: Concept[] = [
  {
    id: 'apache-spark',
    label: 'Apache Spark',
    accent: ORANGE,
    blurb: 'Distributed batch & stream processing',
    // TEMP (local preview, unpushed manifest): local CORS content server. REVERT after.
    // contentBaseUrl: 'http://localhost:8080',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/apache-spark-content/main'
},
  {
    id: 'java',
    label: 'Java',
    accent: PURPLE,
    blurb: 'The language, the JVM, and the Spring ecosystem',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/java-content/main',
  },
  {
    id: 'scala',
    label: 'Scala',
    accent: RED,
    blurb: 'Scala 3 on the JVM — functional + OOP, a path to Spark',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/scala-content/main',
  },
  {
    id: 'python',
    label: 'Python',
    accent: BLUE,
    blurb: 'The language, CPython, and the data/ML ecosystem',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/python-content/main',
  },
  {
    id: 'dsa',
    label: 'Data Structures & Algorithms',
    accent: GREEN,
    blurb: 'From memory layout and Big O to trees, heaps, and interview patterns',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/dsa-content/main',
  },
]

/** Look up a concept by id (hash slug). */
export function conceptById(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id)
}
