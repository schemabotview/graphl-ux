import type { SceneSpec } from '../engine/types.ts'
import { columns, container, group, rows, section, stack } from '../engine/patterns.ts'
import { GREEN, RED, TEAL } from '../engine/colors.ts'

const narrow = container(
  { id: 'nw-narrow', label: 'Narrow', color: TEAL, sub: 'no shuffle · one stage' },
  rows(
    [
      [
        { id: 'nw-ni0', label: 'P0', color: GREEN, kind: 'term' },
        { id: 'nw-ni1', label: 'P1', color: GREEN, kind: 'term' },
        { id: 'nw-ni2', label: 'P2', color: GREEN, kind: 'term' },
      ],
      [
        { id: 'nw-no0', label: 'P0', color: GREEN, kind: 'term' },
        { id: 'nw-no1', label: 'P1', color: GREEN, kind: 'term' },
        { id: 'nw-no2', label: 'P2', color: GREEN, kind: 'term' },
      ],
    ],
    { tight: true },
  ),
  { padding: 0.16 },
)

const wide = container(
  { id: 'nw-wide', label: 'Wide', color: RED, sub: 'shuffle · new stage' },
  rows(
    [
      [
        { id: 'nw-wi0', label: 'P0', color: GREEN, kind: 'term' },
        { id: 'nw-wi1', label: 'P1', color: GREEN, kind: 'term' },
        { id: 'nw-wi2', label: 'P2', color: GREEN, kind: 'term' },
      ],
      [
        { id: 'nw-wo0', label: 'P0', color: GREEN, kind: 'term' },
        { id: 'nw-wo1', label: 'P1', color: GREEN, kind: 'term' },
        { id: 'nw-wo2', label: 'P2', color: GREEN, kind: 'term' },
      ],
    ],
    { tight: true },
  ),
  { padding: 0.16 },
)

const panels = group('nw-panels', columns([[narrow], [wide]], { tight: true }), { padding: 0 })

const narrowOps = section(
  { id: 'nw-narrow-ops', label: 'Narrow ops', color: TEAL, sub: 'pipeline together' },
  [
    [{ id: 'nw-map', label: 'map' }, { id: 'nw-filter', label: 'filter' }],
    [{ id: 'nw-flatmap', label: 'flatMap' }, { id: 'nw-mappart', label: 'mapPartitions' }],
    [{ id: 'nw-union', label: 'union' }],
  ],
  { padding: 0.18 },
)

const wideOps = section(
  { id: 'nw-wide-ops', label: 'Wide ops', color: RED, sub: 'force a shuffle' },
  [
    [{ id: 'nw-reducebykey', label: 'reduceByKey' }, { id: 'nw-groupbykey', label: 'groupByKey' }],
    [{ id: 'nw-join', label: 'join' }, { id: 'nw-distinct', label: 'distinct' }],
    [{ id: 'nw-repartition', label: 'repartition' }],
  ],
  { padding: 0.18 },
)

const ops = group('nw-ops', columns([[narrowOps], [wideOps]], { tight: true }), { padding: 0 })

const layout = stack(
  [
    { node: panels, rows: 5 },
    { node: ops, rows: 4 },
  ],
  { gap: 0.3, padding: 0.5 },
)

export const sparkRddNarrowWide: SceneSpec = {
  id: 'rdd-narrow-wide',
  topic: 'apache-spark',
  title: 'Narrow vs wide transformations',
  ...layout,
  edges: [
    { from: 'nw-ni0', to: 'nw-no0' },
    { from: 'nw-ni1', to: 'nw-no1' },
    { from: 'nw-ni2', to: 'nw-no2' },
    { from: 'nw-wi0', to: 'nw-wo0' },
    { from: 'nw-wi1', to: 'nw-wo0' },
    { from: 'nw-wi2', to: 'nw-wo0' },
    { from: 'nw-wi0', to: 'nw-wo1' },
    { from: 'nw-wi0', to: 'nw-wo2' },
  ],
}
