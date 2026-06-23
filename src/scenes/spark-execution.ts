import type { SceneSpec } from '../engine/types.ts'
import { columns, container, group, rows, stack } from '../engine/patterns.ts'
import { BLUE, GREEN, ORANGE, PURPLE, RED, TEAL } from '../engine/colors.ts'

// The full path one Spark query takes, top-down: Driver → Catalyst (its four
// plans side-by-side) → Tungsten → DAG (⊃ Stages ⊃ Tasks) → Task Scheduler →
// Cluster Manager → Executors. Geometry IS the lesson — stacked = sequential,
// side-by-side = parallel. Built with real nesting (patterns.ts + the recursive
// resolver), ported from graphl-mobile's spark-execution.ts.

// Catalyst's four optimizer plans, side-by-side inside its box.
const catalyst = container(
  { id: 'catalyst', label: 'Catalyst Optimizer', color: PURPLE },
  rows(
    [
      [
        { id: 'ulp', label: 'Unresolved', color: BLUE, kind: 'term' },
        { id: 'logical', label: 'Logical', color: BLUE, kind: 'term' },
        { id: 'optimized', label: 'Optimized', color: BLUE, kind: 'term' },
        { id: 'physical', label: 'Physical', color: BLUE, kind: 'term' },
      ],
    ],
    { tight: true },
  ),
  { padding: 0.2 },
)

// A stage = two parallel tasks stacked vertically inside its own box.
const stage = (id: string, label: string) =>
  container(
    { id, label, color: TEAL },
    columns([
      [
        { id: `${id}t1`, label: 'Task', color: RED, kind: 'term' },
        { id: `${id}t2`, label: 'Task', color: RED, kind: 'term' },
      ],
    ]),
    { padding: 0.25 },
  )

// DAG ⊃ Stages ⊃ Tasks: the three stages side-by-side, left→right in execution
// order (a stage runs only after the previous one's shuffle completes).
const dag = container(
  { id: 'dag', label: 'DAG Scheduler', color: ORANGE, sub: 'the job, split into stages' },
  rows([[stage('stage1', 'Stage 1'), stage('stage2', 'Stage 2'), stage('stage3', 'Stage 3')]]),
  { padding: 0.12 },
)

// Cluster Manager ⊃ its deployment backends, side-by-side inside its box.
const clusterManager = container(
  { id: 'cluster', label: 'Cluster Manager', color: PURPLE, sub: 'allocates executors' },
  rows(
    [
      [
        { id: 'cm-local', label: 'Local', color: TEAL, kind: 'term' },
        { id: 'cm-standalone', label: 'Standalone', color: TEAL, kind: 'term' },
        { id: 'cm-yarn', label: 'YARN', color: TEAL, kind: 'term' },
        { id: 'cm-k8s', label: 'Kubernetes', color: TEAL, kind: 'term' },
        { id: 'cm-databricks', label: 'Databricks', color: TEAL, kind: 'term' },
      ],
    ],
    { tight: true },
  ),
  { padding: 0.2 },
)

// Two executors run the dispatched tasks in parallel.
const executors = group(
  'executors',
  columns([
    [{ id: 'ex1', label: 'Executor', color: GREEN, kind: 'symbol', sub: 'runs tasks in parallel' }],
    [{ id: 'ex2', label: 'Executor', color: GREEN, kind: 'symbol', sub: 'runs tasks in parallel' }],
  ]),
  { padding: 0.15 },
)

const layout = stack(
  [
    { node: { id: 'driver', label: 'Driver', color: ORANGE, kind: 'symbol', sub: 'runs your code' } },
    { node: catalyst, rows: 2 },
    { node: { id: 'tungsten', label: 'Tungsten', color: PURPLE, kind: 'symbol', sub: 'code gen + memory' } },
    { node: dag, rows: 3 },
    { node: { id: 'tasksched', label: 'Task Scheduler', color: ORANGE, kind: 'term', sub: 'dispatches tasks' } },
    { node: clusterManager, rows: 2 },
    { node: executors, rows: 2 },
  ],
  { gap: 0.3, padding: 0.5 },
)

export const sparkExecution: SceneSpec = {
  id: 'spark-execution',
  topic: 'apache-spark',
  title: 'Spark Execution Model',
  subtitle: 'Driver → Catalyst → Tungsten → DAG → executors',
  ...layout,
  edges: [
    { from: 'driver', to: 'catalyst' },
    { from: 'catalyst', to: 'tungsten' },
    { from: 'tungsten', to: 'dag' },
    { from: 'stage1', to: 'stage2' },
    { from: 'stage2', to: 'stage3' },
    { from: 'dag', to: 'tasksched' },
    { from: 'tasksched', to: 'cluster' },
    { from: 'cluster', to: 'ex1' },
    { from: 'cluster', to: 'ex2' },
  ],
}
