import type { SceneSpec } from '../engine/types.ts'
import { sparkExecution } from './spark-execution.ts'
import { sparkRddApi } from './spark-rdd-api.ts'
import { sparkApiStack } from './apache-spark-api-stack.ts'
import { sparkArchitecture } from './spark-architecture.ts'
import { sparkBatchApi } from './spark-batch-api.ts'

// Scene registry: the manifest references scenes by id; this maps id → SceneSpec.
// Modules run on one dense scene each (01 = spark-execution, 02 = spark-rdd-api);
// apache-spark-api-stack is kept available for reuse. spark-architecture is the
// wide 16:9 "whole system" map (ported from NodeMap), not yet wired to a module.
export const scenes: Record<string, SceneSpec> = {
  'spark-execution': sparkExecution,
  'spark-rdd-api': sparkRddApi,
  'apache-spark-api-stack': sparkApiStack,
  'spark-architecture': sparkArchitecture,
  'spark-batch-api': sparkBatchApi,
}
