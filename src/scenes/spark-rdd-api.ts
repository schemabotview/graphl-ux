import type { SceneSpec } from '../engine/types.ts'
import { columns, group, section, stack } from '../engine/patterns.ts'
import { GREEN, ORANGE, PURPLE, RED, TEAL } from '../engine/colors.ts'

const creation = section(
  { id: 'rdd-create', label: 'Create', color: RED, sub: 'get an RDD' },
  [
    [
      { id: 'rdd-parallelize', label: 'parallelize' },
      { id: 'rdd-textfile', label: 'textFile' },
    ],
    [
      { id: 'rdd-wholetext', label: 'wholeTextFiles' },
      { id: 'rdd-numslices', label: 'numSlices' },
    ],
  ],
  { padding: 0.2 },
)

const narrow = section(
  { id: 'rdd-narrow', label: 'Narrow', color: GREEN, sub: 'no shuffle' },
  [
    [{ id: 'rdd-map', label: 'map' }],
    [{ id: 'rdd-mappart', label: 'mapPartitions' }],
    [{ id: 'rdd-flatmap', label: 'flatMap' }],
    [{ id: 'rdd-filter', label: 'filter' }],
    [{ id: 'rdd-repartition', label: 'repartition' }],
    [{ id: 'rdd-coalesce', label: 'coalesce' }],
  ],
  { padding: 0.18 },
)

const wide = section(
  { id: 'rdd-wide', label: 'Wide', color: TEAL, sub: 'shuffle' },
  [
    [{ id: 'rdd-union', label: 'union' }],
    [{ id: 'rdd-distinct', label: 'distinct' }],
    [{ id: 'rdd-intersection', label: 'intersection' }],
    [{ id: 'rdd-sortby', label: 'sortBy' }],
    [{ id: 'rdd-subtract', label: 'subtract' }],
    [{ id: 'rdd-join', label: 'join' }],
    [{ id: 'rdd-cartesian', label: 'cartesian' }],
    [{ id: 'rdd-cogroup', label: 'cogroup' }],
  ],
  { padding: 0.18 },
)

const pair = section(
  { id: 'rdd-pair', label: 'Pair RDD · byKey', color: PURPLE, sub: 'key / value' },
  [
    [{ id: 'rdd-maptopair', label: 'mapToPair' }],
    [{ id: 'rdd-reducebykey', label: 'reduceByKey' }],
    [{ id: 'rdd-groupbykey', label: 'groupByKey' }],
    [{ id: 'rdd-aggbykey', label: 'aggregateByKey' }],
    [{ id: 'rdd-foldbykey', label: 'foldByKey' }],
    [{ id: 'rdd-combinebykey', label: 'combineByKey' }],
    [{ id: 'rdd-countbykey', label: 'countByKey' }],
    [{ id: 'rdd-samplebykey', label: 'sampleByKey' }],
  ],
  { padding: 0.18 },
)

const actions = section(
  { id: 'rdd-actions', label: 'Actions · Misc', color: ORANGE, sub: 'trigger the job' },
  [
    [
      { id: 'rdd-collect', label: 'collect' },
      { id: 'rdd-count', label: 'count' },
      { id: 'rdd-take', label: 'take' },
      { id: 'rdd-first', label: 'first' },
    ],
    [
      { id: 'rdd-reduce', label: 'reduce' },
      { id: 'rdd-fold', label: 'fold' },
      { id: 'rdd-aggregate', label: 'aggregate' },
    ],
    [
      { id: 'rdd-savetext', label: 'saveAsTextFile' },
      { id: 'rdd-broadcast', label: 'broadcast' },
      { id: 'rdd-accumulator', label: 'accumulator' },
    ],
  ],
  { padding: 0.18 },
)

const transforms = group('rdd-transforms', columns([[narrow], [wide], [pair]], { tight: true }), {
  padding: 0,
})

const layout = stack(
  [
    { node: creation, rows: 2 },
    { node: transforms, rows: 7 },
    { node: actions, rows: 3 },
  ],
  { gap: 0.3, padding: 0.5 },
)

export const sparkRddApi: SceneSpec = {
  id: 'spark-rdd-api',
  topic: 'apache-spark',
  title: 'RDD API — create / transform / act',
  ...layout,
  edges: [
    { from: 'rdd-create', to: 'rdd-narrow' },
    { from: 'rdd-create', to: 'rdd-wide' },
    { from: 'rdd-create', to: 'rdd-pair' },
    { from: 'rdd-narrow', to: 'rdd-actions' },
    { from: 'rdd-wide', to: 'rdd-actions' },
    { from: 'rdd-pair', to: 'rdd-actions' },
  ],
}
