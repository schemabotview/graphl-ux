import type { SceneSpec } from '../engine/types.ts'
import {
  code,
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// MERGE of `scala-anatomy` (the structural mental model) and `scala-grammar`
// (real syntax-highlighted code). Keep anatomy's four-row spine — Model ▸ Initialize
// ▸ Transform ▸ Return + the Memory side column — but render the TRANSFORM band as
// actual `kind: 'code'` cards instead of token chips, so "what you do" reads as code
// you'd actually write. Model / Initialize / Return stay as the structural token view
// on purpose: there the SHAPE is the lesson, and code would over-fill the cells. This
// is the first slice (Transform only); Initialize/Return may gain code later.

// A bare TEXT leaf — no glyph, no fill (graphl-ux `label`). Default for the enumerated
// tokens (keywords, types, ops) and the class-hierarchy boxes in the untouched bands.
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

// =============== ROW 2: TRANSFORM — what you do (NOW REAL CODE) ===============
// The merge payoff: this band is the SAME six "verbs" as anatomy (call ▸ fn ▸ ops ▸
// branch ▸ match ▸ loop) but rendered as `code` cards (snippets lifted from
// scala-grammar). Reflowed from one 6-wide row into a 3×2 grid so each card has the
// width/height real code needs to stay legible; the camera frames one card per
// section in the reel. Colors mirror anatomy: fn-family ORANGE, control-family YELLOW.

const codeMethods = code(
  'sa-code-methods',
  'obj.foo(x)              // method call\ndef area = w * h        // def in class\n"abc".length            // stdlib method',
  ORANGE,
  'Methods  ·  call · def',
)

const codeFunctions = code(
  'sa-code-functions',
  'val inc = (x: Int) => x + 1\nval f: Int => Int = _ + 1   // shorthand\ndef twice(g: Int=>Int) = g(g(0))  // HOF',
  ORANGE,
  'Functions  ·  lambda · HOF',
)

const codeCollOps = code(
  'sa-code-collops',
  'xs.map(_ * 2)\nxs.filter(_ > 2)\nxs.flatMap(n => List(n, -n))\nxs.foldLeft(0)(_ + _)   // sum\nxs.groupBy(_ % 2)       // Map[Int,List]',
  ORANGE,
  'Collection Ops  ·  map · fold',
)

const codeControl = code(
  'sa-code-control',
  'val s = if x > 0 then "+" else "-"\n// if-else IS an expression (returns)\nwhile i < n do i += 1   // the one stmt',
  YELLOW,
  'Control  ·  branch (expression)',
)

const codePattern = code(
  'sa-code-pattern',
  'x match\n  case 0          => "zero"   // literal\n  case n if n > 9 => "big"    // guard\n  case (a, b)     => a + b    // tuple\n  case h :: t     => h        // sequence\n  case _          => "other"  // wildcard',
  YELLOW,
  'Pattern Match  ·  match / case',
)

const codeLoops = code(
  'sa-code-loops',
  'for x <- xs yield x * x      // comprehension\nfor\n  x <- xs; y <- ys          // multi-generator\nyield (x, y)\n// desugars to flatMap / map',
  YELLOW,
  'Loops  ·  for-yield',
)

const transformRow = container(
  { id: 'sa-verbs', label: 'Transform — what you do   |   real code:  call ▸ fn ▸ ops ▸ branch ▸ match ▸ loop', color: ORANGE },
  // Tight gap/padding so the inner code cards claim the band's width/height; the
  // border-riding card titles need no extra top room.
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.18, padding: 0.15 }, [
    { node: codeMethods, at: [0, 0] },
    { node: codeFunctions, at: [1, 0] },
    { node: codeCollOps, at: [2, 0] },
    { node: codeControl, at: [0, 1] },
    { node: codePattern, at: [1, 1] },
    { node: codeLoops, at: [2, 1] },
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
// Transform gets MORE height now (8 vs 5.5) because it holds real multi-line code in a
// 3×2 grid, not one row of token chips.

const content = group(
  'sa-content',
  wgrid({ cols: [1], rows: [4, 5.5, 9, 2], gap: 0.5, padding: 0 }, [
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

export const scalaModel: SceneSpec = {
  id: 'scala-model',
  topic: 'scala',
  title: 'Scala — Model (anatomy + code)',
  subtitle: 'Model ▸ Initialize ▸ Transform (real code) ▸ Return, and where values live',
  // Taller than scala-anatomy (1240 → 1520) so the Transform band's heavier weight
  // gives the 3×2 code grid vertical room without squeezing Model / Initialize.
  canvas: { width: 1380, height: 1520 },
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
