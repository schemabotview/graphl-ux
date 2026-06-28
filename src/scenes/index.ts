import type { SceneSpec } from '../engine/types.ts'
import { sparkExecution } from './spark-execution.ts'
import { sparkRddApi } from './spark-rdd-api.ts'
import { sparkApiStack } from './apache-spark-api-stack.ts'
import { sparkArchitecture } from './spark-architecture.ts'
import { sparkBatchApi } from './spark-batch-api.ts'
import { sparkStreaming } from './spark-streaming.ts'
import { javaJvm } from './java-jvm.ts'
import { javaModel } from './java-model.ts'
import { scalaJvm } from './scala-jvm.ts'
import { scalaModel } from './scala-model.ts'
import { pythonCpython } from './python-cpython.ts'
import { pythonModel } from './python-model.ts'
import { dsa } from './dsa.ts'
import { sql } from './sql.ts'
import { linux } from './linux.ts'
import { docker } from './docker.ts'
import { kubernetes } from './kubernetes.ts'

// Scene registry: the manifest references scenes by id; this maps id → SceneSpec.
// Modules run on one dense scene each (01 = spark-execution, 02 = spark-rdd-api);
// apache-spark-api-stack is kept available for reuse. spark-architecture is the
// wide 16:9 "whole system" map (ported from NodeMap), not yet wired to a module.
// java-jvm + java-model are the Java concept's two dense maps, shared across the
// Java modules via java-content's manifest. java-model mirrors scala-model: the old
// java-anatomy token spine with the Transform band rebuilt as real code cards (it
// REPLACED java-anatomy; an `aliases` map keeps the manifest's old chip ids resolving).
// scala-jvm + scala-model serve the Scala concept (scala-content): the JVM runtime
// map (scalac/.scala) and scala-model — a merge of the old scala-anatomy structure
// (`Kind Name : Type = Value`, Model ▸ Initialize ▸ Transform ▸ Return) with real
// syntax-highlighted code in the Transform band (the old scala-grammar's snippets).
// python-cpython + python-model mirror them for the Python concept (python-content):
// the CPython runtime map (.py/compile()/import system) and Python's keyword-less
// `Name : Type = Value` grammar (Model ▸ Bind ▸ Transform ▸ Return). python-model
// REPLACED python-anatomy: same spine, Transform rebuilt as code cards (an `aliases`
// map keeps the manifest's old chip ids resolving).
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
  'java-model': javaModel,
  'scala-jvm': scalaJvm,
  'scala-model': scalaModel,
  'python-cpython': pythonCpython,
  'python-model': pythonModel,
  dsa: dsa,
  sql: sql,
  // The whole Linux system on one wide map (ported from NodeMap's linux.ts): five
  // stacked privilege bands (userspace → libc → syscall → kernel → hardware).
  // The single dense scene every linux-content module rides; the manifest frames
  // one subsystem per section via highlight/focus.
  linux: linux,
  // The whole Docker platform on one wide map (ported from NodeMap's docker.ts):
  // top spine = Client | Docker Host (Engine·Images·Containers) | Registry; bottom
  // detail = Author | Resources | Orchestrate (Compose·Swarm·Cluster net·Security).
  // The single dense scene every docker-content module rides; the manifest frames
  // one subsystem per section via highlight.
  docker: docker,
  // The whole Kubernetes platform on one wide map (ported from NodeMap's kubernetes.ts):
  // top spine = Client (kubectl) | Cluster (Control Plane·Worker Node) | Registry; bottom
  // detail = Workloads | Resources (Storage·Networking·Config) | Operate (Scheduling·RBAC·Security).
  // The single dense scene every kubernetes-content module rides; the manifest frames
  // one subsystem per section via highlight/focus.
  kubernetes: kubernetes,
}
