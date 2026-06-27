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

// Scala-on-the-JVM runtime on one wide map — ported from NodeMap's `scala.ts`
// (`~/Projects/NodeMap/src/data/scenes/scala.ts`) and structurally identical to
// `java-jvm.ts`: the JVM is the same machine. Only the source pipeline differs —
// Scala source (.scala) compiled by `scalac` to the same `.class` bytecode that
// the rest of the runtime loads and runs. Top band: source pipeline feeding the
// Class Loader Sub-System (loading ▸ linking ▸ initialization). Middle band: the
// JVM memory areas. Bottom band: the Execution Engine (interpreter + JIT + GC),
// JNI, native libs. A CPU layer is the hardware boundary. Geometry is faithful to
// the source's WEIGHTED grid tracks, which graphl-ux's resolver supports natively.

// A COMPONENT leaf — icon glyph + label (graphl-ux `symbol`, NodeMap's default box).
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

// A bare LABEL leaf — text only, no glyph/fill (graphl-ux `label`). Used for the
// tiny per-thread stack-frame abbreviations where a glyph would just be noise.
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'label' })

// Native weighted-track authoring: the grid carries the relative track WEIGHTS and
// each child's `at` becomes its `cell`, indexing those tracks 1:1.
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// =============== TOP: source pipeline + class loader sub-system ===============

const pipeline = group(
  'sc-pipeline',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.35, padding: 0 }, [
    { node: comp('sc-source-code', 'Scala src (.scala)', GRAY), at: [0, 0] },
    { node: comp('scalac', 'scalac', GRAY), at: [0, 1] },
    { node: comp('sc-class-file', '.class file', YELLOW), at: [0, 2] },
  ]),
)

const loading = container(
  { id: 'sc-loading', label: 'Loading', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.3 }, [
    { node: comp('sc-bootstrap-cl', 'Boot Strap CL', BLUE), at: [0, 0] },
    { node: comp('sc-extension-cl', 'Extension CL', BLUE), at: [0, 1] },
    { node: comp('sc-application-cl', 'Application CL', BLUE), at: [0, 2] },
  ]),
)

const linking = container(
  { id: 'sc-linking', label: 'Linking', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.2, padding: 0.3 }, [
    { node: comp('sc-verify', 'Verify', BLUE), at: [0, 0] },
    { node: comp('sc-prepare', 'Prepare', BLUE), at: [0, 1] },
    { node: comp('sc-resolve', 'Resolve', BLUE), at: [0, 2] },
  ]),
)

const classLoaderSubSystem = container(
  { id: 'sc-classloader-subsystem', label: 'Class Loader Sub-System', color: TEAL },
  wgrid({ cols: [1.4, 1.4, 1.6], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: loading, at: [0, 0] },
    { node: linking, at: [1, 0] },
    { node: comp('sc-initialization', 'Initialization', GRAY), at: [2, 0] },
  ]),
)

const top = group(
  'sc-top',
  wgrid({ cols: [3.5, 14], rows: [1], gap: 0.5, padding: 0 }, [
    { node: pipeline, at: [0, 0] },
    { node: classLoaderSubSystem, at: [1, 0] },
  ]),
)

// =============== MIDDLE: Memory Area of JVM ===============

const methodArea = container(
  { id: 'sc-method-area', label: 'Method Area', color: PURPLE },
  wgrid({ cols: [1], rows: [1], gap: 0.2, padding: 0.4 }, [
    { node: comp('sc-class-data', 'Class Data', BLUE), at: [0, 0] },
  ]),
)

const heapArea = container(
  { id: 'sc-heap-area', label: 'Heap Area', color: PURPLE },
  wgrid({ cols: [1], rows: [1], gap: 0.2, padding: 0.4 }, [
    { node: comp('sc-object-data', 'Object Data', BLUE), at: [0, 0] },
  ]),
)

const threadStack = (id: string, label: string, suffix: string) =>
  container(
    { id, label, color: BLUE },
    wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.3 }, [
      { node: lbl(`sc-lva-${suffix}`, 'LVA', GRAY), at: [0, 0] },
      { node: lbl(`sc-oa-${suffix}`, 'OA', GRAY), at: [0, 1] },
      { node: lbl(`sc-fd-${suffix}`, 'FD', GRAY), at: [0, 2] },
    ]),
  )

const jvmStackArea = container(
  { id: 'sc-jvm-stack-area', label: 'JVM Stack Area', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: threadStack('sc-thread-1-stack', 'Thread 1 (Stack)', '1'), at: [0, 0] },
    { node: threadStack('sc-thread-n-stack', 'Thread n (Stack)', 'n'), at: [1, 0] },
  ]),
)

const pcRegisters = container(
  { id: 'sc-pc-registers', label: 'PC Registers', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('sc-pc-reg-1', 'PC Reg T1', BLUE), at: [0, 0] },
    { node: comp('sc-pc-reg-n', 'PC Reg Tn', BLUE), at: [0, 1] },
  ]),
)

const nativeMethodStacks = container(
  { id: 'sc-native-method-stacks', label: 'Native Method Stacks', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('sc-native-invoke-1', 'Native T1', BLUE), at: [0, 0] },
    { node: comp('sc-native-invoke-n', 'Native Tn', BLUE), at: [0, 1] },
  ]),
)

const memoryArea = container(
  { id: 'sc-memory-area', label: 'Memory Area Of JVM', color: TEAL },
  wgrid({ cols: [1.6, 1.6, 3.4, 1.6, 1.8], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: methodArea, at: [0, 0] },
    { node: heapArea, at: [1, 0] },
    { node: jvmStackArea, at: [2, 0] },
    { node: pcRegisters, at: [3, 0] },
    { node: nativeMethodStacks, at: [4, 0] },
  ]),
)

// =============== BOTTOM: Execution Engine + JNI + Native libs ===============

const jitCompiler = container(
  { id: 'sc-jit-compiler', label: 'JIT Compiler', color: ORANGE },
  wgrid({ cols: [1.6, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.35 }, [
    { node: comp('sc-intermediate-code-gen', 'Intermediate Code Gen', BLUE), at: [0, 0] },
    { node: comp('sc-code-optimizer', 'Code Optimizer', BLUE), at: [0, 1] },
    { node: comp('sc-target-code-gen', 'Target Code Gen', BLUE), at: [0, 2] },
    { node: comp('sc-profiler', 'Profiler', GRAY), at: [1, 0, 1, 3] },
  ]),
)

const executionEngine = container(
  { id: 'sc-exec-engine', label: 'Execution Engine', color: TEAL },
  wgrid({ cols: [1, 2.5, 1], rows: [1], gap: 0.3, padding: 0.35 }, [
    { node: comp('sc-interpreter', 'Interpreter', GRAY), at: [0, 0] },
    { node: jitCompiler, at: [1, 0] },
    { node: comp('sc-gc', 'Garbage Collector', GREEN), at: [2, 0] },
  ]),
)

const bottom = group(
  'sc-bottom',
  wgrid({ cols: [8.5, 2.5, 2.5], rows: [1], gap: 0.45, padding: 0 }, [
    { node: executionEngine, at: [0, 0] },
    { node: comp('sc-jni', 'JNI', BLUE), at: [1, 0] },
    { node: comp('sc-native-method-libs', 'Native Libs', BLUE), at: [2, 0] },
  ]),
)

// =============== CPU LAYER (hardware boundary) ===============

const cpuLayer = group(
  'sc-cpu-layer',
  wgrid({ cols: [1], rows: [1], gap: 0, padding: 0 }, [
    { node: comp('sc-cpu', 'CPU (Processor)', PURPLE), at: [0, 0] },
  ]),
)

// =============== ROOT ===============

const root = group(
  'scala-jvm-root',
  wgrid({ cols: [1], rows: [4.5, 5, 5, 1.5], gap: 0.5, padding: 0.02 }, [
    { node: top, at: [0, 0] },
    { node: memoryArea, at: [0, 1] },
    { node: bottom, at: [0, 2] },
    { node: cpuLayer, at: [0, 3] },
  ]),
)

export const scalaJvm: SceneSpec = {
  id: 'scala-jvm',
  topic: 'scala',
  title: 'Scala on the JVM',
  subtitle: 'Source → class loader → memory → execution engine → CPU',
  // Taller-than-16:9 canvas (~6:5): fills the panel-open reading view's vertical
  // space; accepts a little left/right pillarbox in the panel-closed 16:9 frame.
  canvas: { width: 1440, height: 1180 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // pipeline
    { from: 'sc-source-code', to: 'scalac', label: 'compile', color: ORANGE },
    { from: 'scalac', to: 'sc-class-file', label: 'emit', color: YELLOW },
    { from: 'sc-class-file', to: 'sc-bootstrap-cl', label: 'load', color: TEAL },

    // class loader: loading -> linking -> initialization
    { from: 'sc-bootstrap-cl', to: 'sc-extension-cl', label: 'delegate', color: BLUE },
    { from: 'sc-extension-cl', to: 'sc-application-cl', label: 'delegate', color: BLUE },
    { from: 'sc-application-cl', to: 'sc-verify', label: 'link', color: BLUE },
    { from: 'sc-verify', to: 'sc-prepare', label: 'next', color: BLUE },
    { from: 'sc-prepare', to: 'sc-resolve', label: 'next', color: BLUE },
    { from: 'sc-resolve', to: 'sc-initialization', label: 'init', color: BLUE },

    // class loader -> memory area
    { from: 'sc-initialization', to: 'sc-class-data', label: 'register', color: PURPLE },
    { from: 'sc-class-data', to: 'sc-object-data', label: 'new()', color: BLUE },

    // memory <-> execution engine
    { from: 'sc-class-data', to: 'sc-interpreter', label: 'bytecode', color: GRAY },
    { from: 'sc-thread-1-stack', to: 'sc-object-data', label: 'ref', color: BLUE },
    { from: 'sc-pc-reg-1', to: 'sc-thread-1-stack', label: 'next instr', color: GRAY },

    // JIT internals
    { from: 'sc-interpreter', to: 'sc-intermediate-code-gen', label: 'hot path', color: RED },
    { from: 'sc-intermediate-code-gen', to: 'sc-code-optimizer', label: 'IR', color: BLUE },
    { from: 'sc-code-optimizer', to: 'sc-target-code-gen', label: 'optimize', color: BLUE },
    { from: 'sc-profiler', to: 'sc-code-optimizer', label: 'hot info', color: GRAY },

    // GC reclaims heap
    { from: 'sc-gc', to: 'sc-object-data', label: 'sweep', color: GREEN },

    // JNI + native libs
    { from: 'sc-exec-engine', to: 'sc-jni', label: 'native call', color: TEAL },
    { from: 'sc-jni', to: 'sc-native-method-libs', label: 'invoke', color: TEAL },
    { from: 'sc-native-invoke-1', to: 'sc-jni', label: 'native frame', color: TEAL },

    // execution -> CPU
    { from: 'sc-target-code-gen', to: 'sc-cpu', label: 'native code', color: PURPLE },
    { from: 'sc-interpreter', to: 'sc-cpu', label: 'interpret', color: GRAY },
    { from: 'sc-native-method-libs', to: 'sc-cpu', label: 'syscall', color: TEAL },
  ],
}
