import type { SceneSpec } from '../engine/types.ts'
import { columns, group, section, stack } from '../engine/patterns.ts'
import { BLUE, GREEN, ORANGE, PURPLE, RED } from '../engine/colors.ts'

const apis = group(
  'apis',
  columns(
    [
      [{ id: 'rdd', label: 'RDD API', color: RED, kind: 'symbol', sub: 'low-level' }],
      [{ id: 'dataframe', label: 'DataFrame API', color: ORANGE, kind: 'symbol', sub: 'typed columns' }],
      [{ id: 'sql', label: 'SQL API', color: GREEN, kind: 'symbol', sub: 'queries + views' }],
      [{ id: 'pandas', label: 'pandas API', color: BLUE, kind: 'symbol', sub: 'pandas on Spark' }],
    ],
    { tight: true },
  ),
  { padding: 0.15 },
)

const crossCutting = section(
  { id: 'crosscut', label: 'Cross-cutting', color: PURPLE, sub: 'applies across all APIs' },
  [
    [
      { id: 'cc-cache', label: 'Cache / Persist' },
      { id: 'cc-shuffle', label: 'Shuffle' },
    ],
    [
      { id: 'cc-perf', label: 'Perf Tuning' },
      { id: 'cc-broadcast', label: 'Broadcast joins' },
    ],
  ],
  { padding: 0.2 },
)

const layout = stack(
  [
    { node: { id: 'input', label: 'Input Sources', color: BLUE, kind: 'symbol', sub: 'CSV · Parquet · JSON · JDBC · Delta' } },
    { node: { id: 'read', label: 'Read API', color: BLUE, kind: 'symbol', sub: 'spark.read' } },
    { node: apis, rows: 2 },
    { node: { id: 'write', label: 'Write API', color: GREEN, kind: 'symbol', sub: 'df.write' } },
    { node: { id: 'output', label: 'Output', color: GREEN, kind: 'symbol', sub: 'Files · Hive · JDBC · Delta' } },
    { node: crossCutting, rows: 2 },
  ],
  { gap: 0.3, padding: 0.5 },
)

export const sparkApiStack: SceneSpec = {
  id: 'apache-spark-api-stack',
  topic: 'apache-spark',
  title: 'RDD vs DataFrame vs SQL stack',
  ...layout,
  edges: [
    { from: 'input', to: 'read' },
    { from: 'read', to: 'rdd' },
    { from: 'read', to: 'dataframe' },
    { from: 'read', to: 'sql' },
    { from: 'read', to: 'pandas' },
    { from: 'rdd', to: 'write' },
    { from: 'dataframe', to: 'write' },
    { from: 'sql', to: 'write' },
    { from: 'pandas', to: 'write' },
    { from: 'write', to: 'output' },
  ],
}
