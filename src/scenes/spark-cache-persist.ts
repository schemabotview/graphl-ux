import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { columns, group, section, stack } from '../engine/patterns.ts'
import { BLUE, GREEN, ORANGE, PURPLE, TEAL } from '../engine/colors.ts'

const api = section(
  { id: 'cp-api', label: 'Cache vs Persist', color: PURPLE, sub: 'keep a DataFrame around' },
  [
    [{ id: 'cp-cache', label: 'cache' }],
    [{ id: 'cp-persist', label: 'persist' }],
    [{ id: 'cp-unpersist', label: 'unpersist' }],
  ],
  { padding: 0.18 },
)

const levels = section(
  { id: 'cp-levels', label: 'Storage levels', color: BLUE, sub: 'memory · disk · serialize' },
  [
    [{ id: 'cp-memonly', label: 'MEMORY_ONLY' }],
    [{ id: 'cp-memonlyser', label: 'MEMORY_ONLY_SER' }],
    [{ id: 'cp-memdisk', label: 'MEMORY_AND_DISK' }],
    [{ id: 'cp-memdisk2', label: 'MEMORY_AND_DISK_2' }],
  ],
  { padding: 0.18 },
)

const memory: SceneNodeSpec = {
  id: 'mem-executor',
  label: 'Executor JVM Memory',
  sub: 'where cached blocks live',
  color: TEAL,
  kind: 'container',
  cell: [0, 0],
  layout: { cols: 1, rows: 10, gap: 0.15, padding: 0.22 },
  children: [
    {
      id: 'mem-unified',
      label: 'Spark Memory · Unified · 60%',
      sub: 'execution + storage share this, and borrow from each other',
      color: BLUE,
      kind: 'container',
      cell: [0, 0, 1, 6],
      layout: { cols: 2, rows: 1, gap: 0.15, padding: 0.18 },
      children: [
        {
          id: 'mem-exec',
          label: 'Execution · 50%',
          sub: 'shuffles · joins · sorts',
          color: ORANGE,
          kind: 'term',
          cell: [0, 0],
        },
        {
          id: 'mem-storage',
          label: 'Storage · 50%',
          sub: 'cached blocks · broadcast',
          color: GREEN,
          kind: 'term',
          cell: [1, 0],
        },
      ],
    },
    {
      id: 'mem-user',
      label: 'User Memory · 40%',
      sub: 'your objects · UDFs · metadata',
      color: PURPLE,
      kind: 'term',
      cell: [0, 6, 1, 4],
    },
  ],
}

const config = group('cp-config', columns([[api], [levels]], { tight: true }), { padding: 0 })

const layout = stack(
  [
    { node: config, rows: 4 },
    { node: memory, rows: 8 },
  ],
  { gap: 0.3, padding: 0.5 },
)

export const sparkCachePersist: SceneSpec = {
  id: 'spark-cache-persist',
  topic: 'apache-spark',
  title: 'Cache & persist — StorageLevel',
  ...layout,
  edges: [
    { from: 'cp-api', to: 'cp-levels' },
    { from: 'cp-levels', to: 'mem-storage' },
  ],
}
