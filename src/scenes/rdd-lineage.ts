import type { SceneSpec } from '../engine/types.ts'
import { group, container, pipeline, rows, stack } from '../engine/patterns.ts'
import { GREEN, ORANGE, PURPLE, RED } from '../engine/colors.ts'

const graph = container(
  { id: 'lin-graph', label: 'Lineage graph · the recipe', color: PURPLE, sub: 'transformations from the source' },
  pipeline([
    { id: 'lin-src', label: 'Source RDD', sub: 'parallelize / textFile', color: ORANGE, kind: 'symbol' },
    { id: 'lin-map', label: 'Mapped RDD', color: GREEN, kind: 'symbol' },
    { id: 'lin-filter', label: 'Filtered RDD', color: GREEN, kind: 'symbol' },
    { id: 'lin-result', label: 'Result RDD', sub: 'materialized by an action', color: GREEN, kind: 'symbol' },
  ]),
  { padding: 0.16 },
)

const recovery = group(
  'lin-recovery',
  rows(
    [[
      { id: 'lin-lost', label: 'Partition lost', sub: 'executor crashes — no replica', color: RED, kind: 'symbol' },
      { id: 'lin-rebuild', label: 'Rebuilt', sub: 'replay the recipe slice', color: GREEN, kind: 'symbol' },
    ]],
    { tight: true },
  ),
  { padding: 0.15 },
)

const cache = {
  id: 'lin-cache',
  label: 'cache() truncates the replay',
  sub: 'reuse without recomputing from the source',
  color: ORANGE,
  kind: 'term' as const,
}

const layout = stack(
  [
    { node: graph, rows: 6 },
    { node: recovery, rows: 2 },
    { node: cache, rows: 1 },
  ],
  { gap: 0.3, padding: 0.5 },
)

export const sparkRddLineage: SceneSpec = {
  id: 'rdd-lineage',
  topic: 'apache-spark',
  title: 'RDD lineage — fault recovery',
  ...layout,
  edges: [
    { from: 'lin-src', to: 'lin-map', label: 'map' },
    { from: 'lin-map', to: 'lin-filter', label: 'filter' },
    { from: 'lin-filter', to: 'lin-result', label: 'reduceByKey' },
    { from: 'lin-result', to: 'lin-lost' },
    { from: 'lin-lost', to: 'lin-rebuild', label: 'replay lineage' },
  ],
}
