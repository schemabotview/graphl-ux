import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// The SQL concept on ONE wide map — a faithful port of NodeMap's `sql.ts`
// (tree + connections) into a SceneSpec (nodes + edges). The layout itself is the
// lesson: DDL mutates the catalog (metadata), the catalog describes storage (data),
// the query pipeline scans storage in logical-execution order, set ops compose
// pipeline outputs, and the transaction box wraps the write DML that closes the
// loop back to storage. Shared across all eight sql-content modules via that repo's
// manifest; the camera frames one subsystem (a clause, the join box, the catalog,
// the transaction box) per section. Calm filled style throughout (DESIGN.md).
//
// Semantic hues here are memory cues, reused from the engine palette: DDL=orange,
// catalog=blue, storage=gray, transactions/isolation=purple, write DML=red,
// pipeline=green, modifiers (CTE/window)=yellow, joins + set ops=teal.

// Native weighted-track authoring: the grid carries relative track WEIGHTS and each
// child's `at` becomes its `cell`, indexing those tracks 1:1 (see dsa.ts / java-jvm.ts).
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// A filled value chip whose text IS the concept (a keyword / clause / option).
const term = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

// =============== DDL — metadata mutators ===============
const ddlBox: SceneNodeSpec = container(
  { id: 'sql-ddl', label: 'DDL — Metadata', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: 0.2, padding: 0.35 }, [
    { node: term('sql-create-table', 'CREATE TABLE', ORANGE), at: [0, 0] },
    { node: term('sql-alter-table', 'ALTER TABLE', ORANGE), at: [1, 0] },
    { node: term('sql-drop-table', 'DROP TABLE', ORANGE), at: [0, 1] },
    { node: term('sql-truncate', 'TRUNCATE', ORANGE), at: [1, 1] },
    { node: term('sql-create-index', 'CREATE INDEX', ORANGE), at: [0, 2] },
    { node: term('sql-create-view', 'CREATE VIEW', ORANGE), at: [1, 2] },
    { node: term('sql-rename', 'RENAME', ORANGE), at: [0, 3, 2, 1] },
  ]),
)

// =============== Catalog — the metadata tree ===============
const constraintsBox: SceneNodeSpec = container(
  { id: 'sql-constraints', label: 'Constraints', color: BLUE },
  wgrid({ cols: [1, 1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.25 }, [
    { node: term('sql-pk', 'PK', BLUE), at: [0, 0] },
    { node: term('sql-fk', 'FK', BLUE), at: [1, 0] },
    { node: term('sql-not-null', 'NOT NULL', BLUE), at: [2, 0] },
    { node: term('sql-unique', 'UNIQUE', BLUE), at: [3, 0] },
    { node: term('sql-check', 'CHECK', BLUE), at: [4, 0] },
  ]),
)

const tableBox: SceneNodeSpec = container(
  { id: 'sql-table', label: 'Table', color: BLUE },
  wgrid({ cols: [1, 1], rows: [1, 2, 1], gap: 0.2, padding: 0.3 }, [
    { node: term('sql-columns', 'Columns', BLUE), at: [0, 0] },
    { node: term('sql-indexes', 'Indexes', BLUE), at: [1, 0] },
    { node: constraintsBox, at: [0, 1, 2, 1] },
    { node: term('sql-views', 'Views', BLUE), at: [0, 2, 2, 1] },
  ]),
)

const catalogBox: SceneNodeSpec = container(
  { id: 'sql-catalog', label: 'Catalog — Metadata', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1, 5], gap: 0.2, padding: 0.3 }, [
    { node: term('sql-database', 'Database', BLUE), at: [0, 0] },
    { node: term('sql-schema', 'Schema', BLUE), at: [0, 1] },
    { node: tableBox, at: [0, 2] },
  ]),
)

// =============== Storage — the data layout ===============
const storageBox: SceneNodeSpec = container(
  { id: 'sql-storage', label: 'Storage — Data', color: GRAY },
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.35 }, [
    { node: term('sql-tablespace', 'Tablespace', GRAY), at: [0, 0] },
    { node: term('sql-pages', 'Pages', GRAY), at: [1, 0] },
    { node: term('sql-rows', 'Rows', GRAY), at: [2, 0] },
    { node: term('sql-wal', 'WAL', GRAY), at: [3, 0] },
  ]),
)

// =============== Transactions — wrapping the write DML ===============
const writeDmlBox: SceneNodeSpec = container(
  { id: 'sql-write-dml', label: 'Write DML', color: RED },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.3 }, [
    { node: term('sql-insert', 'INSERT', RED), at: [0, 0] },
    { node: term('sql-update', 'UPDATE', RED), at: [1, 0] },
    { node: term('sql-delete', 'DELETE', RED), at: [0, 1] },
    { node: term('sql-merge', 'MERGE', RED), at: [1, 1] },
  ]),
)

const isolationBox: SceneNodeSpec = container(
  { id: 'sql-isolation', label: 'Isolation Levels', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.25 }, [
    { node: term('sql-read-uncommitted', 'READ UNCOMMITTED', PURPLE), at: [0, 0] },
    { node: term('sql-read-committed', 'READ COMMITTED', PURPLE), at: [1, 0] },
    { node: term('sql-repeatable-read', 'REPEATABLE READ', PURPLE), at: [0, 1] },
    { node: term('sql-serializable', 'SERIALIZABLE', PURPLE), at: [1, 1] },
  ]),
)

const transactionsBox: SceneNodeSpec = container(
  { id: 'sql-transactions', label: 'Transactions', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 4, 1, 2], gap: 0.2, padding: 0.3 }, [
    { node: term('sql-begin', 'BEGIN', PURPLE), at: [0, 0, 2, 1] },
    { node: writeDmlBox, at: [0, 1, 2, 1] },
    { node: term('sql-commit', 'COMMIT', PURPLE), at: [0, 2] },
    { node: term('sql-rollback', 'ROLLBACK', PURPLE), at: [1, 2] },
    { node: isolationBox, at: [0, 3, 2, 1] },
  ]),
)

// =============== Query pipeline — logical execution order ===============
const joinBox: SceneNodeSpec = container(
  { id: 'sql-join', label: 'JOIN', color: TEAL },
  wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
    { node: term('sql-inner-join', 'INNER', TEAL), at: [0, 0] },
    { node: term('sql-left-join', 'LEFT', TEAL), at: [1, 0] },
    { node: term('sql-right-join', 'RIGHT', TEAL), at: [2, 0] },
    { node: term('sql-full-outer-join', 'FULL OUTER', TEAL), at: [0, 1] },
    { node: term('sql-cross-join', 'CROSS', TEAL), at: [1, 1] },
    { node: term('sql-self-join', 'SELF', TEAL), at: [2, 1] },
  ]),
)

const pipelineBox: SceneNodeSpec = container(
  { id: 'sql-pipeline', label: 'Query Pipeline (logical execution order)', color: GREEN },
  // The bottom band is 3 rows (pad · clause · pad): the single-chip clauses sit in
  // the MIDDLE row so they render as compact chips (a node fills its cell, so a tall
  // cell would stretch them), while JOIN spans all three rows to stay a 2×3 box. The
  // pad rows vertically center the clauses on JOIN's middle, where the flow enters.
  wgrid({ cols: [1, 3, 1, 1, 1, 1, 1, 1, 1], rows: [1.2, 0.7, 1, 0.7], gap: 0.2, padding: 0.3 }, [
    { node: term('sql-cte', 'CTE / Subquery', YELLOW), at: [0, 0] },
    { node: term('sql-window', 'Window Functions', YELLOW), at: [5, 0] },
    { node: term('sql-from', 'FROM', GREEN), at: [0, 2] },
    { node: joinBox, at: [1, 1, 1, 3] },
    { node: term('sql-where', 'WHERE', GREEN), at: [2, 2] },
    { node: term('sql-group-by', 'GROUP BY', GREEN), at: [3, 2] },
    { node: term('sql-having', 'HAVING', GREEN), at: [4, 2] },
    { node: term('sql-select', 'SELECT', GREEN), at: [5, 2] },
    { node: term('sql-distinct', 'DISTINCT', GREEN), at: [6, 2] },
    { node: term('sql-order-by', 'ORDER BY', GREEN), at: [7, 2] },
    { node: term('sql-limit', 'LIMIT', GREEN), at: [8, 2] },
  ]),
)

// =============== Set operations ===============
const setOpsBox: SceneNodeSpec = container(
  { id: 'sql-set-ops', label: 'Set Operations', color: TEAL },
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.35 }, [
    { node: term('sql-union', 'UNION', TEAL), at: [0, 0] },
    { node: term('sql-union-all', 'UNION ALL', TEAL), at: [1, 0] },
    { node: term('sql-intersect', 'INTERSECT', TEAL), at: [2, 0] },
    { node: term('sql-except', 'EXCEPT', TEAL), at: [3, 0] },
  ]),
)

// =============== ROOT ===============
// Three macro columns over two bands, then two full-width bands below (faithful to
// the NodeMap weighted grid cols:[7,9,7] rows:[5,2,6,2]): DDL spans the left two
// rows; catalog (row 0) over storage (row 1) in the middle; transactions spans the
// right two rows; the query pipeline and set operations run full-width underneath.
const root = group(
  'sql-scene-root',
  wgrid({ cols: [7, 9, 7], rows: [5, 2, 6, 2], gap: 0.4, padding: 0.4 }, [
    { node: ddlBox, at: [0, 0, 1, 2] },
    { node: catalogBox, at: [1, 0] },
    { node: storageBox, at: [1, 1] },
    { node: transactionsBox, at: [2, 0, 1, 2] },
    { node: pipelineBox, at: [0, 2, 3, 1] },
    { node: setOpsBox, at: [0, 3, 3, 1] },
  ]),
)

export const sql: SceneSpec = {
  id: 'sql',
  topic: 'sql',
  title: 'SQL — the relational query language',
  subtitle: 'Metadata ▸ storage ▸ the query pipeline ▸ transactions',
  // Landscape map; grid aspect ≈ 23:15, so the canvas matches to keep cells square.
  canvas: { width: 1536, height: 1000 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.04 },
  nodes: [root],
  edges: [
    // DDL → Catalog (mutate metadata — collapsed to the catalog box to keep arrows
    // clean; the inner tree already shows what kind of metadata exists).
    { from: 'sql-create-table', to: 'sql-catalog', label: 'creates', color: ORANGE },
    { from: 'sql-alter-table', to: 'sql-catalog', label: 'modifies', color: ORANGE },
    { from: 'sql-drop-table', to: 'sql-catalog', label: 'drops', color: ORANGE },
    { from: 'sql-create-index', to: 'sql-catalog', label: 'adds', color: ORANGE },
    { from: 'sql-create-view', to: 'sql-catalog', label: 'defines', color: ORANGE },

    // DDL → Storage (truncate empties data only — the catalog entry stays).
    { from: 'sql-truncate', to: 'sql-rows', label: 'empties', color: ORANGE },

    // Catalog → Storage (metadata describes the data layout).
    { from: 'sql-table', to: 'sql-storage', label: 'schema for', color: BLUE },

    // Storage → Pipeline (FROM scans rows from storage).
    { from: 'sql-rows', to: 'sql-from', label: 'scan', color: GRAY },

    // Pipeline chain — logical execution order (NOT written order).
    { from: 'sql-from', to: 'sql-join', label: 'rows', color: GREEN },
    { from: 'sql-join', to: 'sql-where', label: 'joined rows', color: GREEN },
    { from: 'sql-where', to: 'sql-group-by', label: 'filter rows', color: GREEN },
    { from: 'sql-group-by', to: 'sql-having', label: 'groups', color: GREEN },
    { from: 'sql-having', to: 'sql-select', label: 'filter groups', color: GREEN },
    { from: 'sql-select', to: 'sql-distinct', label: 'project', color: GREEN },
    { from: 'sql-distinct', to: 'sql-order-by', label: 'dedupe', color: GREEN },
    { from: 'sql-order-by', to: 'sql-limit', label: 'sort', color: GREEN },

    // Modifiers feed into the chain.
    { from: 'sql-cte', to: 'sql-from', label: 'WITH', color: YELLOW },
    { from: 'sql-window', to: 'sql-select', label: 'OVER()', color: YELLOW },

    // Set ops compose pipeline outputs.
    { from: 'sql-select', to: 'sql-union', label: 'compose', color: TEAL },

    // Write DML → Storage (closes the loop: writes mutate the same rows FROM scans).
    { from: 'sql-insert', to: 'sql-rows', label: 'writes', color: RED },
    { from: 'sql-update', to: 'sql-rows', label: 'modifies', color: RED },
    { from: 'sql-delete', to: 'sql-rows', label: 'removes', color: RED },
    { from: 'sql-merge', to: 'sql-rows', label: 'upsert', color: RED },
  ],
}
