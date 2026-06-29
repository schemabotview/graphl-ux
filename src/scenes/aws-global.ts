import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, type NodeSeed, type PatternResult, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, TEAL, YELLOW } from '../engine/colors.ts'

// AWS at 30,000 feet — ported from NodeMap's `aws-fundamentals.ts`
// (`~/Projects/NodeMap/src/data/scenes/aws-fundamentals.ts`). Two columns:
//   LEFT   the cloud "what" — Service Models (IaaS/PaaS/SaaS) over the four
//          Deployment Models (public · private · hybrid · multi-cloud), each a
//          mini-topology.
//   RIGHT  the cloud "where/how" — Connecting to AWS (three doors → one API plane)
//          over the Global Infrastructure nesting (Region ⊃ AZ ⊃ Data Center).
// This is the dense scene module 01 (Cloud & AWS Foundations) rides; the manifest
// frames one band per section via highlight/focus. Faithful transcription: same node
// ids (`awsf-*`), same colors, same weighted tracks — only the dialect changes
// (NodeMap GridNode → graphl-ux container/group/chip + native weighted grids).
//
// One deviation (shared with the docker/linux/kubernetes ports): graphl-ux pads by a
// fraction of a CELL, so a 0.3 padding on a 1-COLUMN stack becomes a huge side gutter.
// Single-column stacks use a small padding here; multi-column paddings pass through.

/** A NodeMap `term()` chip → graphl-ux `term`: a filled chip whose text IS the concept. */
const chip = (id: string, label: string, color: string, sub?: string): NodeSeed => ({ id, label, color, kind: 'term', sub })

/** Native weighted-track authoring: the grid carries relative track WEIGHTS and each
 *  child's `at` becomes its `cell`, indexing those tracks 1:1 (engine resolves arrays). */
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── BAND 1 ─ Service Models (the IaaS/PaaS/SaaS stack) ─────────────────────

const serviceStack = group(
  'awsf-svc-stack',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.14, padding: 0.04 }, [
    { node: chip('awsf-svc-saas', 'SaaS', ORANGE), at: [0, 0] },
    { node: chip('awsf-svc-paas', 'PaaS', ORANGE), at: [0, 1] },
    { node: chip('awsf-svc-iaas', 'IaaS', ORANGE), at: [0, 2] },
  ]),
)

const serviceModels = container(
  { id: 'awsf-service-models', label: 'Service Models', color: TEAL },
  wgrid({ cols: [1, 1.4], rows: [1], gap: 0.28, padding: 0.3 }, [
    { node: chip('awsf-svc-you', 'You', BLUE), at: [0, 0] },
    { node: serviceStack, at: [1, 0] },
  ]),
)

// ─── BAND 2 ─ Deployment Models (2×2 of mini-topologies) ────────────────────

const publicCell = container(
  { id: 'awsf-dep-public', label: 'Public', color: BLUE },
  wgrid({ cols: [1, 2.6], rows: [1], gap: 0.3, padding: 0.28 }, [
    { node: chip('awsf-pub-you', 'You', BLUE), at: [0, 0] },
    {
      node: container(
        { id: 'awsf-pub-cloud', label: 'AWS Cloud', color: ORANGE },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.18, padding: 0.25 }, [
          { node: chip('awsf-pub-srv', 'Servers', ORANGE), at: [0, 0] },
          { node: chip('awsf-pub-stg', 'Storage', ORANGE), at: [1, 0] },
          { node: chip('awsf-pub-db', 'Databases', ORANGE), at: [0, 1] },
          { node: chip('awsf-pub-app', 'Apps', ORANGE), at: [1, 1] },
        ]),
      ),
      at: [1, 0],
    },
  ]),
)

const privateCell = container(
  { id: 'awsf-dep-private', label: 'Private (single-tenant)', color: GRAY },
  wgrid({ cols: [1, 2.6], rows: [1], gap: 0.3, padding: 0.28 }, [
    { node: chip('awsf-priv-you', 'You', BLUE), at: [0, 0] },
    {
      node: group(
        'awsf-priv-flavors',
        wgrid({ cols: [1], rows: [1, 1], gap: 0.2, padding: 0.04 }, [
          { node: chip('awsf-priv-onprem', 'Outposts', ORANGE), at: [0, 0] },
          { node: chip('awsf-priv-dedicated', 'AWS Dedicated Hosts', ORANGE), at: [0, 1] },
        ]),
      ),
      at: [1, 0],
    },
  ]),
)

const hybridCell = container(
  { id: 'awsf-dep-hybrid', label: 'Hybrid', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.6, padding: 0.32 }, [
    { node: chip('awsf-hyb-onprem', 'On-Prem', GRAY), at: [0, 0] },
    { node: chip('awsf-hyb-aws', 'AWS', ORANGE), at: [1, 0] },
  ]),
)

const multiCloudStack = group(
  'awsf-mc-stack',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.14, padding: 0.04 }, [
    { node: chip('awsf-mc-aws', 'AWS', ORANGE), at: [0, 0] },
    { node: chip('awsf-mc-gcp', 'GCP', BLUE), at: [0, 1] },
    { node: chip('awsf-mc-azure', 'Azure', TEAL), at: [0, 2] },
  ]),
)

const multiCloudCell = container(
  { id: 'awsf-dep-multi', label: 'Multi-cloud', color: PURPLE },
  wgrid({ cols: [1, 1.5], rows: [1], gap: 0.32, padding: 0.32 }, [
    { node: chip('awsf-mc-you', 'You', BLUE), at: [0, 0] },
    { node: multiCloudStack, at: [1, 0] },
  ]),
)

const deploymentModels = container(
  { id: 'awsf-deployment-models', label: 'Deployment Models', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.45, padding: 0.38 }, [
    { node: publicCell, at: [0, 0] },
    { node: privateCell, at: [1, 0] },
    { node: hybridCell, at: [0, 1] },
    { node: multiCloudCell, at: [1, 1] },
  ]),
)

// ─── BAND 3 ─ Connecting to AWS (three doors, one API plane) ────────────────

const doors = group(
  'awsf-conn-doors',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.14, padding: 0.04 }, [
    { node: chip('awsf-conn-console', 'Console', YELLOW), at: [0, 0] },
    { node: chip('awsf-conn-cli', 'CLI', YELLOW), at: [0, 1] },
    { node: chip('awsf-conn-sdk', 'SDK', YELLOW), at: [0, 2] },
  ]),
)

const connecting = container(
  { id: 'awsf-connecting', label: 'Connecting to AWS', color: YELLOW },
  wgrid({ cols: [1, 1.2, 1], rows: [1], gap: 0.3, padding: 0.3 }, [
    { node: chip('awsf-conn-you', 'You / App', BLUE), at: [0, 0] },
    { node: doors, at: [1, 0] },
    { node: chip('awsf-conn-apis', 'AWS APIs', ORANGE), at: [2, 0] },
  ]),
)

// ─── BAND 4 ─ Global Infrastructure (Region ⊃ AZ ⊃ Data Center) ─────────────

const dc = (id: string, color: string): NodeSeed =>
  container(
    { id, label: 'DC', color },
    wgrid({ cols: [1], rows: [1, 1], gap: 0.18, padding: 0.06 }, [
      { node: chip(`${id}-srv`, 'Servers', ORANGE), at: [0, 0] },
      { node: chip(`${id}-stg`, 'Storage', ORANGE), at: [0, 1] },
    ]),
  )

const azA = container(
  { id: 'awsf-az-a', label: 'AZ ap-southeast-1a', color: TEAL },
  wgrid({ cols: [1], rows: [1], gap: 0.18, padding: 0.08 }, [{ node: dc('awsf-az-a-dc1', GRAY), at: [0, 0] }]),
)

const azB = container(
  { id: 'awsf-az-b', label: 'AZ ap-southeast-1b', color: TEAL },
  wgrid({ cols: [1], rows: [1], gap: 0.18, padding: 0.08 }, [{ node: dc('awsf-az-b-dc1', GRAY), at: [0, 0] }]),
)

const azC = container(
  { id: 'awsf-az-c', label: 'AZ ap-southeast-1c', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.18, padding: 0.25 }, [
    { node: dc('awsf-az-c-dc1', GRAY), at: [0, 0] },
    { node: dc('awsf-az-c-dc2', GRAY), at: [1, 0] },
  ]),
)

const region = container(
  { id: 'awsf-region', label: 'Region ap-southeast-1 (Singapore)', color: GREEN },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.3, padding: 0.32 }, [
    { node: azA, at: [0, 0] },
    { node: azB, at: [1, 0] },
    { node: azC, at: [0, 1, 2, 1] },
  ]),
)

const globalInfra = container(
  { id: 'awsf-global-infra', label: 'Global Infrastructure', color: GREEN },
  wgrid({ cols: [1], rows: [1], gap: 0.2, padding: 0.1 }, [{ node: region, at: [0, 0] }]),
)

// ─── COLUMNS ────────────────────────────────────────────────────────────────

const leftCol = group(
  'awsf-left',
  wgrid({ cols: [1], rows: [3, 9], gap: 0.45, padding: 0.02 }, [
    { node: serviceModels, at: [0, 0] },
    { node: deploymentModels, at: [0, 1] },
  ]),
)

const rightCol = group(
  'awsf-right',
  wgrid({ cols: [1], rows: [3, 9], gap: 0.45, padding: 0.02 }, [
    { node: connecting, at: [0, 0] },
    { node: globalInfra, at: [0, 1] },
  ]),
)

const root: SceneNodeSpec = group(
  'awsf-root',
  wgrid({ cols: [1, 1], rows: [1], gap: 0.14, padding: 0.04 }, [
    { node: leftCol, at: [0, 0] },
    { node: rightCol, at: [1, 0] },
  ]),
)

export const awsGlobal: SceneSpec = {
  id: 'aws-global',
  topic: 'aws',
  title: 'AWS Foundations — the cloud, end to end',
  subtitle: 'service models · deployment models · connecting to AWS · global infrastructure',
  // The source map's 26×14 frame (≈1.86:1).
  canvas: { width: 1456, height: 784 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // Service Models — You fans into the stack
    { from: 'awsf-svc-you', to: 'awsf-svc-saas', color: BLUE },
    { from: 'awsf-svc-you', to: 'awsf-svc-paas', color: BLUE },
    { from: 'awsf-svc-you', to: 'awsf-svc-iaas', color: BLUE },

    // Deployment Models — each cell's defining topology
    { from: 'awsf-pub-you', to: 'awsf-pub-cloud', label: 'Internet', color: ORANGE },
    { from: 'awsf-priv-you', to: 'awsf-priv-onprem', label: 'Corp network', color: GRAY },
    { from: 'awsf-priv-you', to: 'awsf-priv-dedicated', label: 'Direct Connect', color: ORANGE },
    { from: 'awsf-hyb-onprem', to: 'awsf-hyb-aws', label: 'VPN / Direct Connect', color: PURPLE },
    { from: 'awsf-mc-you', to: 'awsf-mc-aws', color: ORANGE },
    { from: 'awsf-mc-you', to: 'awsf-mc-gcp', color: BLUE },
    { from: 'awsf-mc-you', to: 'awsf-mc-azure', color: TEAL },

    // Connecting to AWS — three doors, one API plane
    { from: 'awsf-conn-you', to: 'awsf-conn-console', color: BLUE },
    { from: 'awsf-conn-you', to: 'awsf-conn-cli', color: BLUE },
    { from: 'awsf-conn-you', to: 'awsf-conn-sdk', color: BLUE },
    { from: 'awsf-conn-console', to: 'awsf-conn-apis', label: 'HTTPS', color: ORANGE },
    { from: 'awsf-conn-cli', to: 'awsf-conn-apis', label: 'HTTPS', color: ORANGE },
    { from: 'awsf-conn-sdk', to: 'awsf-conn-apis', label: 'HTTPS', color: ORANGE },
  ],
}
