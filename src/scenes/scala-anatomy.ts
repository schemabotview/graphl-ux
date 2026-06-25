import type { SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// Scala's grammar of a program on one wide map — ported from NodeMap's
// `scala-anatomy.ts`. Four stacked rhythm rows on the left (Model ▸ Initialize ▸
// Transform ▸ Return) and a Memory side column on the right. Model is upstream of
// Initialize: you sketch the type hierarchy first, then instantiate. The Initialize
// row follows Scala's binding grammar `Kind  Name  : Type  =  Value` (the keyword
// kind — val/var/lazy val/def — leads, type is annotated AFTER the name). Geometry
// is faithful to the source's WEIGHTED grid tracks, which graphl-ux's resolver
// supports natively (see java-anatomy.ts / spark-architecture.ts). Sibling of
// `java-anatomy`: same four-row rhythm, Scala-specific tokens (trait/with,
// case class/enum, for-yield, Option/Try/Either, HAMT-backed persistence).

// A bare TEXT leaf — no glyph, no fill (graphl-ux `label`). The default for the
// enumerated tokens (keywords, types, ops) and the class-hierarchy boxes: they read
// as plain text inside their labelled containers, not as filled chips.
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'label' })

// A filled CHIP whose text IS the concept (graphl-ux `term`). Kept for the Return row.
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

// An icon glyph + label (graphl-ux `symbol`). Used for the Memory regions, which are
// concrete places data lives rather than language tokens.
const sym = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// =============== ROW 0: MODEL — class hierarchy ===============
// Scala's twist vs Java: a class extends ONE parent and mixes in any number of
// traits with `with` (linearized at compile time), where Java says `implements`.

const modelRow = container(
  { id: 'sa-model', label: 'Model — class hierarchy   |   abstract + trait ▸ class ▸ subclass', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.7, padding: 0.4 }, [
    { node: lbl('sa-oop-animal', 'abstract class  Animal', PURPLE), at: [0, 0] },
    { node: lbl('sa-oop-walker', 'trait  Walker', PURPLE), at: [1, 0] },
    { node: lbl('sa-oop-mammal', 'class  Mammal   extends Animal   with Walker', PURPLE), at: [0, 1, 2, 1] },
    { node: lbl('sa-oop-dog', 'class  Dog   extends Mammal', PURPLE), at: [0, 2, 2, 1] },
  ]),
)

// =============== ROW 1: INITIALIZE — anatomy of a binding ===============

const kind = container(
  { id: 'sa-kind', label: 'Kind', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('sa-bind-val', 'val (immutable)', GRAY), at: [0, 0] },
    { node: lbl('sa-bind-var', 'var (mutable)', GRAY), at: [0, 1] },
    { node: lbl('sa-bind-lazy', 'lazy val', GRAY), at: [0, 2] },
    { node: lbl('sa-bind-def', 'def (method)', GRAY), at: [0, 3] },
  ]),
)

const typeCollections = container(
  { id: 'sa-type-coll', label: 'Collections', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.15 }, [
    { node: lbl('sa-coll-list', 'List', GRAY), at: [0, 0] },
    { node: lbl('sa-coll-vector', 'Vector', GRAY), at: [1, 0] },
    { node: lbl('sa-coll-map', 'Map', GRAY), at: [0, 1] },
    { node: lbl('sa-coll-set', 'Set', GRAY), at: [1, 1] },
  ]),
)

const typeOop = container(
  { id: 'sa-type-oop', label: 'OOP', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.1, padding: 0.15 }, [
    { node: lbl('sa-class', 'class', GRAY), at: [0, 0] },
    { node: lbl('sa-object', 'object', GRAY), at: [0, 1] },
    { node: lbl('sa-trait', 'trait', GRAY), at: [0, 2] },
    { node: lbl('sa-case-class', 'case class', GRAY), at: [0, 3] },
    { node: lbl('sa-enum', 'enum', GRAY), at: [0, 4] },
  ]),
)

const typeShapes = container(
  { id: 'sa-type', label: ': Type', color: PURPLE },
  wgrid({ cols: [1, 1.2, 1, 1], rows: [1, 1], gap: 0.2, padding: 0.3 }, [
    { node: lbl('sa-primitive', 'Primitives', GRAY), at: [0, 0] },
    { node: typeCollections, at: [1, 0] },
    { node: typeOop, at: [2, 0, 1, 2] },
    { node: lbl('sa-generic', 'Generic[A]', GRAY), at: [3, 0] },
    { node: lbl('sa-adt', 'sealed ADT', GRAY), at: [0, 1] },
    { node: lbl('sa-array', 'Array', GRAY), at: [1, 1] },
    { node: lbl('sa-tuple', 'Tuple', GRAY), at: [3, 1] },
  ]),
)

const value = container(
  { id: 'sa-value', label: 'Value', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.18, padding: 0.3 }, [
    { node: lbl('sa-value-primitive', "Primitive    42  true  'a'", GRAY), at: [0, 0] },
    { node: lbl('sa-value-object', 'Object       Person()  Point()', GRAY), at: [0, 1] },
    { node: lbl('sa-value-collection', 'Collection   List()  Set()  Map()', GRAY), at: [0, 2] },
    { node: lbl('sa-value-defbody', 'Method body   n + 1   { ... }', GRAY), at: [0, 3] },
  ]),
)

const initializeRow = container(
  { id: 'sa-init-row', label: 'Initialize — anatomy of a binding   |   Kind  Name  : Type  =  Value', color: BLUE },
  wgrid({ cols: [1.4, 0.9, 3.2, 0.4, 1.8], rows: [1], gap: 0.3, padding: 0.4 }, [
    { node: kind, at: [0, 0] },
    { node: lbl('sa-name', 'Name  x', BLUE), at: [1, 0] },
    { node: typeShapes, at: [2, 0] },
    { node: lbl('sa-equals', '=', BLUE), at: [3, 0] },
    { node: value, at: [4, 0] },
  ]),
)

// =============== ROW 2: TRANSFORM — what you do ===============

const methods = container(
  { id: 'sa-methods', label: 'Methods', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('sa-method-call', 'x.foo()', GRAY), at: [0, 0] },
    { node: lbl('sa-method-def', 'def in class', GRAY), at: [0, 1] },
  ]),
)

const functions = container(
  { id: 'sa-functions', label: 'Functions', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('sa-fn-lambda', 'lambda (x)=>...', GRAY), at: [0, 0] },
    { node: lbl('sa-fn-hof', 'higher-order', GRAY), at: [0, 1] },
    { node: lbl('sa-fn-closure', 'closure', GRAY), at: [0, 2] },
  ]),
)

const collectionOps = container(
  { id: 'sa-coll-ops', label: 'Collection Ops', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('sa-op-map', 'map', GRAY), at: [0, 0] },
    { node: lbl('sa-op-filter', 'filter', GRAY), at: [1, 0] },
    { node: lbl('sa-op-flatmap', 'flatMap', GRAY), at: [0, 1] },
    { node: lbl('sa-op-fold', 'fold', GRAY), at: [1, 1] },
    { node: lbl('sa-op-groupby', 'groupBy', GRAY), at: [0, 2] },
    { node: lbl('sa-op-zip', 'zip', GRAY), at: [1, 2] },
  ]),
)

const control = container(
  { id: 'sa-control', label: 'Control', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('sa-ctrl-if', 'if (c) a else b', GRAY), at: [0, 0] },
    { node: lbl('sa-ctrl-then', 'if c then a else b   (S3)', GRAY), at: [0, 1] },
    { node: lbl('sa-ctrl-expr', 'if-else IS an expression', GRAY), at: [0, 2] },
    { node: lbl('sa-ctrl-guard', 'guard:  case x if p', GRAY), at: [0, 3] },
  ]),
)

const patternMatch = container(
  { id: 'sa-pattern', label: 'Pattern Match', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('sa-pat-match', 'match / case', GRAY), at: [0, 0] },
    { node: lbl('sa-pat-unapply', 'unapply binds', GRAY), at: [0, 1] },
  ]),
)

const loops = container(
  { id: 'sa-loops', label: 'Loops', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('sa-loop-for', 'for x <- xs yield', GRAY), at: [0, 0] },
    { node: lbl('sa-loop-multi', 'for { g1; g2 } yield', GRAY), at: [0, 1] },
    { node: lbl('sa-loop-while', 'while (c) {}    (rare)', GRAY), at: [0, 2] },
    { node: lbl('sa-loop-desugar', 'desugar to flatMap', GRAY), at: [0, 3] },
  ]),
)

const transformRow = container(
  { id: 'sa-verbs', label: 'Transform — what you do   |   call ▸ fn ▸ ops ▸ branch ▸ match ▸ loop', color: ORANGE },
  wgrid({ cols: [0.9, 0.9, 1.4, 1.0, 0.9, 1.0], rows: [1], gap: 0.25, padding: 0.4 }, [
    { node: methods, at: [0, 0] },
    { node: functions, at: [1, 0] },
    { node: collectionOps, at: [2, 0] },
    { node: control, at: [3, 0] },
    { node: patternMatch, at: [4, 0] },
    { node: loops, at: [5, 0] },
  ]),
)

// =============== ROW 3: RETURN — what comes back ===============
// Effects chip stays GRAY on purpose — secondary, impure off-ramp from the pure pipeline.

const returnRow = container(
  { id: 'sa-results', label: 'Return — what comes back', color: GREEN },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.35, padding: 0.4 }, [
    { node: chip('sa-new-coll', 'New (immutable) Collection', GREEN), at: [0, 0] },
    { node: chip('sa-typed-failure', 'Option / Try / Either', BLUE), at: [1, 0] },
    { node: chip('sa-effects', 'Effects (println, IO)', GRAY), at: [2, 0] },
  ]),
)

// =============== LEFT CONTENT BLOCK: four rhythm rows stacked ===============
// Row weights give the two dense rows (Initialize ⊃ the : Type grid, Transform ⊃
// the op grids) extra height so their leaf labels aren't squeezed.

const content = group(
  'sa-content',
  wgrid({ cols: [1], rows: [4, 5.5, 5.5, 2], gap: 0.5, padding: 0 }, [
    { node: modelRow, at: [0, 0] },
    { node: initializeRow, at: [0, 1] },
    { node: transformRow, at: [0, 2] },
    { node: returnRow, at: [0, 3] },
  ]),
)

// =============== RIGHT COLUMN: Memory footprint ===============
// Where source-level constructs land at runtime. Heap is the busiest region
// (objects, collection nodes, Option/Try wrappers, function values) so it's taller.

const memory = container(
  { id: 'sa-memory', label: 'Memory', color: RED },
  wgrid({ cols: [1], rows: [1, 1.4, 1, 1], gap: 0.4, padding: 0.4 }, [
    { node: sym('sa-stack', 'Stack frame  (refs)', TEAL), at: [0, 0] },
    { node: sym('sa-heap', 'Heap  (boxed objects)', TEAL), at: [0, 1] },
    { node: sym('sa-hamt', 'HAMT  (persistent share)', TEAL), at: [0, 2] },
    { node: sym('sa-method-area', 'Method Area  (def bytecode)', TEAL), at: [0, 3] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'sa-root',
  wgrid({ cols: [4.5, 1], rows: [1], gap: 0.5, padding: 0.4 }, [
    { node: content, at: [0, 0] },
    { node: memory, at: [1, 0] },
  ]),
)

export const scalaAnatomy: SceneSpec = {
  id: 'scala-anatomy',
  topic: 'scala',
  title: 'Scala — Anatomy',
  subtitle: 'Model ▸ Initialize ▸ Transform ▸ Return, and where values live',
  // Taller canvas (source was 24×18) so the stacked rhythm rows get vertical room
  // and the dense leaf lists (: Type, Collection Ops) stop reading squeezed.
  canvas: { width: 1380, height: 1240 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // Model: inheritance arrows point UP from child to parent (UML)
    { from: 'sa-oop-mammal', to: 'sa-oop-animal', label: 'extends', color: PURPLE },
    { from: 'sa-oop-mammal', to: 'sa-oop-walker', label: 'with', color: PURPLE },
    { from: 'sa-oop-dog', to: 'sa-oop-mammal', label: 'extends', color: PURPLE },

    // Rhythm: Model -> Initialize -> Transform -> Return
    { from: 'sa-model', to: 'sa-init-row', label: 'instantiate', color: BLUE },
    { from: 'sa-init-row', to: 'sa-verbs', label: 'next', color: ORANGE },
    { from: 'sa-verbs', to: 'sa-results', label: 'next', color: GREEN },

    // Value -> Memory region (each Value form lands in its runtime home)
    { from: 'sa-value-primitive', to: 'sa-stack', label: 'lives on', color: TEAL },
    { from: 'sa-value-object', to: 'sa-heap', label: 'lives on', color: TEAL },
    { from: 'sa-value-collection', to: 'sa-hamt', label: 'persistent in', color: TEAL },
    { from: 'sa-value-defbody', to: 'sa-method-area', label: 'lives in', color: TEAL },

    // Transform <-> Memory <-> Return
    { from: 'sa-verbs', to: 'sa-memory', label: 'operates on', color: ORANGE },
    { from: 'sa-memory', to: 'sa-results', label: 'yields', color: GREEN },
  ],
}
