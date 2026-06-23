import type { SceneSpec } from '../engine/types.ts'
import { sparkCluster } from './spark-cluster.ts'
import { sparkExecution } from './spark-execution.ts'
import { sparkRddApi } from './spark-rdd-api.ts'
import { sparkCachePersist } from './spark-cache-persist.ts'
import { sparkApiStack } from './apache-spark-api-stack.ts'
import { sparkRddPartitions } from './rdd-partitions.ts'
import { sparkRddLineage } from './rdd-lineage.ts'
import { sparkRddNarrowWide } from './rdd-narrow-wide.ts'

// Scene registry: the manifest references scenes by id; this maps id → SceneSpec.
// Only aqe and spark-connect remain unbuilt (module 01 sections fall back to defaultScene).
export const scenes: Record<string, SceneSpec> = {
  'spark-cluster': sparkCluster,
  'spark-execution': sparkExecution,
  'spark-rdd-api': sparkRddApi,
  'spark-cache-persist': sparkCachePersist,
  'apache-spark-api-stack': sparkApiStack,
  'rdd-partitions': sparkRddPartitions,
  'rdd-lineage': sparkRddLineage,
  'rdd-narrow-wide': sparkRddNarrowWide,
}
