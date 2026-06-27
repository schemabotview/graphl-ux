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
import { scalaModel } from './scala-model.ts'
import { pythonCpython } from './python-cpython.ts'
import { pythonAnatomy } from './python-anatomy.ts'
import { dsa } from './dsa.ts'
import { sql } from './sql.ts'

// Scene registry: the manifest references scenes by id; this maps id → SceneSpec.
// Modules run on one dense scene each (01 = spark-execution, 02 = spark-rdd-api);
// apache-spark-api-stack is kept available for reuse. spark-architecture is the
// wide 16:9 "whole system" map (ported from NodeMap), not yet wired to a module.
// java-jvm + java-anatomy are the Java concept's two dense maps (ported from
// NodeMap), shared across the Java modules via java-content's manifest.
// scala-jvm + scala-model serve the Scala concept (scala-content): the JVM runtime
// map (scalac/.scala) and scala-model — a merge of the old scala-anatomy structure
// (`Kind Name : Type = Value`, Model ▸ Initialize ▸ Transform ▸ Return) with real
// syntax-highlighted code in the Transform band (the old scala-grammar's snippets).
// python-cpython + python-anatomy mirror them for the Python concept (python-content):
// the CPython runtime map (.py/compile()/import system) and Python's keyword-less
// `Name : Type = Value` grammar (Model ▸ Bind ▸ Transform ▸ Return).
// dsa is the Data Structures & Algorithms concept's single scene: the "top data
// structures" poster laid out GROUPED BY the classical taxonomy category (Primitive ·
// Linear/Static · Linear/Dynamic · Non-Linear/Tree · Non-Linear/Graph · Hashing), each
// cell a boxed sequence or node-link diagram. Shared across all dsa-content modules via
// that repo's manifest (camera frames one category/structure box per section).
// sql is the SQL concept's single wide map (ported from NodeMap): DDL ▸ catalog ▸
// storage ▸ the query pipeline (logical execution order) ▸ transactions ▸ set ops.
// Shared across all sql-content modules via that repo's manifest (camera frames one
// clause / subsystem per section).
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
  'scala-model': scalaModel,
  'python-cpython': pythonCpython,
  'python-anatomy': pythonAnatomy,
  dsa: dsa,
  sql: sql,
}
