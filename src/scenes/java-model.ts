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

// Java's mirror of `scala-model`: it REPLACES the old `java-anatomy` (token-chip)
// scene. Keep anatomy's four-row spine — Model ▸ Initialize ▸ Transform ▸ Return +
// the Memory side column — but render the TRANSFORM band as actual `kind: 'code'`
// cards instead of token chips, so "what you do" reads as code you'd actually write.
// Model / Initialize / Return stay as the structural token view on purpose: there the
// SHAPE is the lesson, and code would over-fill the cells. All structural `ja-*` ids
// are preserved verbatim so java-content's manifest highlight/focus references resolve;
// the Transform chips that became code cards are re-pointed via `aliases` (bottom).

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
// Java's twist vs Scala: a class extends ONE parent and `implements` any number of
// interfaces (vs Scala's `with` trait mix-in).

const modelRow = container(
  { id: 'ja-model', label: 'Model — class hierarchy   |   abstract + interface ▸ class ▸ subclass', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.7, padding: 0.4 }, [
    { node: lbl('ja-oop-animal', 'abstract class  Animal', PURPLE), at: [0, 0] },
    { node: lbl('ja-oop-walker', 'interface  Walker', PURPLE), at: [1, 0] },
    { node: lbl('ja-oop-mammal', 'class  Mammal   extends Animal   implements Walker', PURPLE), at: [0, 1, 2, 1] },
    { node: lbl('ja-oop-dog', 'class  Dog   extends Mammal', PURPLE), at: [0, 2, 2, 1] },
  ]),
)

// =============== ROW 1: INITIALIZE — anatomy of a binding ===============

const kind = container(
  { id: 'ja-kind', label: 'Modifier', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
    { node: lbl('ja-bind-final', 'final', GRAY), at: [0, 0] },
    { node: lbl('ja-bind-static', 'static', GRAY), at: [0, 1] },
    { node: lbl('ja-bind-private', 'private', GRAY), at: [0, 2] },
  ]),
)

const typePrimitives = container(
  { id: 'ja-primitive', label: 'Primitives', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-prim-int', 'int', GRAY), at: [0, 0] },
    { node: lbl('ja-prim-long', 'long', GRAY), at: [0, 1] },
    { node: lbl('ja-prim-double', 'double', GRAY), at: [0, 2] },
    { node: lbl('ja-prim-float', 'float', GRAY), at: [0, 3] },
    { node: lbl('ja-prim-boolean', 'boolean', GRAY), at: [0, 4] },
    { node: lbl('ja-prim-char', 'char', GRAY), at: [0, 5] },
  ]),
)

const typeCollections = container(
  { id: 'ja-type-coll', label: 'Collections', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-coll-list', 'List', GRAY), at: [0, 0] },
    { node: lbl('ja-coll-deque', 'Deque', GRAY), at: [0, 1] },
    { node: lbl('ja-coll-map', 'Map', GRAY), at: [0, 2] },
    { node: lbl('ja-coll-set', 'Set', GRAY), at: [0, 3] },
  ]),
)

const typeOop = container(
  { id: 'ja-type-oop', label: 'OOP', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-class', 'class', GRAY), at: [0, 0] },
    { node: lbl('ja-interface', 'interface', GRAY), at: [0, 1] },
    { node: lbl('ja-abstract', 'abstract', GRAY), at: [0, 2] },
    { node: lbl('ja-record', 'record', GRAY), at: [0, 3] },
    { node: lbl('ja-enum', 'enum', GRAY), at: [0, 4] },
  ]),
)

const typeMeta = container(
  { id: 'ja-type-meta', label: 'Meta', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.1, padding: 0.2 }, [
    { node: lbl('ja-generic', 'Generic<A>', GRAY), at: [0, 0] },
    { node: lbl('ja-sealed', 'sealed', GRAY), at: [0, 1] },
    { node: lbl('ja-array', 'Array', GRAY), at: [0, 2] },
    { node: lbl('ja-optional', 'Optional', GRAY), at: [0, 3] },
  ]),
)

const typeShapes = container(
  { id: 'ja-type', label: 'Type', color: PURPLE },
  wgrid({ cols: [0.6, 1, 1, 1.1, 1.1], rows: [1], gap: 0.2, padding: 0.3 }, [
    { node: lbl('ja-type-var', 'var', GRAY), at: [0, 0] },
    { node: typePrimitives, at: [1, 0] },
    { node: typeCollections, at: [2, 0] },
    { node: typeOop, at: [3, 0] },
    { node: typeMeta, at: [4, 0] },
  ]),
)

const value = container(
  { id: 'ja-value', label: 'Value', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.18, padding: 0.3 }, [
    { node: lbl('ja-value-primitive', "Primitive    42  true  'a'", GRAY), at: [0, 0] },
    { node: lbl('ja-value-object', 'Object       new Person()', GRAY), at: [0, 1] },
    { node: lbl('ja-value-collection', 'Collection   List.of()  Map.of()', GRAY), at: [0, 2] },
    { node: lbl('ja-value-defbody', 'Method body   n + 1   { ... }', GRAY), at: [0, 3] },
  ]),
)

const initializeRow = container(
  { id: 'ja-init-row', label: 'Initialize — anatomy of a binding   |   [Modifier]  Type  Name  =  Value', color: BLUE },
  wgrid({ cols: [1.1, 4.2, 0.9, 0.4, 1.5], rows: [1], gap: 0.3, padding: 0.4 }, [
    { node: kind, at: [0, 0] },
    { node: typeShapes, at: [1, 0] },
    { node: lbl('ja-name', 'Name  s', BLUE), at: [2, 0] },
    { node: lbl('ja-equals', '=', BLUE), at: [3, 0] },
    { node: value, at: [4, 0] },
  ]),
)

// =============== ROW 2: TRANSFORM — what you do (NOW REAL CODE) ===============
// The merge payoff: the SAME six "verbs" as anatomy (call ▸ fn ▸ ops ▸ branch ▸
// match ▸ loop) rendered as `code` cards in a 3×2 grid so each card has the
// width/height real code needs to stay legible. Colors mirror anatomy: fn-family
// ORANGE, control-family YELLOW. The camera frames one card per section in the reel.

const codeMethods = code(
  'ja-code-methods',
  'obj.foo(x)              // method call\nint area() { return w*h; }  // def\n"abc".length()          // stdlib method',
  ORANGE,
  'Methods  ·  call · def',
)

const codeFunctions = code(
  'ja-code-functions',
  'Function<Integer,Integer> inc = x -> x+1;\nUnaryOperator<Integer> f = n -> n + 1;\nlist.forEach(System.out::println); // ref',
  ORANGE,
  'Lambdas  ·  lambda · method ref',
)

const codeStreamOps = code(
  'ja-code-streamops',
  'xs.stream().map(x -> x * 2)\n  .filter(x -> x > 2)\n  .flatMap(n -> Stream.of(n, -n))\n  .toList();                  // collect\nxs.stream().reduce(0, Integer::sum); // sum\nxs.stream().collect(groupingBy(x->x%2));',
  ORANGE,
  'Stream Ops  ·  map · collect',
)

const codeControl = code(
  'ja-code-control',
  'String s = x > 0 ? "+" : "-";  // ternary\n// switch expr (14+) IS an expression\nwhile (i < n) i += 1;   // statement',
  YELLOW,
  'Control  ·  branch (expression)',
)

const codePattern = code(
  'ja-code-pattern',
  'switch (o) {\n  case Integer i when i > 9 -> "big"; // guard\n  case Integer i            -> "int";\n  case Point(int x, int y)  -> x + y; // record\n  case null, default        -> "other";\n}',
  YELLOW,
  'Pattern Match  ·  switch / case',
)

const codeLoops = code(
  'ja-code-loops',
  'for (int i = 0; i < n; i++) { ... }  // index\nfor (var x : xs) { ... }      // for-each\n// no for-yield — build via Stream:\nIntStream.range(0, n).map(i -> i*i);',
  YELLOW,
  'Loops  ·  for / for-each',
)

const transformRow = container(
  { id: 'ja-verbs', label: 'Transform — what you do   |   real code:  call ▸ fn ▸ ops ▸ branch ▸ match ▸ loop', color: ORANGE },
  // Tight gap/padding so the inner code cards claim the band's width/height; the
  // border-riding card titles need no extra top room.
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.18, padding: 0.15 }, [
    { node: codeMethods, at: [0, 0] },
    { node: codeFunctions, at: [1, 0] },
    { node: codeStreamOps, at: [2, 0] },
    { node: codeControl, at: [0, 1] },
    { node: codePattern, at: [1, 1] },
    { node: codeLoops, at: [2, 1] },
  ]),
)

// =============== ROW 3: RETURN — what comes back ===============
// Effects chip stays GRAY on purpose — secondary, impure off-ramp from the pipeline.

const returnRow = container(
  { id: 'ja-results', label: 'Return — what comes back', color: GREEN },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.35, padding: 0.4 }, [
    { node: chip('ja-new-coll', 'Collected result', GREEN), at: [0, 0] },
    { node: chip('ja-typed-failure', 'Optional / checked throws', BLUE), at: [1, 0] },
    { node: chip('ja-effects', 'Effects (println, IO)', GRAY), at: [2, 0] },
  ]),
)

// =============== LEFT CONTENT BLOCK: four rhythm rows stacked ===============
// Transform gets MORE height now (9 vs 5.5) because it holds real multi-line code in a
// 3×2 grid, not one row of token chips.

const content = group(
  'ja-content',
  wgrid({ cols: [1], rows: [4.5, 5.5, 9, 2], gap: 0.5, padding: 0 }, [
    { node: modelRow, at: [0, 0] },
    { node: initializeRow, at: [0, 1] },
    { node: transformRow, at: [0, 2] },
    { node: returnRow, at: [0, 3] },
  ]),
)

// =============== RIGHT COLUMN: Memory footprint ===============

const memory = container(
  { id: 'ja-memory', label: 'Memory', color: RED },
  wgrid({ cols: [1], rows: [1, 1.4, 1, 1], gap: 0.4, padding: 0.4 }, [
    { node: sym('ja-stack', 'Stack frame  (refs)', TEAL), at: [0, 0] },
    { node: sym('ja-heap', 'Heap  (objects)', TEAL), at: [0, 1] },
    { node: sym('ja-immutable', 'Immutable view  (List.of)', TEAL), at: [0, 2] },
    { node: sym('ja-method-area', 'Method Area  (bytecode)', TEAL), at: [0, 3] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'ja-root',
  wgrid({ cols: [4.5, 1], rows: [1], gap: 0.5, padding: 0.02 }, [
    { node: content, at: [0, 0] },
    { node: memory, at: [1, 0] },
  ]),
)

export const javaModel: SceneSpec = {
  id: 'java-model',
  topic: 'java',
  title: 'Java — Model (anatomy + code)',
  subtitle: 'Model ▸ Initialize ▸ Transform (real code) ▸ Return, and where values live',
  // Taller than java-anatomy (1240 → 1520) so the Transform band's heavier weight
  // gives the 3×2 code grid vertical room without squeezing Model / Initialize.
  canvas: { width: 1380, height: 1520 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // Model: inheritance arrows point UP from child to parent (UML)
    { from: 'ja-oop-mammal', to: 'ja-oop-animal', label: 'extends', color: PURPLE },
    { from: 'ja-oop-mammal', to: 'ja-oop-walker', label: 'implements', color: PURPLE },
    { from: 'ja-oop-dog', to: 'ja-oop-mammal', label: 'extends', color: PURPLE },

    // Rhythm: Model -> Initialize -> Transform -> Return
    { from: 'ja-model', to: 'ja-init-row', label: 'instantiate', color: BLUE },
    { from: 'ja-init-row', to: 'ja-verbs', label: 'next', color: ORANGE },
    { from: 'ja-verbs', to: 'ja-results', label: 'next', color: GREEN },

    // Value -> Memory region
    { from: 'ja-value-primitive', to: 'ja-stack', label: 'lives on', color: TEAL },
    { from: 'ja-value-object', to: 'ja-heap', label: 'lives on', color: TEAL },
    { from: 'ja-value-collection', to: 'ja-immutable', label: 'immutable in', color: TEAL },
    { from: 'ja-value-defbody', to: 'ja-method-area', label: 'lives in', color: TEAL },

    // Transform <-> Memory <-> Return
    { from: 'ja-verbs', to: 'ja-memory', label: 'operates on', color: ORANGE },
    { from: 'ja-memory', to: 'ja-results', label: 'yields', color: GREEN },
  ],
  // java-content's manifest still wires Transform sections to the OLD java-anatomy
  // chip ids (`ja-control`, `ja-loops`, `ja-pattern`, `ja-methods`, `ja-functions`,
  // `ja-coll-ops`, and their leaves) which this merge folded into six `code` cards.
  // Each old id resolves to the card that now shows that concept, so existing
  // highlight/focus references keep lighting the right place. Edit the map here, not
  // the manifest — the manifest stays source-of-truth wiring.
  aliases: {
    // Methods chip + leaves → the methods code card
    'ja-methods': ['ja-code-methods'],
    'ja-method-call': ['ja-code-methods'],
    'ja-method-def': ['ja-code-methods'],

    // Lambdas chip + leaves → the functions code card
    'ja-functions': ['ja-code-functions'],
    'ja-fn-lambda': ['ja-code-functions'],
    'ja-fn-methodref': ['ja-code-functions'],
    'ja-fn-iface': ['ja-code-functions'],

    // Stream Ops chip + leaves → the stream-ops code card
    'ja-coll-ops': ['ja-code-streamops'],
    'ja-op-map': ['ja-code-streamops'],
    'ja-op-filter': ['ja-code-streamops'],
    'ja-op-flatmap': ['ja-code-streamops'],
    'ja-op-reduce': ['ja-code-streamops'],
    'ja-op-collect': ['ja-code-streamops'],
    'ja-op-groupby': ['ja-code-streamops'],

    // Control chip + leaves → the control code card
    'ja-control': ['ja-code-control'],
    'ja-ctrl-if': ['ja-code-control'],
    'ja-ctrl-tern': ['ja-code-control'],
    'ja-ctrl-switch': ['ja-code-control'],
    'ja-ctrl-guard': ['ja-code-pattern'], //  the guard example lives in the pattern card

    // Pattern Match chip + leaves → the pattern code card
    'ja-pattern': ['ja-code-pattern'],
    'ja-pat-match': ['ja-code-pattern'],
    'ja-pat-record': ['ja-code-pattern'],

    // Loops chip + leaves → the loops code card
    'ja-loops': ['ja-code-loops'],
    'ja-loop-for': ['ja-code-loops'],
    'ja-loop-foreach': ['ja-code-loops'],
    'ja-loop-while': ['ja-code-loops'],
    'ja-loop-dowhile': ['ja-code-loops'],
    'ja-loop-break': ['ja-code-loops'],
    'ja-loop-continue': ['ja-code-loops'],
  },
}
