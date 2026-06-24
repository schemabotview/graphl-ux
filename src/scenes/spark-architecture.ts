import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, weighted, type NodeSeed, type WeightedSeed } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL } from '../engine/colors.ts'

// The WHOLE Spark system on one 16:9 map — ported from NodeMap's `spark.ts`
// (`~/Projects/NodeMap/src/data/scenes/spark.ts`). This is the "big picture"
// mental model: Master Node (driver → Catalyst → Tungsten → DAG → schedulers),
// Cluster Mgr, two Worker Nodes (A batch / B streaming), Output Modes, and the
// data plane (sources → lakehouse). Geometry is faithful to the source: it used
// WEIGHTED grid tracks, lowered here to graphl-ux's uniform grid via `weighted()`.
//
// Palette reconciliation (graphl-ux has no YELLOW; amber is spotlight-only):
//   - storage/IO yellows (S3, Local Disk, Gold, User Code) → ORANGE
//   - Catalyst plan chips → BLUE (matches spark-execution's convention)

const G = 0.2
const P = 0.3

/** A filled leaf chip — the text IS the concept (graphl-ux `term`). */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

// --- Master Node: the driver-side control plane ------------------------------

const catalyst = container(
  { id: 'catalyst', label: 'Catalyst Optimizer', color: PURPLE },
  weighted({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.25 }, [
    { node: chip('logical-plan', 'Logical Plan', BLUE), at: [0, 0] },
    { node: chip('analyzed-plan', 'Analyzed Plan', BLUE), at: [1, 0] },
    { node: chip('optimized-plan', 'Optimized Plan', BLUE), at: [2, 0] },
    { node: chip('physical-plan', 'Physical Plan', BLUE), at: [3, 0] },
  ]),
)

const stage1 = container(
  { id: 'stage-1', label: 'Stage 1', color: ORANGE },
  weighted({ cols: [1], rows: [1, 1, 1], gap: 0.1, padding: 0.18 }, [
    { node: chip('stage1-p0', 'P0', ORANGE), at: [0, 0] },
    { node: chip('stage1-p1', 'P1', ORANGE), at: [0, 1] },
    { node: chip('stage1-p2', 'P2', ORANGE), at: [0, 2] },
  ]),
)

const stage2 = container(
  { id: 'stage-2', label: 'Stage 2', color: RED },
  weighted({ cols: [1], rows: [1, 1, 1], gap: 0.1, padding: 0.18 }, [
    { node: chip('stage2-g0', 'G0', RED), at: [0, 0] },
    { node: chip('stage2-g1', 'G1', RED), at: [0, 1] },
    { node: chip('stage2-g2', 'G2', RED), at: [0, 2] },
  ]),
)

const tasks = container(
  { id: 'tasks', label: 'Tasks', color: TEAL },
  weighted({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.2 }, [
    { node: chip('task-p0', 'Task p0', TEAL), at: [0, 0] },
    { node: chip('task-p1', 'Task p1', TEAL), at: [0, 1] },
    { node: chip('task-p2', 'Task p2', TEAL), at: [0, 2] },
    { node: chip('task-p3', 'Task p3', TEAL), at: [0, 3] },
  ]),
)

const dagScheduler = container(
  { id: 'dag-scheduler', label: 'DAG Scheduler', color: TEAL },
  weighted({ cols: [0.7, 1.2, 0.4, 1.2, 1.2], rows: [1], gap: 0.15, padding: 0.25 }, [
    { node: chip('job', 'Job', ORANGE), at: [0, 0] },
    { node: stage1, at: [1, 0] },
    { node: chip('shuffle', 'Shuffle', RED), at: [2, 0] },
    { node: stage2, at: [3, 0] },
    { node: tasks, at: [4, 0] },
  ]),
)

const streamingCoord = container(
  { id: 'streaming-coord', label: 'Streaming Coordinator', color: TEAL },
  weighted({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.25 }, [
    { node: chip('trigger', 'Trigger', TEAL), at: [0, 0] },
    { node: chip('offset-log', 'Offset Log', TEAL), at: [1, 0] },
    { node: chip('global-watermark', 'Global Watermark', TEAL), at: [2, 0] },
    { node: chip('commit-log', 'Commit Log', TEAL), at: [3, 0] },
  ]),
)

const master = container(
  // NOTE on padding: graphl-ux's resolver pads by a fraction of a CELL, so on a
  // 1-column stack a NodeMap-style 0.3 becomes a huge side gutter. Keep it small
  // here so the children use the column's full width.
  { id: 'master', label: 'Master Node', color: ORANGE },
  weighted({ cols: [1], rows: [1, 1, 2.5, 1, 2.5, 1.2, 1.5], gap: 0.25, padding: 0.08 }, [
    { node: chip('driver', 'Driver Program', ORANGE), at: [0, 0] },
    { node: chip('session', 'SparkSession', BLUE), at: [0, 1] },
    { node: catalyst, at: [0, 2] },
    { node: chip('tungsten', 'Tungsten Engine', PURPLE), at: [0, 3] },
    { node: dagScheduler, at: [0, 4] },
    { node: chip('task-scheduler', 'TaskScheduler', BLUE), at: [0, 5] },
    { node: streamingCoord, at: [0, 6] },
  ]),
)

// --- Cluster Manager: the deployment backends --------------------------------

const clusterMgr = container(
  { id: 'cluster-mgr', label: 'Cluster Mgr', color: BLUE },
  // Small padding (1-column stack — see Master note) so the mode chips are wide
  // enough for their labels ("standalone", "Databricks") instead of clipping.
  weighted({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: 0.08 }, [
    { node: chip('mode-local', 'local', GRAY), at: [0, 0] },
    { node: chip('mode-standalone', 'standalone', BLUE), at: [0, 1] },
    { node: chip('mode-yarn', 'YARN', ORANGE), at: [0, 2] },
    { node: chip('mode-k8s', 'k8s', PURPLE), at: [0, 3] },
    { node: chip('mode-databricks', 'Databricks', RED), at: [0, 4] },
  ]),
)

// --- Worker Node: one factory for both A (batch) and B (streaming) -----------

const worker = (s: 'a' | 'b', label: 'A' | 'B', mode: 'batch' | 'streaming'): SceneNodeSpec => {
  const streaming = mode === 'streaming'

  const heap = container(
    { id: `heap-${s}`, label: 'Heap (Block Mgr)', color: BLUE },
    weighted({ cols: [2.8, 1.4], rows: [1], gap: G, padding: P }, [
      {
        node: container(
          { id: `unified-${s}`, label: 'Unified Memory', color: BLUE },
          weighted({ cols: [1, 1], rows: [1], gap: G, padding: P }, [
            { node: chip(`execution-${s}`, 'Execution', PURPLE), at: [0, 0] },
            { node: chip(`storage-${s}`, 'Storage', GREEN), at: [1, 0] },
          ]),
        ),
        at: [0, 0],
      },
      { node: chip(`user-code-${s}`, 'User Code', ORANGE), at: [1, 0] },
    ]),
  )

  const children: WeightedSeed[] = [
    { node: chip(`exec-${s}`, 'Executor', PURPLE), at: [0, 0, 2, 2] },
    { node: chip(`core1-${s}`, 'Core 1', RED), at: [0, 2, 1, 2] },
    { node: chip(`core2-${s}`, 'Core 2', RED), at: [1, 2, 1, 2] },
    { node: heap, at: [2, 0, 1, 3] },
    { node: chip(`local-disk-${s}`, 'Local Disk', ORANGE), at: [2, 3] },
  ]

  if (streaming) {
    children.push({
      node: container(
        { id: `stateful-ops-${s}`, label: 'Stateful Ops', color: TEAL },
        weighted({ cols: [1, 1, 1, 1], rows: [1], gap: G, padding: P }, [
          { node: chip(`local-watermark-${s}`, 'Local Watermark', TEAL), at: [0, 0] },
          { node: chip(`window-state-${s}`, 'Window State', TEAL), at: [1, 0] },
          { node: chip(`rocksdb-${s}`, 'RocksDB', TEAL), at: [2, 0] },
          { node: chip(`state-snapshot-${s}`, 'State Snapshot', TEAL), at: [3, 0] },
        ]),
      ),
      at: [0, 4, 3, 1],
    })
  }

  return container(
    { id: `worker-${s}`, label: `Worker Node ${label} (${streaming ? 'Streaming' : 'Batch'})`, color: GREEN },
    weighted(
      { cols: [1.2, 1.2, 4.8], rows: streaming ? [1, 1, 1, 1, 1.5] : [1, 1, 1, 1], gap: G, padding: P },
      children,
    ),
  )
}

// --- Output Modes & the data plane (sources → lakehouse) ---------------------

const outputModes = container(
  { id: 'output-modes', label: 'Output Modes', color: GREEN },
  weighted({ cols: [1, 1, 1], rows: [1], gap: 0.3, padding: 0.25 }, [
    { node: chip('mode-append', 'append', GREEN), at: [0, 0] },
    { node: chip('mode-update', 'update', GREEN), at: [1, 0] },
    { node: chip('mode-complete', 'complete', GREEN), at: [2, 0] },
  ]),
)

const dataSources = container(
  { id: 'data-sources', label: 'Data Sources', color: TEAL },
  weighted({ cols: [1, 1, 1], rows: [1, 1], gap: 0.25, padding: 0.3 }, [
    { node: chip('hdfs', 'HDFS', ORANGE), at: [0, 0] },
    { node: chip('s3', 'S3', ORANGE), at: [1, 0] },
    { node: chip('jdbc', 'JDBC', BLUE), at: [2, 0] },
    { node: chip('kafka-src', 'Kafka', TEAL), at: [0, 1] },
    { node: chip('delta-src', 'Delta', TEAL), at: [1, 1] },
    { node: chip('file-src', 'Files', TEAL), at: [2, 1] },
  ]),
)

const storageLayer = container(
  { id: 'storage-layer', label: 'Storage Layer', color: GRAY },
  weighted({ cols: [1, 1, 1], rows: [1], gap: 0.25, padding: 0.25 }, [
    { node: chip('storage-hdfs', 'HDFS', ORANGE), at: [0, 0] },
    { node: chip('storage-adls', 'ADLS', BLUE), at: [1, 0] },
    { node: chip('storage-s3', 'S3', ORANGE), at: [2, 0] },
  ]),
)

const lakehouse = container(
  { id: 'lakehouse', label: 'Lakehouse (Delta Lake)', color: BLUE },
  weighted({ cols: [1, 1, 1], rows: [0.8, 2, 0.7, 1.2], gap: 0.25, padding: 0.3 }, [
    { node: chip('unity-catalog', 'Unity Catalog', PURPLE), at: [0, 0, 3, 1] },
    { node: chip('bronze', 'Bronze', ORANGE), at: [0, 1] },
    { node: chip('silver', 'Silver', GRAY), at: [1, 1] },
    { node: chip('gold', 'Gold', ORANGE), at: [2, 1] },
    { node: chip('delta-log', 'Delta Log', BLUE), at: [0, 2, 3, 1] },
    { node: storageLayer, at: [0, 3, 3, 1] },
  ]),
)

// Invisible wrapper (NodeMap `showChrome: false`) — just sub-arranges its three
// regions left→right with a wide center weight on the lakehouse.
const dataPlane = group(
  'data-plane',
  weighted({ cols: [3, 1.5, 7], rows: [1], gap: 0.4, padding: 0 }, [
    { node: dataSources, at: [0, 0] },
    { node: chip('shared-checkpoint', 'Shared Checkpoint', GRAY), at: [1, 0] },
    { node: lakehouse, at: [2, 0] },
  ]),
)

// --- The outer frame: all six regions on the 16:9 architecture grid ----------

const architecture = container(
  { id: 'spark', label: 'Spark Architecture', color: ORANGE },
  weighted({ cols: [7, 2, 9, 9], rows: [8, 2, 5], gap: 0.4, padding: 0.4 }, [
    { node: master, at: [0, 0, 1, 3] },
    { node: clusterMgr, at: [1, 0] },
    { node: worker('a', 'A', 'batch'), at: [2, 0] },
    { node: worker('b', 'B', 'streaming'), at: [3, 0] },
    { node: outputModes, at: [3, 1] },
    { node: dataPlane, at: [2, 2, 2, 1] },
  ]),
)

export const sparkArchitecture: SceneSpec = {
  id: 'spark-architecture',
  topic: 'apache-spark',
  title: 'Spark Architecture',
  subtitle: 'The whole system — driver, cluster, workers, lakehouse',
  // 16:9 canvas so the wide architecture grid (~27×15) renders with square cells.
  canvas: { width: 1424, height: 800 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [architecture],
  edges: [
    // Driver-side plan → schedule (shared by batch & streaming)
    { from: 'driver', to: 'session', label: 'init', color: ORANGE },
    { from: 'session', to: 'logical-plan', label: 'DataFrame', color: BLUE },
    { from: 'session', to: 'job', label: 'RDD', color: GREEN },
    { from: 'logical-plan', to: 'analyzed-plan', label: 'resolve', color: BLUE },
    { from: 'analyzed-plan', to: 'optimized-plan', label: 'optimize', color: BLUE },
    { from: 'optimized-plan', to: 'physical-plan', label: 'cost', color: BLUE },
    { from: 'physical-plan', to: 'tungsten', label: 'codegen', color: PURPLE },
    { from: 'tungsten', to: 'job', label: 'execute', color: PURPLE },
    { from: 'job', to: 'stage-1', label: 'split', color: ORANGE },
    { from: 'stage-1', to: 'shuffle', label: 'wide', color: RED },
    { from: 'shuffle', to: 'stage-2', label: 'regroup', color: RED },
    { from: 'stage-2', to: 'tasks', label: 'taskset', color: TEAL },
    { from: 'tasks', to: 'task-scheduler', label: 'submit', color: TEAL },
    { from: 'task-scheduler', to: 'cluster-mgr', label: 'request', color: BLUE },
    { from: 'cluster-mgr', to: 'exec-a', label: 'launch', color: GREEN },
    { from: 'cluster-mgr', to: 'exec-b', label: 'launch', color: GREEN },
    { from: 'exec-a', to: 'core1-a', label: 'run', color: RED },
    { from: 'exec-b', to: 'core1-b', label: 'run', color: RED },

    // Worker A — batch ingestion into Bronze
    { from: 'hdfs', to: 'core1-a', label: 'read partition', color: ORANGE },
    { from: 's3', to: 'core2-a', label: 'read partition', color: ORANGE },
    { from: 'exec-a', to: 'bronze', label: 'batch write', color: ORANGE },

    // Worker B — streaming ingestion into Bronze
    { from: 'kafka-src', to: 'exec-b', label: 'micro-batch', color: TEAL },
    { from: 'delta-src', to: 'exec-b', label: 'CDC', color: TEAL },
    { from: 'exec-b', to: 'output-modes', label: 'streaming write', color: TEAL },
    { from: 'output-modes', to: 'bronze', label: 'stream write', color: TEAL },

    // Medallion ETL: Bronze → Silver → Gold
    { from: 'bronze', to: 'silver', label: 'cleanse', color: GRAY },
    { from: 'silver', to: 'gold', label: 'aggregate', color: ORANGE },

    // Driver-side streaming coordination (touches Worker B only)
    { from: 'trigger', to: 'session', label: 'fire batch', color: TEAL },
    { from: 'offset-log', to: 'shared-checkpoint', label: 'plan offsets', color: TEAL },
    { from: 'commit-log', to: 'shared-checkpoint', label: 'mark done', color: TEAL },
    { from: 'local-watermark-b', to: 'global-watermark', label: 'report max', color: TEAL },

    // State path on Worker B: window → rocksdb → snapshot → checkpoint
    { from: 'window-state-b', to: 'rocksdb-b', label: 'store', color: TEAL },
    { from: 'rocksdb-b', to: 'state-snapshot-b', label: 'snapshot', color: TEAL },
    { from: 'state-snapshot-b', to: 'shared-checkpoint', label: 'write state', color: TEAL },
  ],
}
