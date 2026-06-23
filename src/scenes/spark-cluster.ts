import type { SceneSpec } from '../engine/types.ts'
import { BLUE, GREEN, ORANGE, GRAY } from '../engine/colors.ts'

// 01 · Foundations — the cluster: driver (brain) asks the cluster manager for
// resources, which launches executors (muscle); the driver then ships tasks to
// the executors' slots. Colors follow the semantic roles in DESIGN.md.
export const sparkCluster: SceneSpec = {
  id: 'spark-cluster',
  topic: 'apache-spark',
  title: 'The Spark cluster',
  subtitle: 'driver · cluster manager · executors',
  grid: { cols: 6, rows: 10, gap: 0.25, padding: 0.4 },
  nodes: [
    {
      id: 'driver',
      label: 'Driver',
      sub: 'SparkSession — builds & schedules the plan',
      cell: [1, 0, 4, 2],
      color: BLUE,
    },
    {
      id: 'cluster-manager',
      label: 'Cluster Manager',
      sub: 'YARN · Kubernetes · Standalone',
      cell: [1, 3, 4, 1],
      color: GRAY,
    },
    {
      id: 'executors',
      label: 'Executors',
      kind: 'container',
      color: GREEN,
      cell: [0, 5, 6, 5],
      layout: { cols: 2, rows: 1, gap: 0.3, padding: 0.3 },
      children: [
        {
          id: 'exec-1',
          label: 'Executor',
          kind: 'container',
          color: GREEN,
          cell: [0, 0],
          layout: { cols: 1, rows: 2, gap: 0.3, padding: 0.3 },
          children: [
            { id: 'slots-1', label: 'task slots ×4', kind: 'term', color: GREEN, cell: [0, 0] },
            { id: 'mem-1', label: 'cache / RAM', kind: 'term', color: ORANGE, cell: [0, 1] },
          ],
        },
        {
          id: 'exec-2',
          label: 'Executor',
          kind: 'container',
          color: GREEN,
          cell: [1, 0],
          layout: { cols: 1, rows: 2, gap: 0.3, padding: 0.3 },
          children: [
            { id: 'slots-2', label: 'task slots ×4', kind: 'term', color: GREEN, cell: [0, 0] },
            { id: 'mem-2', label: 'cache / RAM', kind: 'term', color: ORANGE, cell: [0, 1] },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'driver', to: 'cluster-manager', label: 'request resources' },
    { from: 'cluster-manager', to: 'executors', label: 'launch & schedule tasks' },
  ],
}
