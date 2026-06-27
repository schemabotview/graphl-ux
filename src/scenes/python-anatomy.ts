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

// Python's grammar of a program on one wide map — ported from NodeMap's
// `python-anatomy.ts`. Four stacked rhythm rows on the left (Model ▸ Bind ▸
// Transform ▸ Return) and a Memory side column on the right. Model is upstream of
// Bind: you sketch the type hierarchy first, then instantiate. Python has no
// val/var split and no type keyword — names just label heap objects, so the Bind
// row follows `x [: Type] = value` (no "Kind" slot Scala/Java use). Transform gives
// Comprehensions the biggest cell — that's Python's identity move. Return centers on
// exceptions (EAFP) rather than typed Option/Either. The mirror of `java-anatomy` /
// `scala-anatomy` for the Python concept. Geometry is faithful to the source's
// WEIGHTED grid tracks, which graphl-ux's resolver supports natively. Node ids are
// preserved verbatim so python-content's manifest `highlight`/`focus` references resolve.

// A bare TEXT leaf — no glyph, no fill (graphl-ux `label`). The default for the
// enumerated tokens (keywords, types, ops) and the class-hierarchy boxes.
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'label' })

// A filled CHIP whose text IS the concept (graphl-ux `term`). Kept for the Return row
// and the primitive type set.
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

// An icon glyph + label (graphl-ux `symbol`). Used for the Memory regions, which are
// concrete places data lives rather than language tokens.
const sym = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// =============== ROW 0: MODEL — class hierarchy ===============
// Python's twist is true multiple inheritance via MRO (C3 linearization): no
// `implements` keyword — every parent goes in the same `(...)`. ABC marks nominal
// abstracts; Protocol marks structural (duck-typed) interfaces. Connections labelled
// `inherits` point UP from child to parent.

const modelRow = container(
  { id: 'pa-model', label: 'Model — class hierarchy   |   ABC + Protocol ▸ class ▸ subclass   (MRO linearizes)', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.3, padding: 0.4 }, [
    { node: lbl('pa-oop-animal', 'class  Animal(ABC)', PURPLE), at: [0, 0] },
    { node: lbl('pa-oop-walker', 'class  Walker(Protocol)', PURPLE), at: [1, 0] },
    { node: lbl('pa-oop-mammal', 'class  Mammal(Animal, Walker)', PURPLE), at: [0, 1, 2, 1] },
    { node: lbl('pa-oop-dog', 'class  Dog(Mammal)', PURPLE), at: [0, 2, 2, 1] },
  ]),
)

// =============== ROW 1: BIND — naming an object ===============
// Anatomy: x [: Type] = value. No keyword introduces the binding; def, class,
// import, with-as, for-in are alternate surface syntaxes that also bind names.

const typePrimitives = container(
  { id: 'pa-t-prim', label: 'Primitive', color: GRAY },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
    { node: chip('pa-t-prim-int', 'int', GRAY), at: [0, 0] },
    { node: chip('pa-t-prim-str', 'str', GRAY), at: [1, 0] },
    { node: chip('pa-t-prim-bool', 'bool', GRAY), at: [0, 1] },
    { node: chip('pa-t-prim-float', 'float', GRAY), at: [1, 1] },
  ]),
)

const typeHints = container(
  { id: 'pa-type', label: ': Type   (optional, runtime-ignored)', color: PURPLE },
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.2, padding: 0.3 }, [
    { node: typePrimitives, at: [0, 0] },
    { node: lbl('pa-t-generic', 'list[T]  dict[K,V]', GRAY), at: [1, 0] },
    { node: lbl('pa-t-custom', 'Custom class', GRAY), at: [2, 0] },
    { node: lbl('pa-t-optional', 'Optional[T]   T | None', GRAY), at: [0, 1] },
    { node: lbl('pa-t-callable', 'Callable[..., R]', GRAY), at: [1, 1] },
    { node: lbl('pa-t-protocol', 'Protocol  (duck-typed)', GRAY), at: [2, 1] },
  ]),
)

// Value: what the name points at. Every form is a heap object — even int 42, even
// the function `print`. References, not boxes.
const value = container(
  { id: 'pa-value', label: 'Value   (always a heap object)', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('pa-value-primitive', "Primitive    42   True   'a'", GRAY), at: [0, 0] },
    { node: lbl('pa-value-container', 'Container    [..]   {..}   (..)', GRAY), at: [0, 1] },
    { node: lbl('pa-value-object', 'Instance     Person()   Point()', GRAY), at: [0, 2] },
    { node: lbl('pa-value-fn', 'Function     def / lambda', GRAY), at: [0, 3] },
    { node: lbl('pa-value-module', 'Module       import math', GRAY), at: [0, 4] },
  ]),
)

const bindRow = container(
  { id: 'pa-bind-row', label: 'Bind — naming an object   |   x  : Type  =  value   ▸   def / class / import / with-as / for-in also bind names', color: BLUE },
  wgrid({ cols: [0.9, 3.0, 0.4, 2.4], rows: [1], gap: 0.3, padding: 0.4 }, [
    { node: lbl('pa-name', 'Name  x', BLUE), at: [0, 0] },
    { node: typeHints, at: [1, 0] },
    { node: lbl('pa-equals', '=', BLUE), at: [2, 0] },
    { node: value, at: [3, 0] },
  ]),
)

// =============== ROW 2: TRANSFORM — what you do ===============
// Comprehensions get the biggest cell — Python's identity move, collapsing
// filter+map into one expression. match is recent (3.10+) and still secondary.

const comprehensions = container(
  { id: 'pa-comp', label: 'Comprehensions', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('pa-comp-list', '[f(x) for x in xs if p(x)]', GRAY), at: [0, 0] },
    { node: lbl('pa-comp-dict', '{k: f(v) for k,v in d.items()}', GRAY), at: [1, 0] },
    { node: lbl('pa-comp-set', '{f(x) for x in xs}', GRAY), at: [0, 1] },
    { node: lbl('pa-comp-gen', '(f(x) for x in xs)   → lazy gen', GRAY), at: [1, 1] },
  ]),
)

const control = container(
  { id: 'pa-control', label: 'Control', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('pa-ctrl-if', 'if / elif / else', GRAY), at: [0, 0] },
    { node: lbl('pa-ctrl-tern', 'a if c else b   (expr)', GRAY), at: [0, 1] },
    { node: lbl('pa-ctrl-walrus', 'walrus  x := expr', GRAY), at: [0, 2] },
    { node: lbl('pa-ctrl-bool', 'and / or  short-circuit', GRAY), at: [0, 3] },
  ]),
)

const loops = container(
  { id: 'pa-loops', label: 'Loops', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.12, padding: 0.3 }, [
    { node: lbl('pa-loop-for', 'for x in iterable', GRAY), at: [0, 0] },
    { node: lbl('pa-loop-while', 'while c:', GRAY), at: [0, 1] },
    { node: lbl('pa-loop-util', 'enumerate / zip / map', GRAY), at: [0, 2] },
    { node: lbl('pa-loop-break', 'break / continue / else', GRAY), at: [0, 3] },
    { node: lbl('pa-loop-yield', 'yield  → generator', GRAY), at: [0, 4] },
  ]),
)

const functions = container(
  { id: 'pa-fn', label: 'Functions', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('pa-fn-def', 'def / lambda', GRAY), at: [0, 0] },
    { node: lbl('pa-fn-deco', '@decorator', GRAY), at: [0, 1] },
    { node: lbl('pa-fn-varargs', '*args  **kwargs', GRAY), at: [0, 2] },
  ]),
)

const context = container(
  { id: 'pa-context', label: 'with  /  unpack', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('pa-ctx-with', 'with open(p) as f:', GRAY), at: [0, 0] },
    { node: lbl('pa-ctx-unpack', 'a, b = pair', GRAY), at: [0, 1] },
    { node: lbl('pa-ctx-star', 'a, *rest = xs', GRAY), at: [0, 2] },
  ]),
)

const matchCase = container(
  { id: 'pa-match', label: 'match  (3.10+)', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('pa-match-stmt', 'match x: case ...', GRAY), at: [0, 0] },
    { node: lbl('pa-match-dest', 'destructure + guard', GRAY), at: [0, 1] },
  ]),
)

const transformRow = container(
  { id: 'pa-verbs', label: 'Transform — what you do   |   comprehend ▸ branch ▸ loop ▸ call ▸ unpack ▸ match', color: ORANGE },
  wgrid({ cols: [1.6, 0.9, 1.0, 1.0, 0.9, 1.0], rows: [1], gap: 0.25, padding: 0.4 }, [
    { node: comprehensions, at: [0, 0] },
    { node: control, at: [1, 0] },
    { node: loops, at: [2, 0] },
    { node: functions, at: [3, 0] },
    { node: context, at: [4, 0] },
    { node: matchCase, at: [5, 0] },
  ]),
)

// =============== ROW 3: RETURN — what comes back ===============
// Failure is exceptions (EAFP), not Option/Either. Mutation is a peer outcome, not
// a segregated off-ramp. raise is RED (failure path); mutation stays GRAY (impure).

const returnRow = container(
  { id: 'pa-results', label: 'Return — what comes back   |   exceptions, not Option/Either', color: GREEN },
  wgrid({ cols: [1, 1, 1, 1.1], rows: [1], gap: 0.3, padding: 0.4 }, [
    { node: chip('pa-ret-value', 'return value   (or None)', GREEN), at: [0, 0] },
    { node: chip('pa-ret-yield', 'yield   → lazy stream', GREEN), at: [1, 0] },
    { node: chip('pa-ret-raise', 'raise / try-except   (EAFP)', RED), at: [2, 0] },
    { node: chip('pa-ret-mutate', 'mutation   (print, list.append, x.attr=)', GRAY), at: [3, 0] },
  ]),
)

// =============== LEFT CONTENT BLOCK: four rhythm rows stacked ===============

const content = group(
  'pa-content',
  wgrid({ cols: [1], rows: [4, 4, 5, 2], gap: 0.5, padding: 0 }, [
    { node: modelRow, at: [0, 0] },
    { node: bindRow, at: [0, 1] },
    { node: transformRow, at: [0, 2] },
    { node: returnRow, at: [0, 3] },
  ]),
)

// =============== RIGHT COLUMN: Memory footprint ===============
// A name is a label, not a box. The stack frame holds name → ref entries; every
// object — including int 42 and the function `print` — lives on the heap. GC is
// reference-counting plus a cycle collector. The GIL means only one thread executes
// Python bytecode at a time.

const memory = container(
  { id: 'pa-memory', label: 'Memory', color: RED },
  wgrid({ cols: [1], rows: [1, 1.4, 1, 1], gap: 0.4, padding: 0.4 }, [
    { node: sym('pa-mem-stack', 'Stack frame   (locals: name → ref)', TEAL), at: [0, 0] },
    {
      node: container(
        { id: 'pa-mem-heap', label: 'Heap   (every PyObject)', color: TEAL },
        wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
          { node: lbl('pa-mem-heap-type', 'type       (which class)', GRAY), at: [0, 0] },
          { node: lbl('pa-mem-heap-val', 'value      (the payload)', GRAY), at: [0, 1] },
          { node: lbl('pa-mem-heap-refs', 'refcount   (freed at 0)', GRAY), at: [0, 2] },
        ]),
      ),
      at: [0, 1],
    },
    { node: sym('pa-mem-gc', 'RefCount + Cycle GC', TEAL), at: [0, 2] },
    { node: sym('pa-mem-gil', 'GIL   (one thread runs bytecode)', TEAL), at: [0, 3] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'pa-root',
  wgrid({ cols: [4.5, 1], rows: [1], gap: 0.5, padding: 0.02 }, [
    { node: content, at: [0, 0] },
    { node: memory, at: [1, 0] },
  ]),
)

export const pythonAnatomy: SceneSpec = {
  id: 'python-anatomy',
  topic: 'python',
  title: 'Python — Anatomy',
  subtitle: 'Model ▸ Bind ▸ Transform ▸ Return, and where values live',
  // Taller canvas (source was 24×18) so the stacked rhythm rows get vertical room.
  canvas: { width: 1380, height: 1240 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // Model: inheritance arrows point UP from child to parent (UML)
    { from: 'pa-oop-mammal', to: 'pa-oop-animal', label: 'inherits', color: PURPLE },
    { from: 'pa-oop-mammal', to: 'pa-oop-walker', label: 'inherits', color: PURPLE },
    { from: 'pa-oop-dog', to: 'pa-oop-mammal', label: 'inherits', color: PURPLE },

    // Rhythm: Model -> Bind -> Transform -> Return
    { from: 'pa-model', to: 'pa-bind-row', label: 'instantiate', color: BLUE },
    { from: 'pa-bind-row', to: 'pa-verbs', label: 'next', color: ORANGE },
    { from: 'pa-verbs', to: 'pa-results', label: 'next', color: GREEN },

    // Value -> Heap: every form (even int 42, even functions) lives on the heap
    { from: 'pa-value', to: 'pa-mem-heap', label: 'every form lives on', color: TEAL },

    // Transform <-> Memory <-> Return
    { from: 'pa-verbs', to: 'pa-memory', label: 'reads/mutates', color: ORANGE },
    { from: 'pa-memory', to: 'pa-results', label: 'yields', color: GREEN },
  ],
}
