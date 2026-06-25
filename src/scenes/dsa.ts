import type { SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED } from '../engine/colors.ts'

// The classical data-structure taxonomy on one map — ported from NodeMap's `dsa.ts`.
// Top-down tree: PRIMITIVE vs NON-PRIMITIVE, then LINEAR / NON-LINEAR, down to the
// concrete types. The idiomatic per-structure diagrams (array / queue / tree / graph
// …) now live in a separate scene (`dsa-catalog.ts`); this scene is taxonomy only.
// The source authored the map with WEIGHTED grid tracks, which graphl-ux's resolver
// supports natively — a grid's `cols`/`rows` can be relative-weight arrays and a
// child's `cell` indexes those tracks 1:1. `wgrid()` is the thin shim and `term()`
// is the filled-chip leaf (NodeMap's `kind: 'term'`).

// A filled term-chip leaf — its text IS the concept (NodeMap's `kind: 'term'`).
const term = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

// A COMPONENT leaf — icon glyph tile + label below (graphl-ux `symbol`, same as
// scala-jvm.ts's `comp`). The taxonomy categories render as these identity tiles.
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

// Native weighted-track authoring: the grid carries the relative track WEIGHTS and
// each child's `at` becomes its `cell`, indexing those tracks 1:1 (see java-jvm.ts).
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// =============== TAXONOMY ===============
// 10-col × 5-row grid. Dynamic gets a 3-col span at tier 3 so its three children
// (Linked List / Stack / Queue) each get a clean column underneath.
//
//                       DATA STRUCTURE
//          ┌───────────────────┴───────────────────┐
//      PRIMITIVE                              NON-PRIMITIVE
//                                       ┌──────────┴──────────┐
//                                     LINEAR              NON-LINEAR
//                                   ┌───┴────┐            ┌───┴───┐
//                                STATIC   DYNAMIC       TREE    GRAPH
//                                   │       │
//                                ARRAY    LL STACK QUEUE

const primitive = container(
  { id: 'dsa-primitive', label: 'Primitive', color: RED },
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.4 }, [
    { node: term('dsa-prim-int', 'int', RED), at: [0, 0] },
    { node: term('dsa-prim-char', 'char', RED), at: [1, 0] },
    { node: term('dsa-prim-float', 'float', RED), at: [2, 0] },
    { node: term('dsa-prim-bool', 'bool', RED), at: [3, 0] },
  ]),
)

const taxonomy = group(
  'dsa-taxonomy',
  wgrid(
    { cols: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], rows: [1, 1, 1, 1, 1], gap: 0.3, padding: 0.3 },
    [
      { node: comp('dsa-root', 'Data Structure', GREEN), at: [4, 0, 2, 1] },
      { node: primitive, at: [0, 1, 4, 1] },
      { node: comp('dsa-nonprimitive', 'Non-Primitive', RED), at: [4, 1, 6, 1] },
      { node: comp('dsa-linear', 'Linear', BLUE), at: [4, 2, 4, 1] },
      { node: comp('dsa-nonlinear', 'Non-Linear', BLUE), at: [8, 2, 2, 1] },
      { node: comp('dsa-static', 'Static', PURPLE), at: [4, 3, 1, 1] },
      { node: comp('dsa-dynamic', 'Dynamic', PURPLE), at: [5, 3, 3, 1] },
      { node: comp('dsa-tree', 'Tree', GRAY), at: [8, 3, 1, 1] },
      { node: comp('dsa-graph', 'Graph', GRAY), at: [9, 3, 1, 1] },
      { node: comp('dsa-array', 'Array', GREEN), at: [4, 4, 1, 1] },
      { node: comp('dsa-linkedlist', 'Linked List', ORANGE), at: [5, 4, 1, 1] },
      { node: comp('dsa-stack', 'Stack', ORANGE), at: [6, 4, 1, 1] },
      { node: comp('dsa-queue', 'Queue', ORANGE), at: [7, 4, 1, 1] },
    ],
  ),
)

// =============== ROOT ===============

const root = group(
  'dsa-scene-root',
  wgrid({ cols: [1], rows: [1], gap: 0.05, padding: 0.5 }, [{ node: taxonomy, at: [0, 0] }]),
)

export const dsa: SceneSpec = {
  id: 'dsa',
  topic: 'dsa',
  title: 'DSA — Taxonomy',
  subtitle: 'Classical data-structure taxonomy',
  // 16:9 landscape frame (the canonical canvas); fitView scales the wide, short
  // taxonomy tree to any screen.
  canvas: { width: 1440, height: 810 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // Taxonomy — parent above, child below, labelled by discriminator.
    { from: 'dsa-root', to: 'dsa-primitive', label: 'kind', color: RED },
    { from: 'dsa-root', to: 'dsa-nonprimitive', label: 'kind', color: RED },
    { from: 'dsa-nonprimitive', to: 'dsa-linear', label: 'arrangement', color: BLUE },
    { from: 'dsa-nonprimitive', to: 'dsa-nonlinear', label: 'arrangement', color: BLUE },
    { from: 'dsa-linear', to: 'dsa-static', label: 'sizing', color: PURPLE },
    { from: 'dsa-linear', to: 'dsa-dynamic', label: 'sizing', color: PURPLE },
    { from: 'dsa-nonlinear', to: 'dsa-tree', color: GRAY },
    { from: 'dsa-nonlinear', to: 'dsa-graph', color: GRAY },
    { from: 'dsa-static', to: 'dsa-array', color: GREEN },
    { from: 'dsa-dynamic', to: 'dsa-linkedlist', color: ORANGE },
    { from: 'dsa-dynamic', to: 'dsa-stack', color: ORANGE },
    { from: 'dsa-dynamic', to: 'dsa-queue', color: ORANGE },
  ],
}
