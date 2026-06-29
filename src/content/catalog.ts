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

import { BLUE, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

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
   * Taxonomy bucket for the brand-bar concept dropdown (e.g. 'Data', 'Languages').
   * Concepts are grouped by this in CATEGORY_ORDER; unknown values sort to the end.
   */
  category: string
  /**
   * Optional middle level for related concepts (e.g. an 'AWS' family of
   * Fundamentals / IAM / VPC concepts). When several concepts share a `group`,
   * the dropdown collapses them into one submenu labelled by `group` and shows
   * `variantLabel` per entry. Unused today — kept so the cascade can grow a third
   * level without a data-model change.
   */
  group?: string
  /** Label shown inside a `group` submenu (falls back to `label`). */
  variantLabel?: string
  /**
   * Root URL of this concept's content repo — manifest.json, notebooks, and audio
   * resolve against it. Trailing slash optional; the content client trims it.
   */
  contentBaseUrl: string
}

// Display order of categories, top → bottom on the home grid (and in the
// brand-bar dropdown): ML/AI at the top, Systems at the bottom. Others follow,
// in catalog order. ('ML/AI' has no concepts yet — listed so it slots in first
// the moment one is added.)
export const CATEGORY_ORDER = ['ML/AI', 'Data', 'Languages', 'Cloud', 'Engineering', 'Systems']

// First-seen order is display order on the home grid.
export const concepts: Concept[] = [
  {
    id: 'apache-spark',
    label: 'Apache Spark',
    accent: ORANGE,
    blurb: 'Distributed batch & stream processing',
    category: 'Data',
    // TEMP (local preview, unpushed manifest): local CORS content server. REVERT after.
    // contentBaseUrl: 'http://localhost:8080',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/apache-spark-content/main'
},
  {
    id: 'java',
    label: 'Java',
    accent: PURPLE,
    blurb: 'The language, the JVM, and the Spring ecosystem',
    category: 'Languages',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/java-content/main',
  },
  {
    id: 'scala',
    label: 'Scala',
    accent: RED,
    blurb: 'Scala 3 on the JVM — functional + OOP, a path to Spark',
    category: 'Languages',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/scala-content/main',
  },
  {
    id: 'python',
    label: 'Python',
    accent: BLUE,
    blurb: 'The language, CPython, and the data/ML ecosystem',
    category: 'Languages',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/python-content/main',
  },
  {
    id: 'dsa',
    label: 'Data Structures & Algorithms',
    accent: GREEN,
    blurb: 'From memory layout and Big O to trees, heaps, and interview patterns',
    category: 'Engineering',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/dsa-content/main',
  },
  {
    id: 'sql',
    label: 'SQL',
    accent: TEAL,
    blurb: 'The relational query language — from the data model to query planning',
    category: 'Data',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/sql-content/main',
  },
  {
    id: 'linux',
    label: 'Linux',
    accent: YELLOW,
    blurb: 'From the shell to the kernel — a beginner-to-LFCS tour of the OS',
    category: 'Systems',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/linux-content/main',
  },
  {
    id: 'docker',
    label: 'Docker',
    accent: BLUE,
    blurb: 'Containers from zero to DCA — images, networking, Compose, Swarm, security',
    category: 'Systems',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/docker-content/main',
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    accent: BLUE,
    blurb: 'Container orchestration from zero to CKA — pods, controllers, services, scheduling, RBAC',
    category: 'Systems',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/kubernetes-content/main',
  },
  {
    id: 'aws',
    label: 'AWS',
    accent: ORANGE,
    blurb: 'Cloud foundations to the SAA — global infrastructure, IAM, VPC networking, and data engineering',
    category: 'Cloud',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/aws-content/main',
  },
  {
    id: 'databricks-data-engineer',
    label: 'Databricks Data Engineer',
    accent: ORANGE,
    blurb: 'Lakehouse from zero to the DE Associate exam — Delta, Unity Catalog, Lakeflow, medallion',
    category: 'Data',
    contentBaseUrl: 'https://raw.githubusercontent.com/schemabotview/databricks-data-engineer-content/main',
  },
]

/** Look up a concept by id (hash slug). */
export function conceptById(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id)
}

/** One category bucket of the concept dropdown. */
export interface ConceptCategory {
  label: string
  concepts: Concept[]
}

/**
 * Bucket concepts by `category` for the brand-bar dropdown. Categories in
 * CATEGORY_ORDER come first (in that order); any others follow in catalog order.
 * Within a category, concepts keep their catalog order. (Two-level cascade today;
 * the `group`/`variantLabel` fields stay unused until a concept family needs them.)
 */
export function buildConceptMenu(list: Concept[] = concepts): ConceptCategory[] {
  const byCategory = new Map<string, Concept[]>()
  for (const c of list) {
    const arr = byCategory.get(c.category) ?? []
    arr.push(c)
    byCategory.set(c.category, arr)
  }
  const ordered: ConceptCategory[] = []
  for (const cat of CATEGORY_ORDER) {
    const cs = byCategory.get(cat)
    if (!cs) continue
    ordered.push({ label: cat, concepts: cs })
    byCategory.delete(cat)
  }
  for (const [label, cs] of byCategory) ordered.push({ label, concepts: cs })
  return ordered
}
