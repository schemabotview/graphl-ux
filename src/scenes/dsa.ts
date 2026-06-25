import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL } from '../engine/colors.ts'

// The DSA concept on ONE scene: the "top data structures" poster, but laid out
// GROUPED BY the classical taxonomy category — so the layout itself is the
// categorisation (Primitive · Linear/Static · Linear/Dynamic · Non-Linear/Tree ·
// Non-Linear/Graph · Hashing), and each cell still shows what the structure LOOKS
// like (boxed sequences for the linear ones, node-link diagrams for the trees/
// graphs). The camera-focus spine frames one category or one structure box per
// section. Calm filled style throughout (DESIGN.md) — circles are muted filled
// disks, not glowing outlines.

// Native weighted-track authoring: the grid carries relative track WEIGHTS and each
// child's `at` becomes its `cell`, indexing those tracks 1:1 (see java-jvm.ts).
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// A filled value chip (array / queue / list cell, hashmap bucket, primitive).
const term = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })
// A bare text leaf — indices and head/tail/front/rear/top/push/pop annotations.
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'label' })
// A round node — a filled disk holding its label (tree/graph vertices). Author its
// cell roughly square so it reads as a circle, not an ellipse (see types.ts).
const circle = (id: string, label: string, color: string): NodeSeed => ({
  id,
  label,
  color,
  kind: 'term',
  shape: 'circle',
})

// A category band: a titled container holding its structure boxes in one row.
const catRow = (id: string, label: string, color: string, boxes: SceneNodeSpec[]): SceneNodeSpec =>
  container(
    { id, label, color },
    wgrid(
      { cols: boxes.map(() => 1), rows: [1], gap: 0.25, padding: 0.4 },
      boxes.map((node, i) => ({ node, at: [i, 0] as [number, number] })),
    ),
  )

// =============== PRIMITIVE ===============

const primitiveBox = container(
  { id: 'dsa-grp-primitive', label: 'Primitive', color: RED },
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.4 }, [
    { node: term('dsa-cat-prim-int', 'int', RED), at: [0, 0] },
    { node: term('dsa-cat-prim-char', 'char', RED), at: [1, 0] },
    { node: term('dsa-cat-prim-float', 'float', RED), at: [2, 0] },
    { node: term('dsa-cat-prim-bool', 'bool', RED), at: [3, 0] },
  ]),
)

// =============== BOXED STRUCTURES ===============

// Array — index header row over a contiguous row of value cells.
const arrayBox = container(
  { id: 'dsa-cat-array', label: 'Array', color: GREEN },
  wgrid({ cols: [1, 1, 1, 1, 1], rows: [0.5, 1], gap: 0.18, padding: 0.4 }, [
    { node: lbl('dsa-cat-arr-i0', '0', GRAY), at: [0, 0] },
    { node: lbl('dsa-cat-arr-i1', '1', GRAY), at: [1, 0] },
    { node: lbl('dsa-cat-arr-i2', '2', GRAY), at: [2, 0] },
    { node: lbl('dsa-cat-arr-i3', '3', GRAY), at: [3, 0] },
    { node: lbl('dsa-cat-arr-i4', '4', GRAY), at: [4, 0] },
    { node: term('dsa-cat-arr-v0', '12', GREEN), at: [0, 1] },
    { node: term('dsa-cat-arr-v1', '7', GREEN), at: [1, 1] },
    { node: term('dsa-cat-arr-v2', '9', GREEN), at: [2, 1] },
    { node: term('dsa-cat-arr-v3', '15', GREEN), at: [3, 1] },
    { node: term('dsa-cat-arr-v4', '27', GREEN), at: [4, 1] },
  ]),
)

// Matrix — 2D grid: a column-index header row and a row-index gutter around a 4×3
// block of cells (empty cells = the grid itself is the point).
const matrixBox = container(
  { id: 'dsa-cat-matrix', label: 'Matrix', color: GREEN },
  wgrid({ cols: [0.5, 1, 1, 1, 1], rows: [0.5, 1, 1, 1], gap: 0.1, padding: 0.4 }, [
    { node: lbl('dsa-cat-mx-c0', '0', GRAY), at: [1, 0] },
    { node: lbl('dsa-cat-mx-c1', '1', GRAY), at: [2, 0] },
    { node: lbl('dsa-cat-mx-c2', '2', GRAY), at: [3, 0] },
    { node: lbl('dsa-cat-mx-c3', '3', GRAY), at: [4, 0] },
    { node: lbl('dsa-cat-mx-r0', '0', GRAY), at: [0, 1] },
    { node: lbl('dsa-cat-mx-r1', '1', GRAY), at: [0, 2] },
    { node: lbl('dsa-cat-mx-r2', '2', GRAY), at: [0, 3] },
    { node: term('dsa-cat-mx-00', '', GREEN), at: [1, 1] },
    { node: term('dsa-cat-mx-01', '', GREEN), at: [2, 1] },
    { node: term('dsa-cat-mx-02', '', GREEN), at: [3, 1] },
    { node: term('dsa-cat-mx-03', '', GREEN), at: [4, 1] },
    { node: term('dsa-cat-mx-10', '', GREEN), at: [1, 2] },
    { node: term('dsa-cat-mx-11', '', GREEN), at: [2, 2] },
    { node: term('dsa-cat-mx-12', '', GREEN), at: [3, 2] },
    { node: term('dsa-cat-mx-13', '', GREEN), at: [4, 2] },
    { node: term('dsa-cat-mx-20', '', GREEN), at: [1, 3] },
    { node: term('dsa-cat-mx-21', '', GREEN), at: [2, 3] },
    { node: term('dsa-cat-mx-22', '', GREEN), at: [3, 3] },
    { node: term('dsa-cat-mx-23', '', GREEN), at: [4, 3] },
  ]),
)

// Linked List — head → node → … → node → tail; each "next" pointer is an edge.
const linkedListBox = container(
  { id: 'dsa-cat-linkedlist', label: 'Linked List', color: ORANGE },
  wgrid({ cols: [0.6, 1, 1, 1, 1, 1, 0.6], rows: [1], gap: 0.18, padding: 0.4 }, [
    { node: lbl('dsa-cat-ll-head', 'head', GRAY), at: [0, 0] },
    { node: term('dsa-cat-ll-n0', '3', ORANGE), at: [1, 0] },
    { node: term('dsa-cat-ll-n1', '5', ORANGE), at: [2, 0] },
    { node: term('dsa-cat-ll-n2', '7', ORANGE), at: [3, 0] },
    { node: term('dsa-cat-ll-n3', '9', ORANGE), at: [4, 0] },
    { node: term('dsa-cat-ll-n4', '11', ORANGE), at: [5, 0] },
    { node: lbl('dsa-cat-ll-tail', 'tail', GRAY), at: [6, 0] },
  ]),
)

// Stack — LIFO pile: push/pop act on the top; slabs grow downward.
const stackBox = container(
  { id: 'dsa-cat-stack', label: 'Stack', color: ORANGE },
  wgrid({ cols: [0.6, 1], rows: [0.6, 1, 1, 1], gap: 0.16, padding: 0.4 }, [
    { node: lbl('dsa-cat-st-push', 'push →', ORANGE), at: [0, 0] },
    { node: lbl('dsa-cat-st-pop', '← pop', ORANGE), at: [1, 0] },
    { node: lbl('dsa-cat-st-top', 'top →', GRAY), at: [0, 1] },
    { node: term('dsa-cat-st-s0', '30', ORANGE), at: [1, 1] },
    { node: term('dsa-cat-st-s1', '20', ORANGE), at: [1, 2] },
    { node: term('dsa-cat-st-s2', '10', ORANGE), at: [1, 3] },
  ]),
)

// Queue — FIFO: rear (enqueue) on the left, front (dequeue) on the right; the flow
// arrows are edges (rear → … → front).
const queueBox = container(
  { id: 'dsa-cat-queue', label: 'Queue', color: BLUE },
  wgrid({ cols: [0.7, 1, 1, 1, 0.7], rows: [1], gap: 0.18, padding: 0.4 }, [
    { node: lbl('dsa-cat-q-rear', 'rear', BLUE), at: [0, 0] },
    { node: term('dsa-cat-q-v0', '3', BLUE), at: [1, 0] },
    { node: term('dsa-cat-q-v1', '7', BLUE), at: [2, 0] },
    { node: term('dsa-cat-q-v2', '12', BLUE), at: [3, 0] },
    { node: lbl('dsa-cat-q-front', 'front', BLUE), at: [4, 0] },
  ]),
)

// =============== NODE-LINK STRUCTURES ===============
// Each is a small graph of `circle` vertices; the links are scene edges (below).
// Vertical scene direction puts parent-on-top → child-below.

// Tree — a generic rooted tree (uneven: left subtree of 2, right of 1). Empty disks.
const treeBox = container(
  { id: 'dsa-cat-tree', label: 'Tree', color: TEAL },
  wgrid({ cols: [1, 1, 1, 1, 1, 1, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.4 }, [
    { node: circle('dsa-cat-tr-root', '', TEAL), at: [3, 0] },
    { node: circle('dsa-cat-tr-l', '', TEAL), at: [1, 1] },
    { node: circle('dsa-cat-tr-r', '', TEAL), at: [5, 1] },
    { node: circle('dsa-cat-tr-ll', '', TEAL), at: [0, 2] },
    { node: circle('dsa-cat-tr-lr', '', TEAL), at: [2, 2] },
    { node: circle('dsa-cat-tr-rl', '', TEAL), at: [4, 2] },
  ]),
)

// BST — full 3-level binary search tree (in-order: 1 2 3 4 5 6 7).
const bstBox = container(
  { id: 'dsa-cat-bst', label: 'BST', color: TEAL },
  wgrid({ cols: [1, 1, 1, 1, 1, 1, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.4 }, [
    { node: circle('dsa-cat-bst-4', '4', TEAL), at: [3, 0] },
    { node: circle('dsa-cat-bst-2', '2', TEAL), at: [1, 1] },
    { node: circle('dsa-cat-bst-6', '6', TEAL), at: [5, 1] },
    { node: circle('dsa-cat-bst-1', '1', TEAL), at: [0, 2] },
    { node: circle('dsa-cat-bst-3', '3', TEAL), at: [2, 2] },
    { node: circle('dsa-cat-bst-5', '5', TEAL), at: [4, 2] },
    { node: circle('dsa-cat-bst-7', '7', TEAL), at: [6, 2] },
  ]),
)

// Heap — max-heap: every parent ≥ its children (root 9).
const heapBox = container(
  { id: 'dsa-cat-heap', label: 'Heap', color: RED },
  wgrid({ cols: [1, 1, 1, 1, 1, 1, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.4 }, [
    { node: circle('dsa-cat-hp-9', '9', RED), at: [3, 0] },
    { node: circle('dsa-cat-hp-5', '5', RED), at: [1, 1] },
    { node: circle('dsa-cat-hp-8', '8', RED), at: [5, 1] },
    { node: circle('dsa-cat-hp-2', '2', RED), at: [0, 2] },
    { node: circle('dsa-cat-hp-3', '3', RED), at: [2, 2] },
    { node: circle('dsa-cat-hp-6', '6', RED), at: [4, 2] },
  ]),
)

// Trie — prefix tree: root → t → {o, e → a}  ("to", "tea").
const trieBox = container(
  { id: 'dsa-cat-trie', label: 'Trie', color: BLUE },
  wgrid({ cols: [1, 1, 1], rows: [1, 1, 1, 1], gap: 0.2, padding: 0.4 }, [
    { node: circle('dsa-cat-tri-root', '', BLUE), at: [1, 0] },
    { node: circle('dsa-cat-tri-t', 't', BLUE), at: [1, 1] },
    { node: circle('dsa-cat-tri-o', 'o', BLUE), at: [0, 2] },
    { node: circle('dsa-cat-tri-e', 'e', BLUE), at: [2, 2] },
    { node: circle('dsa-cat-tri-a', 'a', BLUE), at: [2, 3] },
  ]),
)

// Graph — directed: a → b, a → e, b → d, b → g, e → g.
const graphBox = container(
  { id: 'dsa-cat-graph', label: 'Graph', color: GREEN },
  wgrid({ cols: [1, 1, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.4 }, [
    { node: circle('dsa-cat-gr-a', 'a', GREEN), at: [0, 1] },
    { node: circle('dsa-cat-gr-b', 'b', GREEN), at: [1, 0] },
    { node: circle('dsa-cat-gr-e', 'e', GREEN), at: [1, 2] },
    { node: circle('dsa-cat-gr-d', 'd', GREEN), at: [2, 0] },
    { node: circle('dsa-cat-gr-g', 'g', GREEN), at: [2, 1] },
  ]),
)

// Union Find — two disjoint sets, each child pointing to its set's representative.
const unionFindBox = container(
  { id: 'dsa-cat-unionfind', label: 'Union Find', color: PURPLE },
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.2, padding: 0.4 }, [
    { node: circle('dsa-cat-uf-a0', '', PURPLE), at: [0, 0] },
    { node: circle('dsa-cat-uf-a1', '', PURPLE), at: [0, 1] },
    { node: circle('dsa-cat-uf-s', '', PURPLE), at: [1, 0] },
    { node: circle('dsa-cat-uf-b0', '', PURPLE), at: [2, 0] },
    { node: circle('dsa-cat-uf-b1', '', PURPLE), at: [2, 1] },
  ]),
)

// HashMap — keys → h(K) → bucket array (index : value). Buckets 0,1,3 filled; 2 empty.
const hashMapBox = container(
  { id: 'dsa-cat-hashmap', label: 'HashMap', color: PURPLE },
  wgrid({ cols: [1, 1, 0.4, 1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.4 }, [
    { node: term('dsa-cat-hm-k1', 'K1', PURPLE), at: [0, 0] },
    { node: term('dsa-cat-hm-k2', 'K2', PURPLE), at: [0, 1] },
    { node: term('dsa-cat-hm-k3', 'K3', PURPLE), at: [0, 2] },
    { node: term('dsa-cat-hm-h', 'h(K)', BLUE), at: [1, 1] },
    { node: lbl('dsa-cat-hm-i0', '0', GRAY), at: [2, 0] },
    { node: lbl('dsa-cat-hm-i1', '1', GRAY), at: [2, 1] },
    { node: lbl('dsa-cat-hm-i2', '2', GRAY), at: [2, 2] },
    { node: lbl('dsa-cat-hm-i3', '3', GRAY), at: [2, 3] },
    { node: term('dsa-cat-hm-v0', 'V2', PURPLE), at: [3, 0] },
    { node: term('dsa-cat-hm-v1', 'V1', PURPLE), at: [3, 1] },
    { node: term('dsa-cat-hm-v2', '', PURPLE), at: [3, 2] },
    { node: term('dsa-cat-hm-v3', 'V3', PURPLE), at: [3, 3] },
  ]),
)

// =============== CATEGORY BANDS ===============
// The grouping IS the taxonomy: each band is one classification category.

const catStatic = catRow('dsa-grp-static', 'Linear · Static', GREEN, [arrayBox, matrixBox])

// Linear · Dynamic gets TWO rows: Linked List full-width on top (it needs the most
// horizontal room — head + 5 nodes + tail), Stack + Queue side-by-side below. A single
// row squeezed all three and clipped the head/tail/rear/front labels.
const catDynamic = container(
  { id: 'dsa-grp-dynamic', label: 'Linear · Dynamic', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [0.8, 1.2], gap: 0.25, padding: 0.4 }, [
    { node: linkedListBox, at: [0, 0, 2, 1] },
    { node: stackBox, at: [0, 1] },
    { node: queueBox, at: [1, 1] },
  ]),
)
const catTree = catRow('dsa-grp-tree', 'Non-Linear · Tree', TEAL, [treeBox, bstBox, heapBox, trieBox])
const catGraph = catRow('dsa-grp-graph', 'Non-Linear · Graph', GREEN, [graphBox, unionFindBox])
const catHashing = catRow('dsa-grp-hashing', 'Hashing', PURPLE, [hashMapBox])

// =============== ROOT ===============
// Two macro columns: the Linear family (Primitive + Static + Dynamic) on the left,
// the Non-Linear family (Tree + Graph) + Hashing on the right.

const leftColumn = group(
  'dsa-col-linear',
  wgrid({ cols: [1], rows: [0.45, 1.1, 1.9], gap: 0.3, padding: 0 }, [
    { node: primitiveBox, at: [0, 0] },
    { node: catStatic, at: [0, 1] },
    { node: catDynamic, at: [0, 2] },
  ]),
)

const rightColumn = group(
  'dsa-col-nonlinear',
  wgrid({ cols: [1], rows: [1.6, 1, 1.1], gap: 0.3, padding: 0 }, [
    { node: catTree, at: [0, 0] },
    { node: catGraph, at: [0, 1] },
    { node: catHashing, at: [0, 2] },
  ]),
)

const root = group(
  'dsa-scene-root',
  wgrid({ cols: [1, 1.15], rows: [1], gap: 0.3, padding: 0.4 }, [
    { node: leftColumn, at: [0, 0] },
    { node: rightColumn, at: [1, 0] },
  ]),
)

export const dsa: SceneSpec = {
  id: 'dsa',
  topic: 'dsa',
  title: 'DSA — Catalog',
  subtitle: 'The top data structures, grouped by category',
  // Landscape map; fitView scales it to any screen and the camera frames one
  // category / structure box per section.
  canvas: { width: 1600, height: 1000 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // Queue — FIFO flow, rear → front.
    { from: 'dsa-cat-q-rear', to: 'dsa-cat-q-v0', color: BLUE },
    { from: 'dsa-cat-q-v0', to: 'dsa-cat-q-v1', color: BLUE },
    { from: 'dsa-cat-q-v1', to: 'dsa-cat-q-v2', color: BLUE },
    { from: 'dsa-cat-q-v2', to: 'dsa-cat-q-front', color: BLUE },
    // Linked List — each "next" pointer.
    { from: 'dsa-cat-ll-n0', to: 'dsa-cat-ll-n1', color: ORANGE },
    { from: 'dsa-cat-ll-n1', to: 'dsa-cat-ll-n2', color: ORANGE },
    { from: 'dsa-cat-ll-n2', to: 'dsa-cat-ll-n3', color: ORANGE },
    { from: 'dsa-cat-ll-n3', to: 'dsa-cat-ll-n4', color: ORANGE },
    // Tree — parent → child.
    { from: 'dsa-cat-tr-root', to: 'dsa-cat-tr-l', color: TEAL },
    { from: 'dsa-cat-tr-root', to: 'dsa-cat-tr-r', color: TEAL },
    { from: 'dsa-cat-tr-l', to: 'dsa-cat-tr-ll', color: TEAL },
    { from: 'dsa-cat-tr-l', to: 'dsa-cat-tr-lr', color: TEAL },
    { from: 'dsa-cat-tr-r', to: 'dsa-cat-tr-rl', color: TEAL },
    // BST — parent → child.
    { from: 'dsa-cat-bst-4', to: 'dsa-cat-bst-2', color: TEAL },
    { from: 'dsa-cat-bst-4', to: 'dsa-cat-bst-6', color: TEAL },
    { from: 'dsa-cat-bst-2', to: 'dsa-cat-bst-1', color: TEAL },
    { from: 'dsa-cat-bst-2', to: 'dsa-cat-bst-3', color: TEAL },
    { from: 'dsa-cat-bst-6', to: 'dsa-cat-bst-5', color: TEAL },
    { from: 'dsa-cat-bst-6', to: 'dsa-cat-bst-7', color: TEAL },
    // Heap — parent → child.
    { from: 'dsa-cat-hp-9', to: 'dsa-cat-hp-5', color: RED },
    { from: 'dsa-cat-hp-9', to: 'dsa-cat-hp-8', color: RED },
    { from: 'dsa-cat-hp-5', to: 'dsa-cat-hp-2', color: RED },
    { from: 'dsa-cat-hp-5', to: 'dsa-cat-hp-3', color: RED },
    { from: 'dsa-cat-hp-8', to: 'dsa-cat-hp-6', color: RED },
    // Trie — prefix links.
    { from: 'dsa-cat-tri-root', to: 'dsa-cat-tri-t', color: BLUE },
    { from: 'dsa-cat-tri-t', to: 'dsa-cat-tri-o', color: BLUE },
    { from: 'dsa-cat-tri-t', to: 'dsa-cat-tri-e', color: BLUE },
    { from: 'dsa-cat-tri-e', to: 'dsa-cat-tri-a', color: BLUE },
    // Graph — directed edges.
    { from: 'dsa-cat-gr-a', to: 'dsa-cat-gr-b', color: GREEN },
    { from: 'dsa-cat-gr-a', to: 'dsa-cat-gr-e', color: GREEN },
    { from: 'dsa-cat-gr-b', to: 'dsa-cat-gr-d', color: GREEN },
    { from: 'dsa-cat-gr-b', to: 'dsa-cat-gr-g', color: GREEN },
    { from: 'dsa-cat-gr-e', to: 'dsa-cat-gr-g', color: GREEN },
    // Union Find — child → representative.
    { from: 'dsa-cat-uf-a1', to: 'dsa-cat-uf-a0', color: PURPLE },
    { from: 'dsa-cat-uf-b1', to: 'dsa-cat-uf-b0', color: PURPLE },
    // HashMap — keys hash into the bucket array.
    { from: 'dsa-cat-hm-k1', to: 'dsa-cat-hm-h', color: PURPLE },
    { from: 'dsa-cat-hm-k2', to: 'dsa-cat-hm-h', color: PURPLE },
    { from: 'dsa-cat-hm-k3', to: 'dsa-cat-hm-h', color: PURPLE },
    { from: 'dsa-cat-hm-h', to: 'dsa-cat-hm-v0', color: BLUE },
    { from: 'dsa-cat-hm-h', to: 'dsa-cat-hm-v1', color: BLUE },
    { from: 'dsa-cat-hm-h', to: 'dsa-cat-hm-v3', color: BLUE },
  ],
}
