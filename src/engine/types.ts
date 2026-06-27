// The SceneSpec — the declarative authoring contract for one diagram. Render-free
// on purpose (an AI generator may emit this later). Nodes are placed on a grid by
// `cell`; the grid resolver turns cells into pixel boxes for React Flow.

export type NodeKind = 'symbol' | 'term' | 'label' | 'code' | 'container' | 'group'

export interface SceneNodeSpec {
  id: string
  label: string
  /** [col, row, colSpan?, rowSpan?] within the PARENT's grid (scene grid at top level). */
  cell: [number, number, number?, number?]
  /** A semantic role color from `colors.ts` (driver=BLUE, executors=GREEN, …). */
  color?: string
  /**
   * 'symbol' = icon glyph + label (a component); 'term' = filled chip whose text
   * IS the concept (an option/value); 'label' = bare text leaf — no glyph, no fill —
   * for plain enumerations inside a labelled container (stage partitions, tasks);
   * 'code' = a syntax-highlighted source snippet (its `label` is the raw code,
   * `lang` the highlight.js grammar) on a dark IDE-style card; 'container' = titled
   * box whose `children` lay out INSIDE it (title band reserved at top); 'group' =
   * invisible container (no chrome) that only sub-arranges its children.
   */
  kind?: NodeKind
  /**
   * Render shape for a leaf chip. 'circle' rounds a `term`/`symbol` into a round
   * node (border-radius 50%) — author its cell square so it reads as a true circle.
   * Default (omitted) = the standard rounded-rect chip.
   */
  shape?: 'circle'
  /** Optional smaller caption under the label. */
  sub?: string
  /** For `kind: 'code'`: the highlight.js language of `label`. Defaults to 'scala'. */
  lang?: string
  /**
   * Optional glyph for a `symbol` leaf: an image URL, or a short literal (e.g. an
   * emoji / 2-3 letters). When omitted, the renderer derives initials from `label`
   * (NodeMap-style). Ignored by non-`symbol` kinds.
   */
  icon?: string
  /** Inner grid for this node's `children`, resolved inside this node's box. */
  layout?: SceneGrid
  /** Child nodes laid out inside this node's box via `layout`. */
  children?: SceneNodeSpec[]
}

export interface SceneEdgeSpec {
  from: string
  to: string
  label?: string
  color?: string
  /** Animate a "flow in path" dot along this edge. Defaults to true. */
  animated?: boolean
  sourceHandle?: string
  targetHandle?: string
}

export interface SceneGrid {
  /**
   * Column tracks. A number `n` means n EQUAL columns (uniform grid). An array
   * is per-column relative WEIGHTS — `[1.2, 1, 1.2]` makes the outer columns 1.2×
   * the middle (NodeMap-style unequal tracks). A `cell`'s col index/span counts
   * tracks either way.
   */
  cols: number | number[]
  /** Row tracks — same rule as `cols` (a count, or per-row relative weights). */
  rows: number | number[]
  /** Gap between tracks, in grid units (one unit = one weight-1 track). Default 0.2. */
  gap?: number
  /** Inner padding, in grid units (one unit = one weight-1 track). Default 0.4. */
  padding?: number
}

export interface SceneSpec {
  id: string
  topic: string
  title: string
  subtitle?: string
  grid: SceneGrid
  nodes: SceneNodeSpec[]
  edges: SceneEdgeSpec[]
  /**
   * Logical canvas the grid resolves into; its aspect should match the grid's
   * `cols:rows` so cells stay square (fitView then scales it to any screen).
   * Defaults to portrait 800×1200. A wide 16:9 map declares e.g.
   * `{ width: 1424, height: 800 }`.
   */
  canvas?: { width: number; height: number }
  /**
   * Optional manifest-id → node-id(s) alias map. Lets a content `manifest.json`
   * keep `highlight`/`focus` ids from a SOURCE scene that was merged into this one
   * (whose node ids differ). Each manifest id resolves to one or more real node ids
   * before spotlight/camera use; a list lets a coarse source group frame several
   * anchors so its camera box still contains whichever leaf is lit. Ids absent from
   * the map pass through unchanged. See `scala-model` (merged from scala-grammar).
   */
  aliases?: Record<string, string[]>
}
