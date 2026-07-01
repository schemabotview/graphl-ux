import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, TEAL, YELLOW } from '../engine/colors.ts'

// The WHOLE Databricks Data Intelligence Platform on one wide map — ported from
// NodeMap's `databricks-data-engineer.ts` (`~/Projects/NodeMap/src/data/scenes/
// databricks-data-engineer.ts`). Four columns, left → right:
//   Sources (Batch · Streams) → Connectivity (Lakeflow Connect · Federation) →
//   Data Intelligence Platform (Lakeflow Jobs · Medallion · Workspace+Compute ·
//   Foundation [Delta Lake · Engine · Unity Catalog] · Cloud Storage) → Consumers (BI · Apps · Sharing)
// Geometry is the lesson: data flows left-to-right through the platform; the
// medallion (Bronze→Silver→Gold) sits in the center driven by Declarative Pipelines,
// persists down into Delta Lake on cloud object storage, and Unity Catalog governs
// every layer. This is the single dense scene every databricks-data-engineer-content
// module rides (the camera frames one subsystem per section via the manifest
// `highlight`/`focus`). Faithful transcription: same node ids, same colors, same
// weighted grid tracks — only the dialect changes (NodeMap GridNode → graphl-ux SceneSpec).
//
// Palette maps 1:1 to graphl-ux roles: GRAY=inert sources / supporting, TEAL=streams +
// flow (Delta Sharing), BLUE=connectivity / workspace / compute, ORANGE=storage / engine /
// orchestration, PURPLE=API & governance (Declarative Pipelines · Unity Catalog),
// GREEN=compute output / DBSQL / consumers, YELLOW=storage formats (Delta Lake) + gold.
//
// One deviation (shared with the docker/linux/sql/kubernetes ports): graphl-ux pads by a
// fraction of a CELL, so the source's 0.3 padding on a 1-COLUMN stack becomes a huge side
// gutter. Those stacks use a small padding here so children fill the column; multi-column
// (chip-grid) paddings use a larger value so chips don't touch.

const G = 0.25
const P = 0.3

/** A NodeMap `term`-kind leaf → graphl-ux `term`: a filled chip whose text IS the concept. */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

/** A graphl-ux `symbol`: glyph + label — used for the outer Sources / Consumers, which
 *  are external systems (a thing you point at) rather than in-platform concepts. */
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

/** Native weighted-track authoring: the grid carries relative track WEIGHTS and each
 *  child's `at` becomes its `cell`, indexing those tracks 1:1 (engine resolves arrays). */
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── LEFT: Sources ───────────────────────────────────────────────────────────

const sources = container(
  { id: 'sources', label: 'Sources', color: GRAY },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.4, padding: 0.08 }, [
    {
      node: container(
        { id: 'batch-sources', label: 'Batch', color: GRAY },
        wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: comp('src-files', 'Files', GRAY), at: [0, 0] },
          { node: comp('src-rdbms', 'RDBMS', GRAY), at: [0, 1] },
          { node: comp('src-apis', 'APIs', GRAY), at: [0, 2] },
          { node: comp('src-saas', 'SaaS', GRAY), at: [0, 3] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'stream-sources', label: 'Streams', color: TEAL },
        wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: comp('src-kafka', 'Kafka', TEAL), at: [0, 0] },
          { node: comp('src-kinesis', 'Kinesis', TEAL), at: [0, 1] },
          { node: comp('src-eventhubs', 'Event Hubs', TEAL), at: [0, 2] },
          { node: comp('src-pubsub', 'Pub/Sub', TEAL), at: [0, 3] },
        ]),
      ),
      at: [0, 1],
    },
  ]),
)

// ─── LEFT-MID: Connectivity ───────────────────────────────────────────────────

const connectivity = container(
  { id: 'connectivity', label: 'Connectivity', color: BLUE },
  wgrid({ cols: [1], rows: [1, 3, 1], gap: 0.15, padding: 0.08 }, [
    { node: chip('lakehouse-federation', 'Lakehouse Federation', BLUE), at: [0, 0] },
    {
      node: container(
        { id: 'lakeflow-connect', label: 'Lakeflow Connect', color: BLUE },
        wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: comp('auto-loader', 'Auto Loader', BLUE), at: [0, 0] },
          { node: comp('copy-into', 'COPY INTO', BLUE), at: [0, 1] },
          { node: comp('connectors', 'Connectors', BLUE), at: [0, 2] },
        ]),
      ),
      at: [0, 1],
    },
    { node: chip('connect-api', 'API / REST', BLUE), at: [0, 2] },
  ]),
)

// ─── CENTER: Data Intelligence Platform ───────────────────────────────────────

// What FIRES a job run: scheduled cron (time-based) vs. data-driven (file arrival /
// table update) vs. always-on continuous. The exam's core decision lives here.
const jobTriggers = container(
  { id: 'job-triggers', label: 'Triggers', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
    { node: chip('trigger-cron', 'Scheduled (cron)', ORANGE), at: [0, 0] },
    { node: chip('trigger-file', 'File arrival', ORANGE), at: [0, 1] },
    { node: chip('trigger-table', 'Table update', ORANGE), at: [0, 2] },
    { node: chip('trigger-continuous', 'Continuous', ORANGE), at: [0, 3] },
  ]),
)

// The Job = a DAG of tasks: a trigger fires a run, each task runs one workload type
// (notebook / SQL / pipeline / dashboard); if/else + for_each route the DAG.
const jobDag = container(
  { id: 'job-dag', label: 'Job (Tasks DAG)', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
    { node: chip('task-notebook', 'Notebook', ORANGE), at: [0, 0] },
    { node: chip('task-sql', 'SQL', ORANGE), at: [0, 1] },
    { node: chip('task-pipeline', 'Pipeline', ORANGE), at: [0, 2] },
    { node: chip('task-dashboard', 'Dashboard', ORANGE), at: [0, 3] },
    { node: chip('job-control', 'if/else · for_each', ORANGE), at: [0, 4] },
  ]),
)

const lakeflowJobs = container(
  { id: 'lakeflow-jobs', label: 'Lakeflow Jobs (Workflows)', color: ORANGE },
  wgrid({ cols: [0.9, 1.1, 1, 1, 1], rows: [1], gap: G, padding: P }, [
    { node: jobTriggers, at: [0, 0] },
    { node: jobDag, at: [1, 0] },
    {
      node: container(
        { id: 'declarative-pipelines', label: 'Declarative Pipelines (DLT)', color: PURPLE },
        wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: chip('dlt-table', '@dlt.table', PURPLE), at: [0, 0] },
          { node: chip('streaming-table', 'STREAMING TABLE', PURPLE), at: [0, 1] },
          { node: chip('dlt-expectations', 'Expectations', PURPLE), at: [0, 2] },
          { node: chip('apply-changes', 'APPLY CHANGES INTO', PURPLE), at: [0, 3] },
          { node: chip('dlt-live', 'LIVE.', PURPLE), at: [0, 4] },
        ]),
      ),
      at: [2, 0],
    },
    {
      node: container(
        { id: 'dbsql', label: 'DBSQL Analytics', color: GREEN },
        wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: chip('dbsql-editor', 'SQL Editor', GREEN), at: [0, 0] },
          { node: chip('dbsql-queries', 'Queries', GREEN), at: [0, 1] },
          { node: chip('dbsql-dashboards', 'Dashboards', GREEN), at: [0, 2] },
          { node: chip('dbsql-alerts', 'Alerts', GREEN), at: [0, 3] },
        ]),
      ),
      at: [3, 0],
    },
    {
      node: container(
        { id: 'mosaic-ai', label: 'Mosaic AI (DE Pro)', color: GRAY },
        wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: chip('mlflow', 'MLflow', GRAY), at: [0, 0] },
          { node: chip('model-serving', 'Model Serving', GRAY), at: [0, 1] },
          { node: chip('vector-search', 'Vector Search', GRAY), at: [0, 2] },
          { node: chip('feature-store', 'Feature Store', GRAY), at: [0, 3] },
        ]),
      ),
      at: [4, 0],
    },
  ]),
)

const medallion = container(
  { id: 'medallion', label: 'Medallion (Open Architecture)', color: YELLOW },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
    { node: chip('bronze', 'Bronze', ORANGE), at: [0, 0] },
    { node: chip('silver', 'Silver', GRAY), at: [1, 0] },
    { node: chip('gold', 'Gold', YELLOW), at: [2, 0] },
  ]),
)

// CI/CD: merge to main runs GitHub Actions, which runs `databricks bundle deploy`.
// The databricks.yml bundle declares resources (jobs, pipelines) and deploys them into
// the workspace, run-as a service principal in test/prod. Flow starts at `repos` — the
// Repos / Git chip IS Databricks Git Folders (the workspace clone of the GitHub remote).
const cicd = container(
  { id: 'cicd', label: 'CI/CD', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
    { node: chip('gh-actions', 'GitHub Actions', BLUE), at: [0, 0] },
    { node: chip('databricks-yml', 'databricks.yml', BLUE), at: [0, 1] },
    { node: chip('databricks-cli', 'bundle deploy', BLUE), at: [0, 2] },
    { node: chip('run-as-sp', 'service principal', BLUE), at: [0, 3] },
  ]),
)

const workspaceCompute = container(
  { id: 'workspace-compute', label: 'Workspace + Compute', color: BLUE },
  wgrid({ cols: [1, 1, 1, 1.2], rows: [1, 1], gap: G, padding: 0.22 }, [
    { node: chip('notebooks', 'Notebooks', BLUE), at: [0, 0] },
    { node: chip('dbutils', 'dbutils / Secrets', BLUE), at: [1, 0] },
    { node: chip('repos', 'Repos / Git', BLUE), at: [2, 0] },
    { node: cicd, at: [3, 0] },
    {
      node: container(
        { id: 'compute', label: 'Compute', color: BLUE },
        wgrid({ cols: [1, 1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('all-purpose-cluster', 'All-Purpose', BLUE), at: [0, 0] },
          { node: chip('job-cluster', 'Job', BLUE), at: [1, 0] },
          { node: chip('sql-warehouse', 'SQL Warehouse', GREEN), at: [2, 0] },
          { node: chip('serverless', 'Serverless', TEAL), at: [3, 0] },
          { node: chip('dbr-runtime', 'DBR (LTS)', BLUE), at: [4, 0] },
        ]),
      ),
      at: [0, 1, 4, 1],
    },
  ]),
)

const foundation = group(
  'foundation',
  wgrid({ cols: [3, 2, 3], rows: [1], gap: 0.3, padding: 0.04 }, [
    {
      node: container(
        { id: 'storage-formats', label: 'Storage Formats', color: YELLOW },
        wgrid({ cols: [1], rows: [0.5, 4, 1], gap: 0.15, padding: 0.08 }, [
          {
            node: container(
              { id: 'delta-lake', label: 'Delta Lake', color: YELLOW },
              wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.15, padding: 0.22 }, [
                { node: chip('delta-log', '_delta_log', YELLOW), at: [0, 0] },
                { node: chip('acid', 'ACID', YELLOW), at: [1, 0] },
                { node: chip('time-travel', 'Time Travel', YELLOW), at: [0, 1] },
                { node: chip('optimize-zorder', 'OPTIMIZE / ZORDER', YELLOW), at: [1, 1] },
                { node: chip('vacuum', 'VACUUM', YELLOW), at: [0, 2] },
                { node: chip('merge-into', 'MERGE INTO', YELLOW), at: [1, 2] },
              ]),
            ),
            at: [0, 1],
          },
          { node: chip('iceberg', 'Iceberg (UniForm)', YELLOW), at: [0, 2] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'engine', label: 'Engine', color: ORANGE },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('spark-engine', 'Spark', ORANGE), at: [0, 0] },
          { node: chip('photon', 'Photon', ORANGE), at: [1, 0] },
        ]),
      ),
      at: [1, 0],
    },
    {
      node: container(
        { id: 'unity-catalog', label: 'Unity Catalog', color: PURPLE },
        wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: chip('uc-metastore', 'Metastore', PURPLE), at: [0, 0] },
          { node: chip('uc-namespace', 'catalog.schema.table', PURPLE), at: [0, 1] },
          { node: chip('uc-grant', 'GRANT / REVOKE', PURPLE), at: [0, 2] },
          { node: chip('uc-lineage', 'Lineage', PURPLE), at: [0, 3] },
          { node: chip('uc-volumes', 'Volumes', PURPLE), at: [0, 4] },
        ]),
      ),
      at: [2, 0],
    },
  ]),
)

const cloudStorage = container(
  { id: 'cloud-storage', label: 'Cloud Storage', color: GRAY },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
    { node: chip('s3', 'S3', YELLOW), at: [0, 0] },
    { node: chip('adls', 'ADLS', BLUE), at: [1, 0] },
    { node: chip('gcs', 'GCS', GREEN), at: [2, 0] },
  ]),
)

const platform = container(
  { id: 'data-intelligence-platform', label: 'Data Intelligence Platform', color: ORANGE },
  wgrid({ cols: [1], rows: [4, 1.5, 4, 4, 1], gap: 0.4, padding: 0.08 }, [
    { node: lakeflowJobs, at: [0, 0] },
    { node: medallion, at: [0, 1] },
    { node: workspaceCompute, at: [0, 2] },
    { node: foundation, at: [0, 3] },
    { node: cloudStorage, at: [0, 4] },
  ]),
)

// ─── RIGHT: Consumers ─────────────────────────────────────────────────────────

const consumers = container(
  { id: 'consumers', label: 'Consumers', color: GREEN },
  wgrid({ cols: [1], rows: [3, 1, 1], gap: 0.15, padding: 0.08 }, [
    {
      node: container(
        { id: 'bi', label: 'BI', color: GREEN },
        wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.08 }, [
          { node: comp('tableau', 'Tableau', GREEN), at: [0, 0] },
          { node: comp('power-bi', 'Power BI', GREEN), at: [0, 1] },
          { node: comp('looker', 'Looker', GREEN), at: [0, 2] },
        ]),
      ),
      at: [0, 0],
    },
    { node: comp('databricks-apps', 'Databricks Apps', GREEN), at: [0, 1] },
    { node: comp('delta-sharing', 'Delta Sharing', TEAL), at: [0, 2] },
  ]),
)

// ─── ROOT: the four columns ───────────────────────────────────────────────────

// No outer "Databricks" container: the concept name already lives in the brand bar +
// caption, so a labeled wrapper frame would only steal a title band + padding gutter.
// An invisible `group` carries the source root's 3 / 3 / 18 / 4 weighted columns.
const main: SceneNodeSpec = group(
  'databricks-main',
  wgrid({ cols: [3, 3, 18, 4], rows: [1], gap: 0.4, padding: 0.04 }, [
    { node: sources, at: [0, 0] },
    { node: connectivity, at: [1, 0] },
    { node: platform, at: [2, 0] },
    { node: consumers, at: [3, 0] },
  ]),
)

export const databricksDataEngineer: SceneSpec = {
  id: 'databricks-data-engineer',
  topic: 'databricks-data-engineer',
  title: 'Databricks Data Engineer — the platform',
  subtitle: 'sources → ingest → medallion on Delta + Unity Catalog → consumers',
  // The source map's 32×19 frame (≈1.68:1) so the four columns keep their shape.
  canvas: { width: 1440, height: 855 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [main],
  edges: [
    // ── Ingest: Sources → Lakeflow Connect → Bronze ───────────────────────────
    { from: 'src-files', to: 'auto-loader', label: 'cloudFiles', color: BLUE },
    { from: 'src-rdbms', to: 'lakehouse-federation', label: 'federate', color: BLUE },
    { from: 'src-apis', to: 'connectors', label: 'pull', color: BLUE },
    { from: 'src-saas', to: 'connectors', label: 'pull', color: BLUE },
    { from: 'src-kafka', to: 'auto-loader', label: 'stream', color: TEAL },
    { from: 'src-kinesis', to: 'auto-loader', label: 'stream', color: TEAL },
    { from: 'src-eventhubs', to: 'auto-loader', label: 'stream', color: TEAL },
    { from: 'src-pubsub', to: 'auto-loader', label: 'stream', color: TEAL },
    { from: 'lakeflow-connect', to: 'bronze', label: 'raw write', color: BLUE },
    { from: 'copy-into', to: 'bronze', label: 'idempotent', color: BLUE },

    // ── Orchestration: a trigger fires a Job run; tasks run the workloads ──────
    { from: 'trigger-cron', to: 'job-dag', label: 'time-based', color: ORANGE },
    { from: 'trigger-file', to: 'job-dag', label: 'on arrival', color: ORANGE },
    { from: 'trigger-table', to: 'job-dag', label: 'on update', color: ORANGE },
    { from: 'trigger-continuous', to: 'job-dag', label: 'always on', color: ORANGE },
    { from: 'job-dag', to: 'declarative-pipelines', label: 'pipeline task', color: ORANGE },
    { from: 'job-dag', to: 'dbsql', label: 'SQL task', color: ORANGE },

    // ── ELT: Declarative Pipelines drives Bronze → Silver → Gold ───────────────
    { from: 'declarative-pipelines', to: 'medallion', label: '@dlt.table', color: PURPLE },
    { from: 'bronze', to: 'silver', label: 'cleanse / dedup', color: GRAY },
    { from: 'silver', to: 'gold', label: 'aggregate', color: YELLOW },
    { from: 'apply-changes', to: 'silver', label: 'CDC / SCD', color: PURPLE },

    // ── Serving: Gold → Consumers ──────────────────────────────────────────────
    { from: 'gold', to: 'dbsql', label: 'serve SQL', color: GREEN },
    { from: 'gold', to: 'mosaic-ai', label: 'features', color: GRAY },
    { from: 'gold', to: 'delta-sharing', label: 'share', color: TEAL },
    { from: 'dbsql', to: 'bi', label: 'JDBC / ODBC', color: GREEN },
    { from: 'mosaic-ai', to: 'databricks-apps', label: 'inference', color: GRAY },

    // ── Storage: Medallion persists to Delta Lake → Cloud Storage ──────────────
    { from: 'bronze', to: 'delta-lake', label: 'persist', color: YELLOW },
    { from: 'silver', to: 'delta-lake', label: 'persist', color: YELLOW },
    { from: 'gold', to: 'delta-lake', label: 'persist', color: YELLOW },
    { from: 'delta-lake', to: 's3', label: 'parquet', color: YELLOW },
    { from: 'delta-lake', to: 'adls', label: 'parquet', color: YELLOW },
    { from: 'delta-lake', to: 'gcs', label: 'parquet', color: YELLOW },

    // ── Engine drives workloads ────────────────────────────────────────────────
    { from: 'spark-engine', to: 'declarative-pipelines', label: 'execute', color: ORANGE },
    { from: 'photon', to: 'dbsql', label: 'accelerate', color: ORANGE },

    // ── Governance overlay: Unity Catalog governs everything ───────────────────
    { from: 'unity-catalog', to: 'delta-lake', label: 'table metadata', color: PURPLE },
    { from: 'unity-catalog', to: 'medallion', label: 'GRANT per layer', color: PURPLE },
    { from: 'unity-catalog', to: 'workspace-compute', label: 'attach', color: PURPLE },

    // ── Workspace + Compute hosts dev + execution ──────────────────────────────
    { from: 'notebooks', to: 'all-purpose-cluster', label: 'interactive', color: BLUE },
    { from: 'job-dag', to: 'job-cluster', label: 'runs on', color: ORANGE },
    { from: 'dbr-runtime', to: 'spark-engine', label: 'ships with', color: BLUE },

    // ── CI/CD: merge to main → GH Actions → bundle deploy → resources ──────────
    { from: 'repos', to: 'gh-actions', label: 'merge to main', color: BLUE },
    { from: 'gh-actions', to: 'databricks-cli', label: 'CI runs', color: BLUE },
    { from: 'databricks-yml', to: 'databricks-cli', label: 'resources', color: BLUE },
    { from: 'databricks-cli', to: 'job-dag', label: 'provisions', color: BLUE },
    { from: 'databricks-cli', to: 'declarative-pipelines', label: 'provisions', color: BLUE },
    { from: 'run-as-sp', to: 'job-dag', label: 'run-as', color: BLUE },

    // ── Compute types: SQL warehouse backs DBSQL; serverless backs all workloads ─
    { from: 'dbsql', to: 'sql-warehouse', label: 'runs on', color: GREEN },
    { from: 'serverless', to: 'declarative-pipelines', label: 'serverless DLT', color: TEAL },
    { from: 'serverless', to: 'dbsql', label: 'serverless SQL', color: TEAL },
    { from: 'serverless', to: 'lakeflow-jobs', label: 'serverless jobs', color: TEAL },
  ],
}
