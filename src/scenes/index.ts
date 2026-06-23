import type { SceneSpec } from '../engine/types.ts'
import { sparkCluster } from './spark-cluster.ts'
import { sparkExecution } from './spark-execution.ts'

// Scene registry: the manifest references scenes by id; this maps id → SceneSpec.
// `aqe` and `spark-connect` are not built yet — sections that want them fall back
// to the module's defaultScene.
export const scenes: Record<string, SceneSpec> = {
  'spark-cluster': sparkCluster,
  'spark-execution': sparkExecution,
}
