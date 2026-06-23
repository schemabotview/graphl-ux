import type { SceneSpec } from '../engine/types.ts'
import { columns, container, group, rows, stack } from '../engine/patterns.ts'
import { GRAY, GREEN, PURPLE, TEAL } from '../engine/colors.ts'

const rdd = container(
  { id: 'part-rdd', label: 'RDD', color: PURPLE, sub: 'one collection, split into partitions' },
  rows(
    [[
      { id: 'part-p0', label: 'Partition 0', color: GREEN, kind: 'term' },
      { id: 'part-p1', label: 'Partition 1', color: GREEN, kind: 'term' },
      { id: 'part-p2', label: 'Partition 2', color: GREEN, kind: 'term' },
      { id: 'part-p3', label: 'Partition 3', color: GREEN, kind: 'term' },
    ]],
    { tight: true },
  ),
  { padding: 0.18 },
)

const scheduler = {
  id: 'part-sched',
  label: '1 partition → 1 task → 1 core',
  sub: 'partition count = degree of parallelism',
  color: TEAL,
  kind: 'term' as const,
}

const executor = (id: string, c1: string, c2: string) =>
  container(
    { id, label: 'Executor', color: GREEN, sub: 'cores run tasks in parallel' },
    columns([[
      { id: c1, label: 'Core', sub: 'one task', color: GRAY, kind: 'term' },
      { id: c2, label: 'Core', sub: 'one task', color: GRAY, kind: 'term' },
    ]]),
    { padding: 0.2 },
  )

const executors = group(
  'part-executors',
  columns(
    [
      [executor('part-ex1', 'part-ex1c1', 'part-ex1c2')],
      [executor('part-ex2', 'part-ex2c1', 'part-ex2c2')],
    ],
    { tight: true },
  ),
  { padding: 0.1 },
)

const layout = stack(
  [
    { node: rdd, rows: 2 },
    { node: scheduler, rows: 1 },
    { node: executors, rows: 4 },
  ],
  { gap: 0.3, padding: 0.5 },
)

export const sparkRddPartitions: SceneSpec = {
  id: 'rdd-partitions',
  topic: 'apache-spark',
  title: 'RDD partitions — unit of parallelism',
  ...layout,
  edges: [
    { from: 'part-rdd', to: 'part-sched' },
    { from: 'part-sched', to: 'part-ex1' },
    { from: 'part-sched', to: 'part-ex2' },
  ],
}
