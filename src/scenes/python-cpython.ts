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

// The Python-on-CPython runtime on one wide map — ported from NodeMap's `python.ts`
// (`~/Projects/NodeMap/src/data/scenes/python.ts`). Top band: the source pipeline
// (.py → compile() → __pycache__/*.pyc) feeding the Import Sub-System (finding ▸
// loading ▸ initialization). Middle band: the CPython runtime (interpreter state ⊃
// GIL/sys.modules, object heap, pymalloc, per-thread frame chains). Bottom band: the
// Execution Engine (CEval loop + specializer/JIT + GC), the C API, and native ext
// modules. A CPU layer is the hardware boundary. The mirror of `java-jvm`/`scala-jvm`
// for the Python concept. Geometry is faithful to the source: it used WEIGHTED grid
// tracks, which graphl-ux's resolver supports NATIVELY — a grid's `cols`/`rows` can
// be relative-weight arrays and a child's `cell` indexes those tracks directly.
// `wgrid()` is the thin authoring shim. Node ids are preserved verbatim so
// python-content's manifest `highlight`/`focus` references resolve.

// A COMPONENT leaf — icon glyph + label (graphl-ux `symbol`, NodeMap's default box).
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

// A bare LABEL leaf — text only, no glyph/fill (graphl-ux `label`). Use for the
// tiny per-thread state abbreviations where a glyph would just be noise.
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'label' })

// Native weighted-track authoring: the grid carries the relative track WEIGHTS and
// each child's `at` becomes its `cell`, indexing those tracks 1:1 (see java-jvm.ts).
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// =============== TOP: source pipeline + import sub-system ===============

const pipeline = group(
  'py-pipeline',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.35, padding: 0 }, [
    { node: comp('py-source', 'Python src (.py)', GRAY), at: [0, 0] },
    { node: comp('py-compiler', 'compile()', GRAY), at: [0, 1] },
    { node: comp('pyc-file', '__pycache__/*.pyc', YELLOW), at: [0, 2] },
  ]),
)

const finding = container(
  { id: 'finding', label: 'Finding', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.3 }, [
    { node: comp('builtin-finder', 'Builtin Finder', BLUE), at: [0, 0] },
    { node: comp('frozen-finder', 'Frozen Finder', BLUE), at: [0, 1] },
    { node: comp('path-finder', 'Path Finder', BLUE), at: [0, 2] },
  ]),
)

const loading = container(
  { id: 'loading-py', label: 'Loading', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.3 }, [
    { node: comp('source-loader', 'Source Loader', BLUE), at: [0, 0] },
    { node: comp('bytecode-loader', 'Bytecode Loader', BLUE), at: [0, 1] },
    { node: comp('extension-loader', 'Extension Loader', BLUE), at: [0, 2] },
  ]),
)

const importSubSystem = container(
  { id: 'import-subsystem', label: 'Import Sub-System', color: TEAL },
  wgrid({ cols: [1.4, 1.4, 1.6], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: finding, at: [0, 0] },
    { node: loading, at: [1, 0] },
    { node: comp('py-initialization', 'Initialization', GRAY), at: [2, 0] },
  ]),
)

const top = group(
  'py-top',
  wgrid({ cols: [3.5, 14], rows: [1], gap: 0.5, padding: 0 }, [
    { node: pipeline, at: [0, 0] },
    { node: importSubSystem, at: [1, 0] },
  ]),
)

// =============== MIDDLE: CPython runtime (GIL + heap + pymalloc + threads) ===============

// Process-wide interpreter state. The GIL is the one lock that gates bytecode
// execution; sys.modules + the interned cache are the global registries.
const interpreterState = container(
  { id: 'interp-state', label: 'Interpreter State', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('gil', 'GIL', RED), at: [0, 0] },
    { node: comp('sys-modules', 'sys.modules', BLUE), at: [0, 1] },
    { node: comp('interned', 'Interned Cache', BLUE), at: [0, 2] },
  ]),
)

// Every value is a heap PyObject carrying ob_refcnt. Code objects and module
// dicts live here too — they're PyObjects like anything else.
const objectHeap = container(
  { id: 'object-heap', label: 'Object Heap (PyObjects)', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('pyobject', 'PyObject (ob_refcnt)', BLUE), at: [0, 0] },
    { node: comp('code-object', 'Code Object', BLUE), at: [0, 1] },
    { node: comp('module-dicts', 'Module / Class Dicts', BLUE), at: [0, 2] },
  ]),
)

// pymalloc: arena -> pool -> block hierarchy backing small-object allocations.
const pymalloc = container(
  { id: 'pymalloc', label: 'pymalloc', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('arenas', 'Arenas', BLUE), at: [0, 0] },
    { node: comp('pools', 'Pools', BLUE), at: [0, 1] },
    { node: comp('blocks', 'Blocks', BLUE), at: [0, 2] },
  ]),
)

// Per-thread state: a PyThreadState holds a pointer to the current frame; the frame
// chain is an f_back-linked list of heap PyFrameObjects. The C stack is the real OS
// stack for that thread.
const threadStack = (id: string, label: string, suffix: string) =>
  container(
    { id, label, color: BLUE },
    wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
      { node: lbl(`tstate-${suffix}`, 'PyThreadState', GRAY), at: [0, 0] },
      { node: lbl(`frames-${suffix}`, 'Frame Chain', GRAY), at: [0, 1] },
      { node: lbl(`cstack-${suffix}`, 'C Stack', GRAY), at: [0, 2] },
    ]),
  )

const perThread = container(
  { id: 'per-thread', label: 'Per-Thread State', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: threadStack('thread-1', 'Thread 1', '1'), at: [0, 0] },
    { node: threadStack('thread-n', 'Thread n', 'n'), at: [1, 0] },
  ]),
)

const memoryArea = container(
  { id: 'memory-area-py', label: 'CPython Runtime', color: TEAL },
  wgrid({ cols: [2.2, 2.4, 1.6, 3.8], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: interpreterState, at: [0, 0] },
    { node: objectHeap, at: [1, 0] },
    { node: pymalloc, at: [2, 0] },
    { node: perThread, at: [3, 0] },
  ]),
)

// =============== BOTTOM: Execution Engine + C API + native ext modules ===============

const specializer = container(
  { id: 'specializer', label: 'Specializing Interpreter / JIT', color: ORANGE },
  wgrid({ cols: [1.6, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('bytecode-rewriter', 'Bytecode Rewriter', BLUE), at: [0, 0] },
    { node: comp('inline-cache', 'Inline Cache (PIC)', BLUE), at: [0, 1] },
    { node: comp('native-code-gen', 'Native Code Gen', BLUE), at: [0, 2] },
    { node: comp('py-profile', 'Profile', GRAY), at: [1, 0, 1, 3] },
  ]),
)

const execEngine = container(
  { id: 'exec-engine-py', label: 'Execution Engine', color: TEAL },
  wgrid({ cols: [1, 2.5, 1], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: comp('ceval', 'CEval Loop', GRAY), at: [0, 0] },
    { node: specializer, at: [1, 0] },
    { node: comp('gc-py', 'Garbage Collector', GREEN), at: [2, 0] },
  ]),
)

const bottom = group(
  'py-bottom',
  wgrid({ cols: [8.5, 2.5, 2.5], rows: [1], gap: 0.45, padding: 0 }, [
    { node: execEngine, at: [0, 0] },
    { node: comp('c-api', 'C API', BLUE), at: [1, 0] },
    { node: comp('native-ext', 'Native Ext Mods', BLUE), at: [2, 0] },
  ]),
)

// =============== CPU LAYER (hardware boundary) ===============

const cpuLayer = group(
  'py-cpu-layer',
  wgrid({ cols: [1], rows: [1], gap: 0, padding: 0 }, [
    { node: comp('cpu-py', 'CPU (Processor)', PURPLE), at: [0, 0] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'python-root',
  wgrid({ cols: [1], rows: [4.5, 5, 5, 1.5], gap: 0.5, padding: 0.4 }, [
    { node: top, at: [0, 0] },
    { node: memoryArea, at: [0, 1] },
    { node: bottom, at: [0, 2] },
    { node: cpuLayer, at: [0, 3] },
  ]),
)

export const pythonCpython: SceneSpec = {
  id: 'python-cpython',
  topic: 'python',
  title: 'Python on CPython',
  subtitle: 'Source → import system → runtime → execution engine → CPU',
  // ~24:17 canvas so the wide runtime grid renders with roughly square cells.
  canvas: { width: 1440, height: 1020 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // finders on sys.meta_path are tried in order; each returns None or a spec
    { from: 'builtin-finder', to: 'frozen-finder', label: 'miss', color: BLUE },
    { from: 'frozen-finder', to: 'path-finder', label: 'miss', color: BLUE },

    // PathFinder dispatches to one loader per module, picked by file suffix
    { from: 'path-finder', to: 'source-loader', label: '.py', color: BLUE },
    { from: 'path-finder', to: 'bytecode-loader', label: '.pyc', color: BLUE },
    { from: 'path-finder', to: 'extension-loader', label: '.so/.pyd', color: BLUE },

    // SourceFileLoader feeds the compile pipeline; .pyc is a write-side cache
    { from: 'source-loader', to: 'py-source', label: 'read', color: BLUE },
    { from: 'py-source', to: 'py-compiler', label: 'parse', color: ORANGE },
    { from: 'py-compiler', to: 'pyc-file', label: 'cache', color: YELLOW },

    // SourcelessFileLoader skips compile and materializes a code object from .pyc
    { from: 'bytecode-loader', to: 'pyc-file', label: 'read', color: BLUE },
    { from: 'pyc-file', to: 'code-object', label: 'load', color: YELLOW },

    // the code object on the heap is what initialization executes; init then
    // publishes the module in sys.modules (C extensions init directly via PyInit_*)
    { from: 'code-object', to: 'py-initialization', label: 'exec', color: PURPLE },
    { from: 'extension-loader', to: 'py-initialization', label: 'PyInit_*', color: BLUE },
    { from: 'py-initialization', to: 'sys-modules', label: 'register', color: PURPLE },

    // GIL serializes bytecode across threads
    { from: 'gil', to: 'ceval', label: 'serialize', color: RED },

    // calling a code object pushes a frame; tstate tracks the current frame;
    // ceval interprets the top frame
    { from: 'code-object', to: 'frames-1', label: 'call', color: GRAY },
    { from: 'tstate-1', to: 'frames-1', label: 'current', color: GRAY },
    { from: 'frames-1', to: 'ceval', label: 'top frame', color: GRAY },

    // pymalloc backs the heap: arena -> pool -> block -> PyObject
    { from: 'arenas', to: 'pools', label: 'split', color: GRAY },
    { from: 'pools', to: 'blocks', label: 'split', color: GRAY },
    { from: 'blocks', to: 'pyobject', label: 'alloc', color: GRAY },

    // specializer (PEP 659 + 3.13 JIT) internals
    { from: 'ceval', to: 'bytecode-rewriter', label: 'hot path', color: RED },
    { from: 'bytecode-rewriter', to: 'inline-cache', label: 'specialize', color: BLUE },
    { from: 'inline-cache', to: 'native-code-gen', label: 'JIT', color: BLUE },
    { from: 'py-profile', to: 'inline-cache', label: 'hot info', color: GRAY },

    // cycle collector reclaims unreachable cycles on top of refcount
    { from: 'gc-py', to: 'pyobject', label: 'sweep cycles', color: GREEN },

    // C API + native extension modules
    { from: 'exec-engine-py', to: 'c-api', label: 'PyObject_*', color: TEAL },
    { from: 'c-api', to: 'native-ext', label: 'invoke', color: TEAL },

    // execution -> CPU
    { from: 'native-code-gen', to: 'cpu-py', label: 'native code', color: PURPLE },
    { from: 'ceval', to: 'cpu-py', label: 'interpret', color: GRAY },
    { from: 'native-ext', to: 'cpu-py', label: 'syscall', color: TEAL },
  ],
}
