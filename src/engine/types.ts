// The SceneSpec — the declarative authoring contract for one diagram. Render-free
// on purpose (an AI generator may emit this later). Nodes are placed on a grid by
// `cell`; the grid resolver turns cells into pixel boxes for React Flow.

export type NodeKind = 'symbol' | 'term' | 'container' | 'group'

export interface SceneNodeSpec {
  id: string
  label: string
  /** [col, row, colSpan?, rowSpan?] within the PARENT's grid (scene grid at top level). */
  cell: [number, number, number?, number?]
  /** A semantic role color from `colors.ts` (driver=BLUE, executors=GREEN, …). */
  color?: string
  /**
   * 'symbol' = labelled node; 'term' = filled chip whose text IS the concept;
   * 'container' = titled box whose `children` lay out INSIDE it (title band
   * reserved at top); 'group' = invisible container (no chrome) that only
   * sub-arranges its children.
   */
  kind?: NodeKind
  /** Optional smaller caption under the label. */
  sub?: string
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
  cols: number
  rows: number
  /** Gap between cells, in grid units (relative). Default 0.2. */
  gap?: number
  /** Inner padding, in grid units (relative). Default 0.4. */
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
}
