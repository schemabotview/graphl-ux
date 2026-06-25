import type { SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// The WHOLE Spark BATCH API on one 16:9 wall — ported from NodeMap's
// `spark-batch.ts` (`~/Projects/NodeMap/src/data/scenes/spark-batch.ts`). This is
// the shared MASTER MAP: several upcoming modules (rdd-api, dataframe-api,
// sql-api, …) all ride THIS scene and just spotlight their own region via the
// manifest `focus`/`highlight`, so the learner builds one retained mental map.
//
// The source used NodeMap's WEIGHTED grid tracks (`layout.cols/rows` = relative
// weights, `cell` = track index); graphl-ux's resolver now supports those tracks
// NATIVELY (a grid's `cols`/`rows` can be weight arrays), so the transcription is
// faithful (ids, labels, colors, and track weights all come straight from the
// source). `wgrid()` below is the thin authoring shim. Source ids are preserved
// (e.g. `b-ses-create`) so they stay stable spotlight targets for the module manifests.
//
// Palette: graphl-ux has no YELLOW, and amber is spotlight-only — but here YELLOW
// carries a whole lane (pandas-on-Spark) that must stay distinct from the
// DataFrame (orange) / RDD (red) / SQL (green) lanes, so a calm gold YELLOW was
// added to colors.ts (separated from the spotlight amber) rather than remapped.

const G = 0.18
const P = 0.22
// Tight inner padding for the single-column rail containers (Read API's Format
// options / Bad-record / Multi-file / JDBC). Their stacked chips left wide
// left/right margins at P; PT reclaims that so each chip fills the box width.
const PT = 0.01

/**
 * A filled leaf chip — the text IS the value (graphl-ux `term`). The default for
 * everything OUTSIDE the four big API lanes: Setup, the Read/Write rails, the I/O
 * sources/output, and Performance Tuning — those regions read fine as chips.
 */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

/**
 * A bare LABEL leaf — text only, no chip rectangle (graphl-ux `label`). Used ONLY in
 * the four dense API lanes (SQL, pandas, DataFrame, RDD), where ~150 method names as
 * filled chips were a clipped wall of clutter; bare text reads as quiet method lists.
 */
const lbl = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'label' })

/**
 * Native weighted-track authoring: the grid carries the relative track WEIGHTS
 * (`engine/grid.ts` resolves arrays directly), and each child's `at` becomes its
 * `cell`, indexing those tracks 1:1. Same `{ node, at }` ergonomics as the old
 * lowering helper, minus the integer-lowering step — unequal widths are a
 * first-class grid feature now, so the resolver places them straight.
 */
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── SETUP BAND (fully built — proves the term → container → weighted port) ────

const session = container(
  { id: 'b-session', label: 'SparkSession.builder', color: PURPLE },
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: G, padding: P }, [
    { node: chip('b-ses-appname', 'appName', PURPLE), at: [0, 0] },
    { node: chip('b-ses-master', 'master', PURPLE), at: [1, 0] },
    { node: chip('b-ses-remote', 'remote', PURPLE), at: [2, 0] },
    { node: chip('b-ses-hive', 'enableHive', PURPLE), at: [0, 1] },
    { node: chip('b-ses-config', 'config', PURPLE), at: [1, 1] },
    { node: chip('b-ses-create', 'getOrCreate', PURPLE), at: [2, 1] },
  ]),
)

const explain = container(
  { id: 'b-explain', label: 'df.explain() modes', color: YELLOW },
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: G, padding: P }, [
    { node: chip('b-ex-simple', 'simple', YELLOW), at: [0, 0] },
    { node: chip('b-ex-extended', 'extended', YELLOW), at: [1, 0] },
    { node: chip('b-ex-formatted', 'formatted', YELLOW), at: [2, 0] },
    { node: chip('b-ex-cost', 'cost', YELLOW), at: [0, 1] },
    { node: chip('b-ex-codegen', 'codegen', YELLOW), at: [1, 1] },
  ]),
)

const cli = container(
  { id: 'b-cli', label: 'CLI commands', color: BLUE },
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: G, padding: P }, [
    { node: chip('b-cli-shell', 'spark-shell', BLUE), at: [0, 0] },
    { node: chip('b-cli-submit', 'spark-submit', BLUE), at: [1, 0] },
    { node: chip('b-cli-sql', 'spark-sql', BLUE), at: [2, 0] },
    { node: chip('b-cli-connect', 'start-connect-server', BLUE), at: [0, 1] },
    { node: chip('b-cli-stop', 'stop-connect-server', BLUE), at: [1, 1] },
  ]),
)

const setup = container(
  { id: 'b-setup', label: 'Setup', color: PURPLE },
  wgrid({ cols: [1.2, 1, 1.2], rows: [1], gap: 0.3, padding: P }, [
    { node: session, at: [0, 0] },
    { node: explain, at: [1, 0] },
    { node: cli, at: [2, 0] },
  ]),
)

// ─── INPUT SOURCES (left I/O rail) ─────────────────────────────────────────────

const sources = container(
  { id: 'b-sources', label: 'Input Sources', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-src-csv', 'CSV', TEAL), at: [0, 0] },
    { node: chip('b-src-parquet', 'Parquet', TEAL), at: [0, 1] },
    { node: chip('b-src-json', 'JSON', TEAL), at: [0, 2] },
    { node: chip('b-src-orc', 'ORC', TEAL), at: [0, 3] },
    { node: chip('b-src-jdbc', 'JDBC', TEAL), at: [0, 4] },
    { node: chip('b-src-hive', 'Hive', TEAL), at: [0, 5] },
    { node: chip('b-src-files', 'Files', TEAL), at: [0, 6] },
    { node: chip('b-src-delta', 'Delta', TEAL), at: [0, 7] },
  ]),
)

// ─── READ API (spark.read) ─────────────────────────────────────────────────────

const formatOptions = container(
  { id: 'b-read-fmt', label: 'Format options', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-r-header', 'header', BLUE), at: [0, 0] },
    { node: chip('b-r-sep', 'sep', BLUE), at: [0, 1] },
    { node: chip('b-r-merge', 'mergeSchema', BLUE), at: [0, 2] },
    { node: chip('b-r-multiline', 'multiLine', BLUE), at: [0, 3] },
  ]),
)

const badRecord = container(
  { id: 'b-read-mode', label: 'Bad-record mode()', color: RED },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-r-permissive', 'permissive', RED), at: [0, 0] },
    { node: chip('b-r-failfast', 'failFast', RED), at: [0, 1] },
    { node: chip('b-r-drop', 'dropMalformed', RED), at: [0, 2] },
    { node: chip('b-r-corrupt', 'columnNameOfCorrupt', RED), at: [0, 3] },
    { node: chip('b-r-badpath', 'badRecordsPath', RED), at: [0, 4] },
  ]),
)

const multiFile = container(
  { id: 'b-read-multi', label: 'Multi-file lookup', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-r-glob', 'glob', YELLOW), at: [0, 0] },
    { node: chip('b-r-regex', 'regex', YELLOW), at: [0, 1] },
    { node: chip('b-r-paths', 'multiple paths', YELLOW), at: [0, 2] },
    { node: chip('b-r-recurse', 'recursiveFileLookup', YELLOW), at: [0, 3] },
  ]),
)

const jdbcReads = container(
  { id: 'b-read-jdbc', label: 'JDBC parallel reads', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-r-pcol', 'partitionColumn', PURPLE), at: [0, 0] },
    { node: chip('b-r-lower', 'lowerBound', PURPLE), at: [0, 1] },
    { node: chip('b-r-upper', 'upperBound', PURPLE), at: [0, 2] },
    { node: chip('b-r-numpar', 'numPartitions', PURPLE), at: [0, 3] },
    { node: chip('b-r-fetch', 'fetchSize', PURPLE), at: [0, 4] },
  ]),
)

const readApi = container(
  { id: 'b-read', label: 'Read API', color: BLUE },
  wgrid({ cols: [1], rows: [4, 5, 4, 5], gap: 0.22, padding: P }, [
    { node: formatOptions, at: [0, 0] },
    { node: badRecord, at: [0, 1] },
    { node: multiFile, at: [0, 2] },
    { node: jdbcReads, at: [0, 3] },
  ]),
)

// ─── WRITE API (df.write) ──────────────────────────────────────────────────────

const writeMode = container(
  { id: 'b-w-mode', label: 'mode()', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-w-m-over', 'overwrite', ORANGE), at: [0, 0] },
    { node: chip('b-w-m-append', 'append', ORANGE), at: [0, 1] },
    { node: chip('b-w-m-error', 'error', ORANGE), at: [0, 2] },
    { node: chip('b-w-m-ignore', 'ignore', ORANGE), at: [0, 3] },
  ]),
)

const writeLayout = container(
  { id: 'b-w-layout', label: 'Layout', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-w-partby', 'partitionBy', GREEN), at: [0, 0] },
    { node: chip('b-w-bucket', 'bucketBy', GREEN), at: [0, 1] },
    { node: chip('b-w-sortby', 'sortBy', GREEN), at: [0, 2] },
  ]),
)

const writeSinks = container(
  { id: 'b-w-sinks', label: 'Sinks', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-w-save', 'save', PURPLE), at: [0, 0] },
    { node: chip('b-w-saveTbl', 'saveAsTable', PURPLE), at: [0, 1] },
    { node: chip('b-w-jdbc', 'jdbc', PURPLE), at: [0, 2] },
    { node: chip('b-w-insert', 'insertInto', PURPLE), at: [0, 3] },
  ]),
)

const writeFormat = container(
  { id: 'b-w-fmt', label: 'Format', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-w-fmt-pq', 'parquet', TEAL), at: [0, 0] },
    { node: chip('b-w-fmt-csv', 'csv', TEAL), at: [0, 1] },
    { node: chip('b-w-fmt-json', 'json', TEAL), at: [0, 2] },
    { node: chip('b-w-fmt-delta', 'delta', TEAL), at: [0, 3] },
  ]),
)

const writeApi = container(
  { id: 'b-write', label: 'Write API', color: BLUE },
  wgrid({ cols: [1], rows: [1.2, 1, 1, 1], gap: 0.22, padding: P }, [
    { node: writeMode, at: [0, 0] },
    { node: writeLayout, at: [0, 1] },
    { node: writeSinks, at: [0, 2] },
    { node: writeFormat, at: [0, 3] },
  ]),
)

// ─── OUTPUT (right I/O rail) ───────────────────────────────────────────────────

const output = container(
  { id: 'b-output', label: 'Output', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('b-out-files', 'Files', TEAL), at: [0, 0] },
    { node: chip('b-out-hive', 'Hive table', TEAL), at: [0, 1] },
    { node: chip('b-out-jdbc', 'JDBC target', TEAL), at: [0, 2] },
    { node: chip('b-out-delta', 'Delta table', TEAL), at: [0, 3] },
  ]),
)

// ─── RDD LANE ──────────────────────────────────────────────────────────────────
// create → transform (narrow / wide / pair-byKey) → act, across [1,1.2,1.4,1.4,1.5].

const rddCreate = container(
  { id: 'b-rdd-create', label: 'Creation', color: RED },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-rdd-parallelize', 'parallelize', RED), at: [0, 0] },
    { node: lbl('b-rdd-numslices', 'numSlices', RED), at: [0, 1] },
    { node: lbl('b-rdd-textfile', 'textFile', RED), at: [0, 2] },
    { node: lbl('b-rdd-whole', 'wholeTextFiles', RED), at: [0, 3] },
  ]),
)

const rddNarrow = container(
  { id: 'b-rdd-narrow', label: 'Narrow (local)', color: GREEN },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-rdd-map', 'map', GREEN), at: [0, 0] },
    { node: lbl('b-rdd-mappart', 'mapPartitions', GREEN), at: [1, 0] },
    { node: lbl('b-rdd-flatmap', 'flatMap', GREEN), at: [0, 1] },
    { node: lbl('b-rdd-repart', 'repartition', GREEN), at: [1, 1] },
    { node: lbl('b-rdd-filter', 'filter', GREEN), at: [0, 2] },
    { node: lbl('b-rdd-coalesce', 'coalesce', GREEN), at: [1, 2] },
  ]),
)

const rddWide = container(
  { id: 'b-rdd-wide', label: 'Wide (shuffle)', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-rdd-union', 'union', ORANGE), at: [0, 0] },
    { node: lbl('b-rdd-distinct', 'distinct', ORANGE), at: [1, 0] },
    { node: lbl('b-rdd-inter', 'intersection', ORANGE), at: [0, 1] },
    { node: lbl('b-rdd-sortbykey', 'sortByKey', ORANGE), at: [1, 1] },
    { node: lbl('b-rdd-subtract', 'subtract', ORANGE), at: [0, 2] },
    { node: lbl('b-rdd-join', 'join', ORANGE), at: [1, 2] },
    { node: lbl('b-rdd-cart', 'cartesian', ORANGE), at: [0, 3] },
    { node: lbl('b-rdd-cogroup', 'cogroup', ORANGE), at: [1, 3] },
  ]),
)

const rddPair = container(
  { id: 'b-rdd-pair', label: 'Pair RDD — byKey', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-rdd-maptopair', 'mapToPair', PURPLE), at: [0, 0] },
    { node: lbl('b-rdd-rbk', 'reduceByKey', PURPLE), at: [1, 0] },
    { node: lbl('b-rdd-gbk', 'groupByKey', PURPLE), at: [0, 1] },
    { node: lbl('b-rdd-abk', 'aggregateByKey', PURPLE), at: [1, 1] },
    { node: lbl('b-rdd-fbk', 'foldByKey', PURPLE), at: [0, 2] },
    { node: lbl('b-rdd-cbk', 'combineByKey', PURPLE), at: [1, 2] },
    { node: lbl('b-rdd-cntbk', 'countByKey', PURPLE), at: [0, 3] },
    { node: lbl('b-rdd-sampbk', 'sampleByKey', PURPLE), at: [1, 3] },
  ]),
)

const rddActions = container(
  { id: 'b-rdd-actions', label: 'Actions + Misc', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-rdd-collect', 'collect', TEAL), at: [0, 0] },
    { node: lbl('b-rdd-count', 'count', TEAL), at: [1, 0] },
    { node: lbl('b-rdd-take', 'take', TEAL), at: [0, 1] },
    { node: lbl('b-rdd-first', 'first', TEAL), at: [1, 1] },
    { node: lbl('b-rdd-reduce', 'reduce', TEAL), at: [0, 2] },
    { node: lbl('b-rdd-fold', 'fold', TEAL), at: [1, 2] },
    { node: lbl('b-rdd-agg', 'aggregate', TEAL), at: [0, 3] },
    { node: lbl('b-rdd-savetxt', 'saveAsTextFile', TEAL), at: [1, 3] },
    { node: lbl('b-rdd-bcast', 'broadcast', TEAL), at: [0, 4] },
    { node: lbl('b-rdd-acc', 'accumulator', TEAL), at: [1, 4] },
  ]),
)

const rddLane = container(
  { id: 'b-rdd', label: 'RDD API', color: RED },
  wgrid({ cols: [1, 1.2, 1.4, 1.4, 1.5], rows: [1], gap: 0.22, padding: P }, [
    { node: rddCreate, at: [0, 0] },
    { node: rddNarrow, at: [1, 0] },
    { node: rddWide, at: [2, 0] },
    { node: rddPair, at: [3, 0] },
    { node: rddActions, at: [4, 0] },
  ]),
)

// ─── PANDAS-ON-SPARK LANE ──────────────────────────────────────────────────────
// creation → transformations → actions → index strategies, across [1,1,1,1].

const psCreate = container(
  { id: 'b-ps-create', label: 'Creation', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-ps-dfdict', 'ps.DataFrame(dict)', YELLOW), at: [0, 0] },
    { node: lbl('b-ps-read', 'read_csv/json/parquet', YELLOW), at: [0, 1] },
    { node: lbl('b-ps-papi', 'sdf.pandas_api()', YELLOW), at: [0, 2] },
    { node: lbl('b-ps-fp', 'ps.from_pandas(pdf)', YELLOW), at: [0, 3] },
  ]),
)

const psTrans = container(
  { id: 'b-ps-trans', label: 'Transformations', color: GREEN },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-ps-t-col', 'select/asgn', GREEN), at: [0, 0] },
    { node: lbl('b-ps-t-filter', 'filter/qry', GREEN), at: [1, 0] },
    { node: lbl('b-ps-t-group', 'groupby/agg', GREEN), at: [0, 1] },
    { node: lbl('b-ps-t-join', 'merge/join', GREEN), at: [1, 1] },
    { node: lbl('b-ps-t-clean', 'na/rename', GREEN), at: [0, 2] },
    { node: lbl('b-ps-t-fns', 'str/dt/num', GREEN), at: [1, 2] },
    { node: lbl('b-ps-t-row', 'apply/trans', GREEN), at: [0, 3] },
  ]),
)

const psActions = container(
  { id: 'b-ps-actions', label: 'Actions', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-ps-tc', 'to_csv', TEAL), at: [0, 0] },
    { node: lbl('b-ps-tp', 'to_parquet', TEAL), at: [0, 1] },
    { node: lbl('b-ps-tj', 'to_json', TEAL), at: [0, 2] },
    { node: lbl('b-ps-tpd', 'to_pandas', TEAL), at: [0, 3] },
  ]),
)

const psIndex = container(
  { id: 'b-ps-index', label: 'Index Strategies', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-ps-idx-seq', 'sequence', PURPLE), at: [0, 0] },
    { node: lbl('b-ps-idx-dist', 'distributed', PURPLE), at: [0, 1] },
    { node: lbl('b-ps-idx-ds', 'distributed-sequence', PURPLE), at: [0, 2] },
    { node: lbl('b-ps-idx-cfg', 'compute.ops_on_diff', PURPLE), at: [0, 3] },
  ]),
)

const pandasLane = container(
  { id: 'b-ps', label: 'pandas API on Spark (ps)', color: YELLOW },
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.22, padding: P }, [
    { node: psCreate, at: [0, 0] },
    { node: psTrans, at: [1, 0] },
    { node: psActions, at: [2, 0] },
    { node: psIndex, at: [3, 0] },
  ]),
)

// ─── SQL LANE ────────────────────────────────────────────────────────────────
// views/catalog → queries → joins/sets/CTE → aggregates/window → functions →
// null semantics, across [1,1.2,1.2,1.1,1.4,1.1].

const sqlViews = container(
  { id: 'b-sql-views', label: 'Views + Catalog', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-sql-temp', 'createTempView', GREEN), at: [0, 0] },
    { node: lbl('b-sql-gtemp', 'createGlobalTempView', GREEN), at: [0, 1] },
    { node: lbl('b-sql-savetbl', 'saveAsTable', GREEN), at: [0, 2] },
    { node: lbl('b-sql-listtbl', 'catalog.listTables', GREEN), at: [0, 3] },
    { node: lbl('b-sql-listcol', 'catalog.listColumns', GREEN), at: [0, 4] },
  ]),
)

const sqlQueries = container(
  { id: 'b-sql-queries', label: 'Queries', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-sql-select', 'SELECT', ORANGE), at: [0, 0] },
    { node: lbl('b-sql-from', 'FROM', ORANGE), at: [1, 0] },
    { node: lbl('b-sql-where', 'WHERE', ORANGE), at: [0, 1] },
    { node: lbl('b-sql-group', 'GROUP BY', ORANGE), at: [1, 1] },
    { node: lbl('b-sql-having', 'HAVING', ORANGE), at: [0, 2] },
    { node: lbl('b-sql-order', 'ORDER BY', ORANGE), at: [1, 2] },
    { node: lbl('b-sql-limit', 'LIMIT', ORANGE), at: [0, 3] },
    { node: lbl('b-sql-offset', 'OFFSET', ORANGE), at: [1, 3] },
  ]),
)

const sqlJoins = container(
  { id: 'b-sql-joins', label: 'Joins + Sets + CTE', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-sql-j-inner', 'INNER JOIN', PURPLE), at: [0, 0] },
    { node: lbl('b-sql-j-left', 'LEFT JOIN', PURPLE), at: [1, 0] },
    { node: lbl('b-sql-j-full', 'FULL JOIN', PURPLE), at: [0, 1] },
    { node: lbl('b-sql-j-semi', 'SEMI/ANTI', PURPLE), at: [1, 1] },
    { node: lbl('b-sql-set-u', 'UNION', PURPLE), at: [0, 2] },
    { node: lbl('b-sql-set-i', 'INTERSECT', PURPLE), at: [1, 2] },
    { node: lbl('b-sql-cte', 'WITH (CTE)', PURPLE), at: [0, 3] },
    { node: lbl('b-sql-sub', 'subquery', PURPLE), at: [1, 3] },
  ]),
)

const sqlAgg = container(
  { id: 'b-sql-agg', label: 'Aggregates', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-sql-avg', 'AVG', TEAL), at: [0, 0] },
    { node: lbl('b-sql-sum', 'SUM', TEAL), at: [1, 0] },
    { node: lbl('b-sql-minmax', 'MIN/MAX', TEAL), at: [0, 1] },
    { node: lbl('b-sql-count', 'COUNT', TEAL), at: [1, 1] },
    { node: lbl('b-sql-rownum', 'ROW_NUMBER', TEAL), at: [0, 2] },
    { node: lbl('b-sql-rank', 'RANK', TEAL), at: [1, 2] },
    { node: lbl('b-sql-lag', 'LAG/LEAD', TEAL), at: [0, 3] },
    { node: lbl('b-sql-cume', 'CUME_DIST', TEAL), at: [1, 3] },
  ]),
)

const sqlFns = container(
  { id: 'b-sql-fns', label: 'Functions', color: BLUE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-sql-fn-acf', 'abs/ceil/floor', BLUE), at: [0, 0] },
    { node: lbl('b-sql-fn-rsl', 'round/sqrt/log', BLUE), at: [1, 0] },
    { node: lbl('b-sql-fn-str1', 'concat/substring', BLUE), at: [0, 1] },
    { node: lbl('b-sql-fn-str2', 'upper/lower/trim', BLUE), at: [1, 1] },
    { node: lbl('b-sql-fn-dt1', 'current_date / ts', BLUE), at: [0, 2] },
    { node: lbl('b-sql-fn-dt2', 'date_add / format', BLUE), at: [1, 2] },
    { node: lbl('b-sql-fn-a1', 'array_contains', BLUE), at: [0, 3] },
    { node: lbl('b-sql-fn-a2', 'array_sort/union', BLUE), at: [1, 3] },
  ]),
)

const sqlNull = container(
  { id: 'b-sql-null', label: 'Null semantics', color: RED },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-sql-n-eq', '=', RED), at: [0, 0] },
    { node: lbl('b-sql-n-neq', '<==>', RED), at: [0, 1] },
    { node: lbl('b-sql-n-isn', 'IS NULL', RED), at: [0, 2] },
    { node: lbl('b-sql-n-coa', 'COALESCE', RED), at: [0, 3] },
    { node: lbl('b-sql-n-nif', 'NULLIF', RED), at: [0, 4] },
  ]),
)

const sqlLane = container(
  { id: 'b-sql', label: 'SQL API', color: GREEN },
  wgrid({ cols: [1, 1.2, 1.2, 1.1, 1.4, 1.1], rows: [1], gap: 0.22, padding: P }, [
    { node: sqlViews, at: [0, 0] },
    { node: sqlQueries, at: [1, 0] },
    { node: sqlJoins, at: [2, 0] },
    { node: sqlAgg, at: [3, 0] },
    { node: sqlFns, at: [4, 0] },
    { node: sqlNull, at: [5, 0] },
  ]),
)

// ─── DATAFRAME LANE ──────────────────────────────────────────────────────────
// schema → columns → transform → functions → joins → aggregations → actions,
// across [1,1,1.4,1.2,1.2,1.2,1.2].

const dfCreate = container(
  { id: 'b-df-create', label: 'Schema + Creation', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-df-structtype', 'StructType', ORANGE), at: [0, 0] },
    { node: lbl('b-df-ddl', 'DDL string', ORANGE), at: [0, 1] },
    { node: lbl('b-df-createdf', 'createDataFrame', ORANGE), at: [0, 2] },
    { node: lbl('b-df-sql-create', 'spark.sql()', ORANGE), at: [0, 3] },
    { node: lbl('b-df-read', 'spark.read', ORANGE), at: [0, 4] },
  ]),
)

const dfCol = container(
  { id: 'b-df-col', label: 'Column ref + when', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-df-colstr', '"name"', YELLOW), at: [0, 0] },
    { node: lbl('b-df-colfn', 'col("n")', YELLOW), at: [0, 1] },
    { node: lbl('b-df-expr', 'expr("…")', YELLOW), at: [0, 2] },
    { node: lbl('b-df-dfcol', 'df.col("n")', YELLOW), at: [0, 3] },
    { node: lbl('b-df-dfidx', 'df["n"]', YELLOW), at: [0, 4] },
    { node: lbl('b-df-when', 'when/otherwise', YELLOW), at: [0, 5] },
  ]),
)

const dfTrans = container(
  { id: 'b-df-trans', label: 'Transformations', color: GREEN },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-df-t-select', 'select', GREEN), at: [0, 0] },
    { node: lbl('b-df-t-selectexpr', 'selectExpr', GREEN), at: [1, 0] },
    { node: lbl('b-df-t-withcol', 'withColumn', GREEN), at: [0, 1] },
    { node: lbl('b-df-t-rename', 'withColumnRenamed', GREEN), at: [1, 1] },
    { node: lbl('b-df-t-drop', 'drop', GREEN), at: [0, 2] },
    { node: lbl('b-df-t-filter', 'filter / where', GREEN), at: [1, 2] },
    { node: lbl('b-df-t-nadrop', 'na.drop', GREEN), at: [0, 3] },
    { node: lbl('b-df-t-nafill', 'na.fill', GREEN), at: [1, 3] },
    { node: lbl('b-df-t-cast', 'cast', GREEN), at: [0, 4] },
    { node: lbl('b-df-t-orderby', 'orderBy / sort', GREEN), at: [1, 4] },
    { node: lbl('b-df-t-dedupe', 'dropDuplicates', GREEN), at: [0, 5] },
    { node: lbl('b-df-t-distinct', 'distinct', GREEN), at: [1, 5] },
  ]),
)

const dfFns = container(
  { id: 'b-df-fns', label: 'Functions', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-df-fn-str', 'string fns', BLUE), at: [0, 0] },
    { node: lbl('b-df-fn-date', 'date/time fns', BLUE), at: [0, 1] },
    { node: lbl('b-df-fn-array', 'array fns', BLUE), at: [0, 2] },
    { node: lbl('b-df-fn-udf', 'UDF / pandas_udf', BLUE), at: [0, 3] },
  ]),
)

const dfJoins = container(
  { id: 'b-df-joins', label: 'Joins + Set ops', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-df-j-inner', 'inner', PURPLE), at: [0, 0] },
    { node: lbl('b-df-j-left', 'left', PURPLE), at: [1, 0] },
    { node: lbl('b-df-j-right', 'right', PURPLE), at: [0, 1] },
    { node: lbl('b-df-j-outer', 'outer', PURPLE), at: [1, 1] },
    { node: lbl('b-df-j-semi', 'semi/anti', PURPLE), at: [0, 2] },
    { node: lbl('b-df-j-cross', 'cross', PURPLE), at: [1, 2] },
    { node: lbl('b-df-set-union', 'union', PURPLE), at: [0, 3] },
    { node: lbl('b-df-set-inter', 'intersect', PURPLE), at: [1, 3] },
  ]),
)

const dfAgg = container(
  { id: 'b-df-agg', label: 'Aggregations', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-df-a-groupby', 'groupBy', TEAL), at: [0, 0] },
    { node: lbl('b-df-a-agg', 'agg', TEAL), at: [1, 0] },
    { node: lbl('b-df-a-cntdist', 'countDistinct', TEAL), at: [0, 1] },
    { node: lbl('b-df-a-rollup', 'rollup/cube', TEAL), at: [1, 1] },
    { node: lbl('b-df-a-pivot', 'pivot', TEAL), at: [0, 2] },
    { node: lbl('b-df-a-stack', 'stack/melt', TEAL), at: [1, 2] },
    { node: lbl('b-df-w-over', 'Window.over', TEAL), at: [0, 3] },
    { node: lbl('b-df-w-rank', 'rank/row_num', TEAL), at: [1, 3] },
  ]),
)

const dfActions = container(
  { id: 'b-df-actions', label: 'Actions', color: RED },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('b-df-act-collect', 'collect', RED), at: [0, 0] },
    { node: lbl('b-df-act-count', 'count', RED), at: [1, 0] },
    { node: lbl('b-df-act-show', 'show', RED), at: [0, 1] },
    { node: lbl('b-df-act-take', 'take', RED), at: [1, 1] },
    { node: lbl('b-df-act-cache', 'cache', RED), at: [0, 2] },
    { node: lbl('b-df-act-persist', 'persist', RED), at: [1, 2] },
    { node: lbl('b-df-act-print', 'printSchema', RED), at: [0, 3] },
    { node: lbl('b-df-act-desc', 'describe', RED), at: [1, 3] },
    { node: lbl('b-df-act-sample', 'sample', RED), at: [0, 4] },
    { node: lbl('b-df-act-sampby', 'sampleBy', RED), at: [1, 4] },
  ]),
)

const dfLane = container(
  { id: 'b-df', label: 'DataFrame API', color: ORANGE },
  wgrid({ cols: [1, 1, 1.4, 1.2, 1.2, 1.2, 1.2], rows: [1], gap: 0.22, padding: P }, [
    { node: dfCreate, at: [0, 0] },
    { node: dfCol, at: [1, 0] },
    { node: dfTrans, at: [2, 0] },
    { node: dfFns, at: [3, 0] },
    { node: dfJoins, at: [4, 0] },
    { node: dfAgg, at: [5, 0] },
    { node: dfActions, at: [6, 0] },
  ]),
)

// ─── PIPELINE BAND ─────────────────────────────────────────────────────────────
// sources · readApi · apiLanes · writeApi · output across [2,3.5,18,4,2].
// apiLanes stacks the four API lanes (sql / pandas / df / rdd) at [1,0.7,1,1] —
// sql/pandas still shells, filled in Slices 5–6.

const apiLanes = group(
  'b-apis',
  wgrid({ cols: [1], rows: [1, 0.7, 1, 1], gap: 0.3, padding: 0 }, [
    { node: sqlLane, at: [0, 0] },
    { node: pandasLane, at: [0, 1] },
    { node: dfLane, at: [0, 2] },
    { node: rddLane, at: [0, 3] },
  ]),
)

const pipeline = group(
  'b-pipeline',
  wgrid({ cols: [2, 3.5, 18, 4, 2], rows: [1], gap: 0.35, padding: 0 }, [
    { node: sources, at: [0, 0] },
    { node: readApi, at: [1, 0] },
    { node: apiLanes, at: [2, 0] },
    { node: writeApi, at: [3, 0] },
    { node: output, at: [4, 0] },
  ]),
)

// ─── PERFORMANCE TUNING BAND ───────────────────────────────────────────────────
// partitioning · shuffle · cache-vs-persist · broadcast joins, across [1,1,1,1].

const perfPart = container(
  { id: 'b-perf-part', label: 'Partitioning', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: G, padding: P }, [
    { node: chip('b-perf-rp', 'repartition', ORANGE), at: [0, 0] },
    { node: chip('b-perf-co', 'coalesce', ORANGE), at: [0, 1] },
    { node: chip('b-perf-pb', 'partitionBy', ORANGE), at: [0, 2] },
  ]),
)

const perfShuffle = container(
  { id: 'b-perf-shuffle', label: 'Shuffle', color: RED },
  wgrid({ cols: [1], rows: [1, 1], gap: G, padding: P }, [
    { node: chip('b-perf-smj', 'sortMergeJoin', RED), at: [0, 0] },
    { node: chip('b-perf-sp', 'shuffle partitions', RED), at: [0, 1] },
  ]),
)

const perfCache = container(
  { id: 'b-perf-cache', label: 'Cache vs Persist', color: BLUE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: G, padding: P }, [
    { node: chip('b-perf-cache-c', 'cache', BLUE), at: [0, 0] },
    { node: chip('b-perf-cache-p', 'persist', BLUE), at: [1, 0] },
    { node: chip('b-perf-cache-u', 'unpersist', BLUE), at: [0, 1] },
    { node: chip('b-sl-mo', 'MEMORY_ONLY', BLUE), at: [0, 2] },
    { node: chip('b-sl-mad', 'MEMORY_AND_DISK', BLUE), at: [1, 2] },
    { node: chip('b-sl-mos', 'MEMORY_ONLY_SER', BLUE), at: [0, 3] },
    { node: chip('b-sl-mads', 'MEMORY_AND_DISK_2', BLUE), at: [1, 3] },
  ]),
)

const perfBcast = container(
  { id: 'b-perf-bcast', label: 'Broadcast joins', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1], gap: G, padding: P }, [
    { node: chip('b-perf-bc-fn', 'broadcast(df)', PURPLE), at: [0, 0] },
    { node: chip('b-perf-bc-cfg', 'autoBroadcastJoin', PURPLE), at: [0, 1] },
  ]),
)

const perf = container(
  { id: 'b-perf', label: 'Performance Tuning', color: GRAY },
  // Tight inter-container gap (was 0.3): the four sub-containers were narrower
  // than needed, clipping long chip labels (repartition, MEMORY_AND_DISK_2). The
  // reclaimed gap space widens every container — chips get the width to fit.
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.15, padding: P }, [
    { node: perfPart, at: [0, 0] },
    { node: perfShuffle, at: [1, 0] },
    { node: perfCache, at: [2, 0] },
    { node: perfBcast, at: [3, 0] },
  ]),
)

// ─── ROOT ──────────────────────────────────────────────────────────────────────
// Invisible outer frame (NodeMap `showChrome: false`): setup · pipeline · perf
// stacked at the source's [2.2, 14, 2.2] proportions.

const root = group(
  'spark-batch-root',
  wgrid({ cols: [1], rows: [2.2, 14, 2.2], gap: 0.5, padding: 0.4 }, [
    { node: setup, at: [0, 0] },
    { node: pipeline, at: [0, 1] },
    { node: perf, at: [0, 2] },
  ]),
)

export const sparkBatchApi: SceneSpec = {
  id: 'spark-batch-api',
  topic: 'apache-spark',
  title: 'Apache Spark — Batch API',
  subtitle: 'Setup → sources → read → APIs → write → output, plus tuning',
  // ~36:22 canvas (the source's frame) so the wide map renders close to square.
  canvas: { width: 1440, height: 880 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  // The batch pipeline spine: Setup → sources → read → (the four API lanes) →
  // write → output. Calm uniform edges (no per-edge color) so the colour stays in
  // the region blocks; `step` labels show HOW you move between regions. Edges into
  // the API lanes target the lane container ids (still shells until Slices 3–6).
  edges: [
    { from: 'b-ses-create', to: 'b-sources', label: 'session' },
    { from: 'b-sources', to: 'b-read', label: 'spark.read' },
    { from: 'b-read', to: 'b-sql', label: 'createTempView' },
    { from: 'b-read', to: 'b-ps', label: 'pandas-on-Spark' },
    { from: 'b-read', to: 'b-df', label: 'DataFrame' },
    { from: 'b-read', to: 'b-rdd', label: 'parallelize' },
    { from: 'b-sql', to: 'b-write', label: 'INSERT INTO' },
    { from: 'b-ps', to: 'b-write', label: 'to_parquet' },
    { from: 'b-df', to: 'b-write', label: 'df.write' },
    { from: 'b-rdd', to: 'b-write', label: 'saveAsTextFile' },
    { from: 'b-write', to: 'b-output', label: 'persist' },
    // Performance tuning is cross-cutting — it touches the lanes rather than
    // sitting in the pipeline flow, so these read as accents into the API lanes.
    { from: 'b-perf-part', to: 'b-df', label: 'tune' },
    { from: 'b-perf-shuffle', to: 'b-df', label: 'join' },
    { from: 'b-perf-cache', to: 'b-rdd', label: 'reuse' },
    { from: 'b-perf-bcast', to: 'b-sql', label: 'small-side' },
  ],
}
