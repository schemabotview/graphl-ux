import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, type NodeSeed, type PatternResult, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, TEAL } from '../engine/colors.ts'

// AWS data-engineering pipeline — ported from the "Region B" slice of NodeMap's `aws.ts`
// (`~/Projects/NodeMap/src/data/scenes/aws.ts`, `regionB`). The lake-house pipeline,
// left → right:
//   Ingest (Kinesis · MSK · Firehose) → Data Lake (S3 raw/curated/serving · Glacier) →
//   Process / Orchestrate (Glue · EMR · Lambda · Step Functions) → Query / BI
//   (Athena · Redshift · QuickSight · OpenSearch).
// This is the dense scene modules 09 (NoSQL & Analytics) and 10 (Integration & Streaming)
// ride; the manifest frames one stage per section via highlight/focus. Faithful node ids
// (`kinesis-streams`, `s3-raw`, `glue`, `athena`, …), colors, and edges from the source.
//
// One layout adaptation (vs. a strict transcription): the source stacked the four stages
// in ONE vertical column inside the big AWS map. As a standalone 16:9 scene that column is
// too tall/narrow, so the four stages are laid LEFT→RIGHT (each stage stacks its services
// vertically) — per DESIGN's "let deep pipeline flows breathe across the width". Same
// nodes, same wiring; only the axis changes.

/** A NodeMap bare titled leaf → graphl-ux `symbol`: glyph + label. */
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── STAGE 1 — Ingest ───────────────────────────────────────────────────────

const ingestBox = container(
  { id: 'ingest', label: 'Ingest', color: TEAL },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.22, padding: 0.1 }, [
    { node: comp('kinesis-streams', 'Kinesis Streams', TEAL), at: [0, 0] },
    { node: comp('msk', 'MSK (Kafka)', TEAL), at: [0, 1] },
    { node: comp('firehose', 'Firehose', TEAL), at: [0, 2] },
  ]),
)

// ─── STAGE 2 — Data Lake (S3 zones) ─────────────────────────────────────────

const lakeBox = container(
  { id: 'lake', label: 'Data Lake (S3 zones)', color: GREEN },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.18, padding: 0.1 }, [
    { node: comp('s3-raw', 'S3 raw', GREEN), at: [0, 0] },
    { node: comp('s3-curated', 'S3 curated', GREEN), at: [0, 1] },
    { node: comp('s3-serving', 'S3 serving', GREEN), at: [0, 2] },
    { node: comp('glacier', 'Glacier', BLUE), at: [0, 3] },
  ]),
)

// ─── STAGE 3 — Process / Orchestrate ────────────────────────────────────────

const processBox = container(
  { id: 'process', label: 'Process / Orchestrate', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.18, padding: 0.1 }, [
    { node: comp('glue', 'Glue', PURPLE), at: [0, 0] },
    { node: comp('emr', 'EMR', TEAL), at: [0, 1] },
    { node: comp('lambda-rb', 'Lambda', ORANGE), at: [0, 2] },
    { node: comp('stepfn-b', 'Step Func', PURPLE), at: [0, 3] },
  ]),
)

// ─── STAGE 4 — Query / BI ───────────────────────────────────────────────────

const queryBox = container(
  { id: 'query', label: 'Query / BI', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.18, padding: 0.1 }, [
    { node: comp('athena', 'Athena', ORANGE), at: [0, 0] },
    { node: comp('redshift', 'Redshift', BLUE), at: [0, 1] },
    { node: comp('quicksight', 'QuickSight', PURPLE), at: [0, 2] },
    { node: comp('opensearch', 'OpenSearch', TEAL), at: [0, 3] },
  ]),
)

// ─── ROOT — four stages, left → right ───────────────────────────────────────

const root: SceneNodeSpec = group(
  'aws-data-eng-root',
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.4, padding: 0.04 }, [
    { node: ingestBox, at: [0, 0] },
    { node: lakeBox, at: [1, 0] },
    { node: processBox, at: [2, 0] },
    { node: queryBox, at: [3, 0] },
  ]),
)

export const awsDataEngineering: SceneSpec = {
  id: 'aws-data-engineering',
  topic: 'aws',
  title: 'AWS Data Engineering — the lake-house pipeline',
  subtitle: 'Ingest → Data Lake (S3 zones) → Process / Orchestrate → Query / BI',
  canvas: { width: 1456, height: 819 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // In-stage flows
    { from: 'kinesis-streams', to: 'firehose', label: 'deliver', color: TEAL },
    { from: 's3-curated', to: 's3-serving', label: 'aggregate', color: GREEN },
    { from: 's3-raw', to: 'glacier', label: 'lifecycle >6mo', color: GRAY },
    { from: 'stepfn-b', to: 'glue', label: 'orchestrate', color: PURPLE },
    { from: 'redshift', to: 'quicksight', label: 'BI query', color: PURPLE },

    // Stage → stage (the pipeline)
    { from: 'ingest', to: 'lake', label: 'write batch', color: TEAL },
    { from: 'ingest', to: 'process', label: 'consume', color: TEAL },
    { from: 'lake', to: 'process', label: 'crawl', color: PURPLE },
    { from: 'process', to: 'lake', label: 'transform', color: PURPLE },
    { from: 'lake', to: 'query', label: 'SQL / load', color: ORANGE },
  ],
}
