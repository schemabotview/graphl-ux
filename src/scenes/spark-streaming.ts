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

// The WHOLE Spark STRUCTURED STREAMING API on one 16:9 wall — ported from
// NodeMap's `spark-streaming.ts` (`~/Projects/NodeMap/src/data/scenes/spark-streaming.ts`),
// the same way `spark-batch-api.ts` was: NodeMap's WEIGHTED grid tracks
// (`layout.cols/rows` = relative weights, `cell` = track index) are resolved
// NATIVELY now (a grid's `cols`/`rows` can be weight arrays; `wgrid()` is the thin
// shim), so the transcription is faithful (ids, labels, colors, and track weights
// all come straight from the source).
// Source ids are preserved (e.g. `s-ses-create`) so they stay stable spotlight
// targets for the module manifests.
//
// Edges: the source `connections` carried a per-edge `color`; like the batch
// scene we drop it and keep calm uniform edges (color lives in the region blocks,
// the `label` shows HOW you move between regions).

const G = 0.18
const P = 0.22
// Tight inner padding for the single-column rail containers (sources, the read /
// dataframe / sinks / output rails). Their stacked chips leave wide left/right
// margins at P; PT reclaims that so each long label fills the box width.
const PT = 0.01

/** A filled leaf chip — the text IS the value (graphl-ux `term`). The default
 *  outside the dense DataFrame-API lane: rails, sinks, option groups read fine. */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

/**
 * A bare LABEL leaf — text only, no chip rectangle (graphl-ux `label`). Used ONLY in
 * the dense DataFrame API (streaming) lane (stateless/windows/watermark/stateful/
 * joins), matching the batch map: filled chips there stretched into tall boxes with
 * a short-word-bigger font; bare text reads as a quiet, even method list.
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

// ─── SETUP BAND ──────────────────────────────────────────────────────────────

const session = container(
  { id: 's-session', label: 'SparkSession.builder', color: PURPLE },
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: G, padding: P }, [
    { node: chip('s-ses-appname', 'appName', PURPLE), at: [0, 0] },
    { node: chip('s-ses-master', 'master', PURPLE), at: [1, 0] },
    { node: chip('s-ses-remote', 'remote', PURPLE), at: [2, 0] },
    { node: chip('s-ses-hive', 'enableHive', PURPLE), at: [0, 1] },
    { node: chip('s-ses-config', 'config', PURPLE), at: [1, 1] },
    { node: chip('s-ses-create', 'getOrCreate', PURPLE), at: [2, 1] },
  ]),
)

const manager = container(
  { id: 's-mgr', label: 'spark.streams (manager)', color: YELLOW },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: G, padding: P }, [
    { node: chip('s-mgr-active', 'active', YELLOW), at: [0, 0] },
    { node: chip('s-mgr-get', 'get(id)', YELLOW), at: [1, 0] },
    { node: chip('s-mgr-await', 'awaitAnyTermination', YELLOW), at: [0, 1] },
    { node: chip('s-mgr-reset', 'resetTerminated', YELLOW), at: [1, 1] },
    { node: chip('s-mgr-listen', 'addListener', YELLOW), at: [0, 2] },
  ]),
)

const queryHandle = container(
  { id: 's-query', label: 'StreamingQuery handle', color: BLUE },
  wgrid({ cols: [1, 1, 1], rows: [1, 1, 1], gap: G, padding: P }, [
    { node: chip('s-q-id', 'id', BLUE), at: [0, 0] },
    { node: chip('s-q-runid', 'runId', BLUE), at: [1, 0] },
    { node: chip('s-q-active', 'isActive', BLUE), at: [2, 0] },
    { node: chip('s-q-status', 'status', BLUE), at: [0, 1] },
    { node: chip('s-q-last', 'lastProgress', BLUE), at: [1, 1] },
    { node: chip('s-q-recent', 'recentProgress', BLUE), at: [2, 1] },
    { node: chip('s-q-stop', 'stop', BLUE), at: [0, 2] },
    { node: chip('s-q-exc', 'exception', BLUE), at: [1, 2] },
    { node: chip('s-q-awaitterm', 'awaitTermination', BLUE), at: [2, 2] },
  ]),
)

const setup = container(
  { id: 's-setup', label: 'Setup', color: PURPLE },
  wgrid({ cols: [1.2, 1.1, 1.3], rows: [1], gap: 0.3, padding: P }, [
    { node: session, at: [0, 0] },
    { node: manager, at: [1, 0] },
    { node: queryHandle, at: [2, 0] },
  ]),
)

// ─── SOURCES (left I/O rail) ───────────────────────────────────────────────────

const sources = container(
  { id: 's-sources', label: 'Streaming Sources', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-src-rate', 'rate', TEAL), at: [0, 0] },
    { node: chip('s-src-ratepm', 'rate-per-microbatch', TEAL), at: [0, 1] },
    { node: chip('s-src-socket', 'socket', TEAL), at: [0, 2] },
    { node: chip('s-src-file', 'file', TEAL), at: [0, 3] },
    { node: chip('s-src-kafka', 'kafka', TEAL), at: [0, 4] },
    { node: chip('s-src-delta', 'delta', TEAL), at: [0, 5] },
  ]),
)

// ─── READ STREAM API (spark.readStream) ────────────────────────────────────────

const readFmt = container(
  { id: 's-read-fmt', label: 'Format + schema', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-r-format', 'format', BLUE), at: [0, 0] },
    { node: chip('s-r-schema', 'schema', BLUE), at: [0, 1] },
    { node: chip('s-r-option', 'option', BLUE), at: [0, 2] },
    { node: chip('s-r-load', 'load', BLUE), at: [0, 3] },
  ]),
)

const readFile = container(
  { id: 's-read-file', label: 'File options', color: YELLOW },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-r-maxfiles', 'maxFilesPerTrigger', YELLOW), at: [0, 0] },
    { node: chip('s-r-latest', 'latestFirst', YELLOW), at: [0, 1] },
    { node: chip('s-r-namelookup', 'fileNameOnly', YELLOW), at: [0, 2] },
    { node: chip('s-r-clean', 'cleanSource', YELLOW), at: [0, 3] },
    { node: chip('s-r-recurse', 'recursiveFileLookup', YELLOW), at: [0, 4] },
  ]),
)

const readKafka = container(
  { id: 's-read-kafka', label: 'Kafka options', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-r-k-boot', 'bootstrap.servers', ORANGE), at: [0, 0] },
    { node: chip('s-r-k-sub', 'subscribe', ORANGE), at: [0, 1] },
    { node: chip('s-r-k-pattern', 'subscribePattern', ORANGE), at: [0, 2] },
    { node: chip('s-r-k-assign', 'assign', ORANGE), at: [0, 3] },
    { node: chip('s-r-k-start', 'startingOffsets', ORANGE), at: [0, 4] },
    { node: chip('s-r-k-maxoff', 'maxOffsetsPerTrigger', ORANGE), at: [0, 5] },
    { node: chip('s-r-k-fail', 'failOnDataLoss', ORANGE), at: [0, 6] },
  ]),
)

const readApi = container(
  { id: 's-read', label: 'Read API  (spark.readStream)', color: BLUE },
  wgrid({ cols: [1], rows: [3, 4, 5], gap: 0.22, padding: P }, [
    { node: readFmt, at: [0, 0] },
    { node: readFile, at: [0, 1] },
    { node: readKafka, at: [0, 2] },
  ]),
)

// ─── DATAFRAME LANE (streaming) ────────────────────────────────────────────────

const dfStateless = container(
  { id: 's-df-stateless', label: 'Stateless transforms', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('s-df-t-select', 'select', GREEN), at: [0, 0] },
    { node: lbl('s-df-t-selectexpr', 'selectExpr', GREEN), at: [0, 1] },
    { node: lbl('s-df-t-filter', 'filter', GREEN), at: [0, 2] },
    { node: lbl('s-df-t-withcol', 'withColumn', GREEN), at: [0, 3] },
    { node: lbl('s-df-t-drop', 'drop', GREEN), at: [0, 4] },
    { node: lbl('s-df-t-cast', 'cast', GREEN), at: [0, 5] },
    { node: lbl('s-df-t-nadrop', 'na.drop', GREEN), at: [0, 6] },
    { node: lbl('s-df-t-nafill', 'na.fill', GREEN), at: [0, 7] },
  ]),
)

const dfWindow = container(
  { id: 's-df-window', label: 'Windows (event time)', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('s-df-w-window', 'window(col, dur)', TEAL), at: [0, 0] },
    { node: lbl('s-df-w-session', 'session_window', TEAL), at: [0, 1] },
    { node: lbl('s-df-w-tumb', 'tumbling', TEAL), at: [0, 2] },
    { node: lbl('s-df-w-slide', 'sliding', TEAL), at: [0, 3] },
    { node: lbl('s-df-w-sess', 'session', TEAL), at: [0, 4] },
  ]),
)

const dfWatermark = container(
  { id: 's-df-water', label: 'Watermark', color: RED },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('s-df-wm-fn', 'withWatermark', RED), at: [0, 0] },
    { node: lbl('s-df-wm-event', 'eventTime col', RED), at: [0, 1] },
    { node: lbl('s-df-wm-delay', 'delay', RED), at: [0, 2] },
    { node: lbl('s-df-wm-late', 'late drop', RED), at: [0, 3] },
  ]),
)

const dfState = container(
  { id: 's-df-state', label: 'Stateful ops', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('s-df-st-gbk', 'groupBy + agg', PURPLE), at: [0, 0] },
    { node: lbl('s-df-st-dedup', 'dropDuplicates', PURPLE), at: [0, 1] },
    { node: lbl('s-df-st-mgws', 'mapGroupsWithState', PURPLE), at: [0, 2] },
    { node: lbl('s-df-st-fmgws', 'flatMapGroupsWithState', PURPLE), at: [0, 3] },
    { node: lbl('s-df-st-aipws', 'applyInPandasWithState', PURPLE), at: [0, 4] },
    { node: lbl('s-df-st-gst', 'GroupStateTimeout', PURPLE), at: [0, 5] },
  ]),
)

const dfJoins = container(
  { id: 's-df-joins', label: 'Joins', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: lbl('s-df-j-static', 'stream-static', BLUE), at: [0, 0] },
    { node: lbl('s-df-j-bcast', 'broadcast(dim)', BLUE), at: [0, 1] },
    { node: lbl('s-df-j-ssi', 'stream-stream inner', BLUE), at: [0, 2] },
    { node: lbl('s-df-j-ssl', 'stream-stream left', BLUE), at: [0, 3] },
    { node: lbl('s-df-j-ssr', 'stream-stream right', BLUE), at: [0, 4] },
    { node: lbl('s-df-j-wmboth', 'watermark on both', BLUE), at: [0, 5] },
  ]),
)

const dfLane = container(
  { id: 's-df', label: 'DataFrame API (streaming)', color: ORANGE },
  wgrid({ cols: [1.3, 1.3, 1.0, 1.1, 1.1], rows: [1], gap: 0.22, padding: P }, [
    { node: dfStateless, at: [0, 0] },
    { node: dfWindow, at: [1, 0] },
    { node: dfWatermark, at: [2, 0] },
    { node: dfState, at: [3, 0] },
    { node: dfJoins, at: [4, 0] },
  ]),
)

// ─── WRITE STREAM API (df.writeStream) ──────────────────────────────────────────

const writeCore = container(
  { id: 's-w-core', label: 'Core', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-w-format', 'format', GREEN), at: [0, 0] },
    { node: chip('s-w-qname', 'queryName', GREEN), at: [0, 1] },
    { node: chip('s-w-ckpt', 'option(checkpoint)', GREEN), at: [0, 2] },
    { node: chip('s-w-trigger', 'trigger', GREEN), at: [0, 3] },
    { node: chip('s-w-partby', 'partitionBy', GREEN), at: [0, 4] },
    { node: chip('s-w-start', 'start', GREEN), at: [0, 5] },
    { node: chip('s-w-totable', 'toTable', GREEN), at: [0, 6] },
  ]),
)

const outputModes = container(
  { id: 's-outmode', label: 'Output modes', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-om-append', 'append', GREEN), at: [0, 0] },
    { node: chip('s-om-update', 'update', GREEN), at: [0, 1] },
    { node: chip('s-om-complete', 'complete', GREEN), at: [0, 2] },
  ]),
)

const writeKafka = container(
  { id: 's-w-kafka', label: 'Kafka options', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-w-k-boot', 'bootstrap.servers', ORANGE), at: [0, 0] },
    { node: chip('s-w-k-topic', 'topic', ORANGE), at: [0, 1] },
    { node: chip('s-w-k-kv', 'key/value cols', ORANGE), at: [0, 2] },
    { node: chip('s-w-k-headers', 'headers', ORANGE), at: [0, 3] },
  ]),
)

const writeApi = container(
  { id: 's-write', label: 'Write API  (df.writeStream)', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.22, padding: P }, [
    { node: writeCore, at: [0, 0] },
    { node: outputModes, at: [0, 1] },
    { node: writeKafka, at: [0, 2] },
  ]),
)

// ─── SINKS ──────────────────────────────────────────────────────────────────────

const sinks = container(
  { id: 's-sinks', label: 'Sinks', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-sink-mem', 'memory', PURPLE), at: [0, 0] },
    { node: chip('s-sink-console', 'console', PURPLE), at: [0, 1] },
    { node: chip('s-sink-file', 'file', PURPLE), at: [0, 2] },
    { node: chip('s-sink-kafka', 'kafka', PURPLE), at: [0, 3] },
    { node: chip('s-sink-delta', 'delta', PURPLE), at: [0, 4] },
    { node: chip('s-sink-fb', 'foreachBatch', PURPLE), at: [0, 5] },
    { node: chip('s-sink-fe', 'foreach', PURPLE), at: [0, 6] },
  ]),
)

// ─── OUTPUT (right I/O rail) ─────────────────────────────────────────────────────

const output = container(
  { id: 's-output', label: 'Output', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: G, padding: PT }, [
    { node: chip('s-out-mem', 'in-memory view', TEAL), at: [0, 0] },
    { node: chip('s-out-console', 'console stdout', TEAL), at: [0, 1] },
    { node: chip('s-out-files', 'Files', TEAL), at: [0, 2] },
    { node: chip('s-out-kafka', 'Kafka topic', TEAL), at: [0, 3] },
    { node: chip('s-out-delta', 'Delta table', TEAL), at: [0, 4] },
  ]),
)

// ─── PIPELINE BAND ───────────────────────────────────────────────────────────────
// sources · readApi · dfLane · writeApi · sinks · output across [2,4,14,4,2.4,2].
// Invisible wrapper (NodeMap `showChrome: false`) → group().

const pipeline = group(
  's-pipeline',
  wgrid({ cols: [2, 4, 14, 4, 2.4, 2], rows: [1], gap: 0.35, padding: 0 }, [
    { node: sources, at: [0, 0] },
    { node: readApi, at: [1, 0] },
    { node: dfLane, at: [2, 0] },
    { node: writeApi, at: [3, 0] },
    { node: sinks, at: [4, 0] },
    { node: output, at: [5, 0] },
  ]),
)

// ─── CROSS-CUTTING BAND ──────────────────────────────────────────────────────────

const triggers = container(
  { id: 's-trigger', label: 'Triggers', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: G, padding: P }, [
    { node: chip('s-tr-default', 'default', ORANGE), at: [0, 0] },
    { node: chip('s-tr-ptime', 'processingTime', ORANGE), at: [1, 0] },
    { node: chip('s-tr-once', 'once', ORANGE), at: [0, 1] },
    { node: chip('s-tr-avail', 'availableNow', ORANGE), at: [1, 1] },
    { node: chip('s-tr-cont', 'continuous', ORANGE), at: [0, 2] },
  ]),
)

const checkpoint = container(
  { id: 's-checkpoint', label: 'Checkpoint', color: BLUE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: G, padding: P }, [
    { node: chip('s-ck-offsets', 'offsets', BLUE), at: [0, 0] },
    { node: chip('s-ck-commits', 'commits', BLUE), at: [1, 0] },
    { node: chip('s-ck-state', 'state', BLUE), at: [0, 1] },
    { node: chip('s-ck-metadata', 'metadata', BLUE), at: [1, 1] },
    { node: chip('s-ck-sources', 'sources', BLUE), at: [0, 2] },
  ]),
)

const stateStore = container(
  { id: 's-statestore', label: 'State store', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: G, padding: P }, [
    { node: chip('s-ss-hdfs', 'HDFSBacked', PURPLE), at: [0, 0] },
    { node: chip('s-ss-rocks', 'RocksDB', PURPLE), at: [1, 0] },
    { node: chip('s-ss-num', 'numStateStoreInst.', PURPLE), at: [0, 1] },
    { node: chip('s-ss-metrics', 'state size / metrics', PURPLE), at: [1, 1] },
  ]),
)

const concerns = container(
  { id: 's-concerns', label: 'Streaming Concerns', color: GRAY },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.3, padding: P }, [
    { node: triggers, at: [0, 0] },
    { node: checkpoint, at: [1, 0] },
    { node: stateStore, at: [2, 0] },
  ]),
)

// ─── ROOT ─────────────────────────────────────────────────────────────────────
// Invisible outer frame (NodeMap `showChrome: false`): setup · pipeline · concerns
// stacked at the source's [2.4, 13.6, 2.4] proportions.

const root = group(
  'spark-streaming-root',
  wgrid({ cols: [1], rows: [2.4, 13.6, 2.4], gap: 0.5, padding: 0.4 }, [
    { node: setup, at: [0, 0] },
    { node: pipeline, at: [0, 1] },
    { node: concerns, at: [0, 2] },
  ]),
)

export const sparkStreaming: SceneSpec = {
  id: 'spark-streaming',
  topic: 'apache-spark',
  title: 'Apache Spark — Streaming',
  subtitle: 'Setup → sources → readStream → transforms → writeStream → sinks, plus concerns',
  // ~36:22 canvas (the source's frame) so the wide map renders close to square.
  canvas: { width: 1440, height: 880 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  // Streaming spine: Setup → sources → readStream → DataFrame → writeStream →
  // sinks → output. Calm uniform edges (no per-edge color); `label` shows HOW you
  // move between regions. The cross-cutting concerns (triggers / checkpoint /
  // state store) and the query handle read as accents into the write/df regions.
  edges: [
    { from: 's-ses-create', to: 's-sources', label: 'session' },
    { from: 's-sources', to: 's-read', label: 'spark.readStream' },
    { from: 's-read', to: 's-df', label: 'DataFrame' },
    { from: 's-df', to: 's-write', label: 'df.writeStream' },
    { from: 's-write', to: 's-sinks', label: 'start' },
    { from: 's-sinks', to: 's-output', label: 'persist' },
    { from: 's-trigger', to: 's-write', label: 'cadence' },
    { from: 's-checkpoint', to: 's-write', label: 'durable' },
    { from: 's-statestore', to: 's-df', label: 'state' },
    { from: 's-query', to: 's-write', label: 'observe' },
  ],
}
