import type { SceneSpec } from '../engine/types.ts'
import { sparkExecution } from './spark-execution.ts'
import { sparkRddApi } from './spark-rdd-api.ts'
import { sparkApiStack } from './apache-spark-api-stack.ts'
import { sparkArchitecture } from './spark-architecture.ts'
import { sparkBatchApi } from './spark-batch-api.ts'
import { sparkStreaming } from './spark-streaming.ts'
import { javaJvm } from './java-jvm.ts'
import { javaAnatomy } from './java-anatomy.ts'
import { scalaJvm } from './scala-jvm.ts'
import { scalaAnatomy } from './scala-anatomy.ts'
import { pythonCpython } from './python-cpython.ts'
import { pythonAnatomy } from './python-anatomy.ts'
import { dsa } from './dsa.ts'

// Scene registry: the manifest references scenes by id; this maps id → SceneSpec.
// Modules run on one dense scene each (01 = spark-execution, 02 = spark-rdd-api);
// apache-spark-api-stack is kept available for reuse. spark-architecture is the
// wide 16:9 "whole system" map (ported from NodeMap), not yet wired to a module.
// java-jvm + java-anatomy are the Java concept's two dense maps (ported from
// NodeMap), shared across the Java modules via java-content's manifest.
// scala-jvm + scala-anatomy mirror them for the Scala concept (scala-content):
// same JVM runtime map (scalac/.scala), Scala's `Kind Name : Type = Value` grammar.
// python-cpython + python-anatomy mirror them for the Python concept (python-content):
// the CPython runtime map (.py/compile()/import system) and Python's keyword-less
// `Name : Type = Value` grammar (Model ▸ Bind ▸ Transform ▸ Return).
// dsa is the Data Structures & Algorithms concept's single dense map (ported from
// NodeMap's dsa.ts): the classical taxonomy beside per-structure RAM sketches,
// shared across all dsa-content modules via that repo's manifest.
export const scenes: Record<string, SceneSpec> = {
  'spark-execution': sparkExecution,
  'spark-rdd-api': sparkRddApi,
  'apache-spark-api-stack': sparkApiStack,
  'spark-architecture': sparkArchitecture,
  'spark-batch-api': sparkBatchApi,
  'spark-streaming': sparkStreaming,
  'java-jvm': javaJvm,
  'java-anatomy': javaAnatomy,
  'scala-jvm': scalaJvm,
  'scala-anatomy': scalaAnatomy,
  'python-cpython': pythonCpython,
  'python-anatomy': pythonAnatomy,
  dsa: dsa,
}
