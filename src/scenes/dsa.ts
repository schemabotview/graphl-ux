import type { SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL } from '../engine/colors.ts'

// The DSA concept on one wide map — ported faithfully from NodeMap's `dsa.ts`
// (`~/Projects/NodeMap/src/data/scenes/dsa.ts`). Two columns: LEFT is the classical
// data-structure taxonomy laid out as a top-down tree; RIGHT is a stack of RAM
// sketches where the GEOMETRY is the memory model (contiguous row vs scattered
// pointer chain vs stack column vs adjacency rows), not a string imitating one.
// The source authored both columns with WEIGHTED grid tracks, which graphl-ux's
// resolver supports natively — a grid's `cols`/`rows` can be relative-weight arrays
// and a child's `cell` indexes those tracks 1:1. `wgrid()` is the thin shim and
// `term()` is the filled-chip leaf (NodeMap's `kind: 'term'`).

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

// =============== LEFT: TAXONOMY ===============
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

// =============== RIGHT: RAM SKETCHES ===============
// Each cell is a small grid of byte / node boxes — the geometry shows the memory
// model directly, no monospace impersonation.

// Primitive — 4 byte cells in a row (int 42 = 0x0000002A at 0x1000)
const ramPrimitive = container(
  { id: 'dsa-ram-primitive', label: 'Primitive — int 42  (4 bytes at 0x1000)', color: TEAL },
  wgrid({ cols: [1, 1, 1, 1], rows: [1, 0.6], gap: 0, padding: 0.4 }, [
    { node: term('dsa-ram-prim-b0', '00', RED), at: [0, 0] },
    { node: term('dsa-ram-prim-b1', '00', RED), at: [1, 0] },
    { node: term('dsa-ram-prim-b2', '00', RED), at: [2, 0] },
    { node: term('dsa-ram-prim-b3', '2A', RED), at: [3, 0] },
    { node: term('dsa-ram-prim-a0', '0x1000', GRAY), at: [0, 1] },
    { node: term('dsa-ram-prim-a1', '0x1001', GRAY), at: [1, 1] },
    { node: term('dsa-ram-prim-a2', '0x1002', GRAY), at: [2, 1] },
    { node: term('dsa-ram-prim-a3', '0x1003', GRAY), at: [3, 1] },
  ]),
)

// Array — contiguous block, values on top, addresses below (base + i × 4)
const ramArray = container(
  { id: 'dsa-ram-array', label: 'Array — contiguous block at 0x2000,  O(1) index', color: TEAL },
  wgrid({ cols: [1, 1, 1, 1], rows: [1, 0.6], gap: 0, padding: 0.4 }, [
    { node: term('dsa-ram-arr-v0', '10', GREEN), at: [0, 0] },
    { node: term('dsa-ram-arr-v1', '20', GREEN), at: [1, 0] },
    { node: term('dsa-ram-arr-v2', '30', GREEN), at: [2, 0] },
    { node: term('dsa-ram-arr-v3', '40', GREEN), at: [3, 0] },
    { node: term('dsa-ram-arr-a0', '0x2000', GRAY), at: [0, 1] },
    { node: term('dsa-ram-arr-a1', '0x2004', GRAY), at: [1, 1] },
    { node: term('dsa-ram-arr-a2', '0x2008', GRAY), at: [2, 1] },
    { node: term('dsa-ram-arr-a3', '0x200C', GRAY), at: [3, 1] },
  ]),
)

// Linked List — 3 node cells [val | next ptr], arrows drawn as edges
const ramLinkedList = container(
  { id: 'dsa-ram-linkedlist', label: 'Linked List — scattered nodes:  [val | next ptr]', color: TEAL },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.4, padding: 0.4 }, [
    { node: term('dsa-ram-ll-n0', '10 | 0x3A', ORANGE), at: [0, 0] },
    { node: term('dsa-ram-ll-n1', '20 | 0x7C', ORANGE), at: [1, 0] },
    { node: term('dsa-ram-ll-n2', '30 | NULL', ORANGE), at: [2, 0] },
  ]),
)

// Stack — contiguous region; top = lowest address, grows ↓ (call-stack convention)
const ramStack = container(
  { id: 'dsa-ram-stack', label: 'Stack — LIFO,  top = lowest addr, grows ↓', color: TEAL },
  wgrid({ cols: [0.6, 1, 0.8], rows: [1, 1, 1], gap: 0, padding: 0.4 }, [
    { node: term('dsa-ram-stack-top', 'top →', TEAL), at: [0, 0] },
    { node: term('dsa-ram-stack-v0', '30', ORANGE), at: [1, 0] },
    { node: term('dsa-ram-stack-a0', '0xFFE8', GRAY), at: [2, 0] },
    { node: term('dsa-ram-stack-v1', '20', ORANGE), at: [1, 1] },
    { node: term('dsa-ram-stack-a1', '0xFFEC', GRAY), at: [2, 1] },
    { node: term('dsa-ram-stack-v2', '10', ORANGE), at: [1, 2] },
    { node: term('dsa-ram-stack-a2', '0xFFF0', GRAY), at: [2, 2] },
  ]),
)

// Queue — contiguous row with front + rear labels at the bookends
const ramQueue = container(
  { id: 'dsa-ram-queue', label: 'Queue — FIFO,  front + rear pointers', color: TEAL },
  wgrid({ cols: [0.6, 1, 1, 1, 0.6], rows: [1], gap: 0, padding: 0.4 }, [
    { node: term('dsa-ram-queue-front', 'front →', TEAL), at: [0, 0] },
    { node: term('dsa-ram-queue-v0', '10', ORANGE), at: [1, 0] },
    { node: term('dsa-ram-queue-v1', '20', ORANGE), at: [2, 0] },
    { node: term('dsa-ram-queue-v2', '30', ORANGE), at: [3, 0] },
    { node: term('dsa-ram-queue-rear', '← rear', TEAL), at: [4, 0] },
  ]),
)

// Tree — root centered on top, two children below.  Each node = [val | L* | R*]
const ramTree = container(
  { id: 'dsa-ram-tree', label: 'Tree — node = [val | left* | right*]', color: TEAL },
  wgrid({ cols: [1, 1, 1, 1], rows: [1, 1], gap: 0.25, padding: 0.4 }, [
    { node: term('dsa-ram-tree-root', '10 | * | *', GRAY), at: [1, 0, 2, 1] },
    { node: term('dsa-ram-tree-left', '5 | * | *', GRAY), at: [0, 1, 2, 1] },
    { node: term('dsa-ram-tree-right', '15 | * | *', GRAY), at: [2, 1, 2, 1] },
  ]),
)

// Graph — adjacency list, one row per vertex
const ramGraph = container(
  { id: 'dsa-ram-graph', label: 'Graph — adjacency list', color: TEAL },
  wgrid({ cols: [0.5, 1, 1, 1], rows: [1, 1, 1], gap: 0.15, padding: 0.4 }, [
    { node: term('dsa-ram-graph-v0', '0 →', TEAL), at: [0, 0] },
    { node: term('dsa-ram-graph-v0-n0', '1', GRAY), at: [1, 0] },
    { node: term('dsa-ram-graph-v0-n1', '2', GRAY), at: [2, 0] },
    { node: term('dsa-ram-graph-v1', '1 →', TEAL), at: [0, 1] },
    { node: term('dsa-ram-graph-v1-n0', '0', GRAY), at: [1, 1] },
    { node: term('dsa-ram-graph-v1-n1', '3', GRAY), at: [2, 1] },
    { node: term('dsa-ram-graph-v2', '2 →', TEAL), at: [0, 2] },
    { node: term('dsa-ram-graph-v2-n0', '0', GRAY), at: [1, 2] },
  ]),
)

const ramColumn = group(
  'dsa-ram',
  wgrid({ cols: [1], rows: [1.3, 1.3, 1, 1.4, 1, 1.4, 1.4], gap: 0.35, padding: 0.5 }, [
    { node: ramPrimitive, at: [0, 0] },
    { node: ramArray, at: [0, 1] },
    { node: ramLinkedList, at: [0, 2] },
    { node: ramStack, at: [0, 3] },
    { node: ramQueue, at: [0, 4] },
    { node: ramTree, at: [0, 5] },
    { node: ramGraph, at: [0, 6] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'dsa-scene-root',
  wgrid({ cols: [1.2, 2], rows: [1], gap: 0.05, padding: 0.5 }, [
    { node: taxonomy, at: [0, 0] },
    { node: ramColumn, at: [1, 0] },
  ]),
)

export const dsa: SceneSpec = {
  id: 'dsa',
  topic: 'dsa',
  title: 'DSA — Taxonomy & RAM',
  subtitle: 'Classical taxonomy ▸ how each structure sits in RAM',
  // ~40:22 canvas (NodeMap source width:height) so the wide map renders with
  // roughly square cells; fitView then scales it to any screen.
  canvas: { width: 1440, height: 800 },
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

    // Each concrete type pairs with its RAM sketch.
    { from: 'dsa-primitive', to: 'dsa-ram-primitive', label: 'in RAM', color: TEAL },
    { from: 'dsa-array', to: 'dsa-ram-array', label: 'in RAM', color: TEAL },
    { from: 'dsa-linkedlist', to: 'dsa-ram-linkedlist', label: 'in RAM', color: TEAL },
    { from: 'dsa-stack', to: 'dsa-ram-stack', label: 'in RAM', color: TEAL },
    { from: 'dsa-queue', to: 'dsa-ram-queue', label: 'in RAM', color: TEAL },
    { from: 'dsa-tree', to: 'dsa-ram-tree', label: 'in RAM', color: TEAL },
    { from: 'dsa-graph', to: 'dsa-ram-graph', label: 'in RAM', color: TEAL },

    // Inside the RAM sketches — pointer/edge arrows that carry the semantics.
    { from: 'dsa-ram-ll-n0', to: 'dsa-ram-ll-n1', label: 'next', color: ORANGE },
    { from: 'dsa-ram-ll-n1', to: 'dsa-ram-ll-n2', label: 'next', color: ORANGE },
    { from: 'dsa-ram-tree-root', to: 'dsa-ram-tree-left', label: 'L', color: GRAY },
    { from: 'dsa-ram-tree-root', to: 'dsa-ram-tree-right', label: 'R', color: GRAY },
  ],
}
