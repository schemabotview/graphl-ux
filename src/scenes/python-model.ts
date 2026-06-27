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

// Python's mirror of `scala-model` / `java-model`: it REPLACES the old
// `python-anatomy` (token-chip) scene. Keep anatomy's four-row spine — Model ▸ Bind ▸
// Transform ▸ Return + the Memory side column — but render the TRANSFORM band as
// actual `kind: 'code'` cards instead of token chips, so "what you do" reads as code
// you'd actually write. Model / Bind / Return stay as the structural token view on
// purpose: there the SHAPE is the lesson, and code would over-fill the cells. All
// structural `pa-*` ids are preserved verbatim so python-content's manifest
// highlight/focus references resolve; the Transform chips that became code cards are
// re-pointed via `aliases` (bottom).

// A bare TEXT leaf — no glyph, no fill (graphl-ux `label`). Default for the enumerated
// tokens (keywords, types, ops) and the class-hierarchy boxes in the untouched bands.
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
// abstracts; Protocol marks structural (duck-typed) interfaces.

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

// =============== ROW 2: TRANSFORM — what you do (NOW REAL CODE) ===============
// The merge payoff: the SAME six "verbs" as anatomy (comprehend ▸ branch ▸ loop ▸
// call ▸ unpack ▸ match) rendered as `code` cards in a 3×2 grid so each card has the
// width/height real code needs to stay legible. Comprehensions lead — Python's
// identity move. Colors mirror anatomy: comp/functions ORANGE, control-family YELLOW.

const codeComp = code(
  'pa-code-comp',
  '[f(x) for x in xs if p(x)]      # list\n{k: f(v) for k,v in d.items()}  # dict\n{f(x) for x in xs}              # set\n(f(x) for x in xs)              # lazy gen',
  ORANGE,
  'Comprehensions  ·  list · dict · set · gen',
)

const codeControl = code(
  'pa-code-control',
  's = "+" if x > 0 else "-"    # ternary expr\nif (n := len(xs)) > 9: ...   # walrus\na and b   /   a or b         # short-circuit',
  YELLOW,
  'Control  ·  ternary · walrus',
)

const codeLoops = code(
  'pa-code-loops',
  'for x in xs: ...\nfor i, x in enumerate(xs): ...\nwhile c: ...\nyield x * x                  # → generator',
  YELLOW,
  'Loops  ·  for · yield',
)

const codeFunctions = code(
  'pa-code-functions',
  'inc = lambda x: x + 1\ndef twice(g): return g(g(0))   # HOF\n@cache\ndef fib(n): ...                # decorator',
  ORANGE,
  'Functions  ·  lambda · HOF · deco',
)

const codeContext = code(
  'pa-code-context',
  'with open(p) as f:           # context mgr\n    data = f.read()\na, b = pair                  # unpack\na, *rest = xs                # star',
  YELLOW,
  'with / unpack',
)

const codeMatch = code(
  'pa-code-match',
  'match cmd:\n  case 0:           "zero"   # literal\n  case n if n > 9:  "big"    # guard\n  case (a, b):      a + b    # destructure\n  case _:           "other"  # wildcard',
  YELLOW,
  'match  (3.10+)',
)

const transformRow = container(
  { id: 'pa-verbs', label: 'Transform — what you do   |   real code:  comprehend ▸ branch ▸ loop ▸ call ▸ unpack ▸ match', color: ORANGE },
  // Tight gap/padding so the inner code cards claim the band's width/height; the
  // border-riding card titles need no extra top room.
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.18, padding: 0.15 }, [
    { node: codeComp, at: [0, 0] },
    { node: codeControl, at: [1, 0] },
    { node: codeLoops, at: [2, 0] },
    { node: codeFunctions, at: [0, 1] },
    { node: codeContext, at: [1, 1] },
    { node: codeMatch, at: [2, 1] },
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
// Transform gets MORE height now (9 vs 5) because it holds real multi-line code in a
// 3×2 grid, not one row of token chips.

const content = group(
  'pa-content',
  wgrid({ cols: [1], rows: [4, 4, 9, 2], gap: 0.5, padding: 0 }, [
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

export const pythonModel: SceneSpec = {
  id: 'python-model',
  topic: 'python',
  title: 'Python — Model (anatomy + code)',
  subtitle: 'Model ▸ Bind ▸ Transform (real code) ▸ Return, and where values live',
  // Taller than python-anatomy (1240 → 1520) so the Transform band's heavier weight
  // gives the 3×2 code grid vertical room without squeezing Model / Bind.
  canvas: { width: 1380, height: 1520 },
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
  // python-content's manifest still wires Transform sections to the OLD python-anatomy
  // chip ids (`pa-comp`, `pa-control`, `pa-loops`, `pa-fn`, `pa-context`, `pa-match`,
  // and their leaves) which this merge folded into six `code` cards. Each old id
  // resolves to the card that now shows that concept, so existing highlight/focus
  // references keep lighting the right place. Edit the map here, not the manifest.
  aliases: {
    // Comprehensions chip + leaves → the comprehensions code card
    'pa-comp': ['pa-code-comp'],
    'pa-comp-list': ['pa-code-comp'],
    'pa-comp-dict': ['pa-code-comp'],
    'pa-comp-set': ['pa-code-comp'],
    'pa-comp-gen': ['pa-code-comp'],

    // Control chip + leaves → the control code card
    'pa-control': ['pa-code-control'],
    'pa-ctrl-if': ['pa-code-control'],
    'pa-ctrl-tern': ['pa-code-control'],
    'pa-ctrl-walrus': ['pa-code-control'],
    'pa-ctrl-bool': ['pa-code-control'],

    // Loops chip + leaves → the loops code card (yield lives here too)
    'pa-loops': ['pa-code-loops'],
    'pa-loop-for': ['pa-code-loops'],
    'pa-loop-while': ['pa-code-loops'],
    'pa-loop-util': ['pa-code-loops'],
    'pa-loop-break': ['pa-code-loops'],
    'pa-loop-yield': ['pa-code-loops'],

    // Functions chip + leaves → the functions code card
    'pa-fn': ['pa-code-functions'],
    'pa-fn-def': ['pa-code-functions'],
    'pa-fn-deco': ['pa-code-functions'],
    'pa-fn-varargs': ['pa-code-functions'],

    // with / unpack chip + leaves → the context code card
    'pa-context': ['pa-code-context'],
    'pa-ctx-with': ['pa-code-context'],
    'pa-ctx-unpack': ['pa-code-context'],
    'pa-ctx-star': ['pa-code-context'],

    // match chip + leaves → the match code card
    'pa-match': ['pa-code-match'],
    'pa-match-stmt': ['pa-code-match'],
    'pa-match-dest': ['pa-code-match'],
  },
}
