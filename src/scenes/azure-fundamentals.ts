import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, type NodeSeed, type PatternResult, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, TEAL, YELLOW } from '../engine/colors.ts'

// Azure at 30,000 feet — ported from NodeMap's `azure-fundamentals.ts`
// (`~/Projects/NodeMap/src/data/scenes/azure-fundamentals.ts`). Two columns:
//   LEFT   the cloud "what" — Service Models (IaaS/PaaS/SaaS) over the four
//          Deployment Models (public · private · hybrid · multi-cloud), each a
//          mini-topology.
//   RIGHT  the cloud "where/how" — Connecting to Azure (three doors → one ARM API
//          plane) over the Global Infrastructure nesting (Geography ⊃ Region ⊃
//          Zone ⊃ Data Center).
// This is the dense scene module 01 (Cloud & Azure Foundations) rides; the manifest
// frames one band per section via highlight/focus. Faithful transcription: same node
// ids (`azf-*`), same colors, same weighted tracks — only the dialect changes
// (NodeMap GridNode → graphl-ux container/group/chip + native weighted grids).
//
// One deviation (shared with the aws/docker/linux/kubernetes ports): graphl-ux pads by
// a fraction of a CELL, so a 0.3 padding on a 1-COLUMN stack becomes a huge side gutter.
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
  'azf-svc-stack',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.14, padding: 0.04 }, [
    { node: chip('azf-svc-saas', 'SaaS', ORANGE, 'software'), at: [0, 0] },
    { node: chip('azf-svc-paas', 'PaaS', ORANGE, 'OS + runtime'), at: [0, 1] },
    { node: chip('azf-svc-iaas', 'IaaS', ORANGE, 'hardware'), at: [0, 2] },
  ]),
)

const serviceModels = container(
  { id: 'azf-service-models', label: 'Service Models', color: TEAL },
  wgrid({ cols: [1, 1.4], rows: [1], gap: 0.28, padding: 0.3 }, [
    { node: chip('azf-svc-you', 'You', BLUE), at: [0, 0] },
    { node: serviceStack, at: [1, 0] },
  ]),
)

// ─── BAND 2 ─ Deployment Models (2×2 of mini-topologies) ────────────────────

const publicCell = container(
  { id: 'azf-dep-public', label: 'Public', color: BLUE },
  wgrid({ cols: [1, 2.6], rows: [1], gap: 0.3, padding: 0.28 }, [
    { node: chip('azf-pub-you', 'You', BLUE), at: [0, 0] },
    {
      node: container(
        { id: 'azf-pub-cloud', label: 'Azure', color: TEAL },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.18, padding: 0.25 }, [
          { node: chip('azf-pub-vm', 'VMs', TEAL), at: [0, 0] },
          { node: chip('azf-pub-stg', 'Storage', TEAL), at: [1, 0] },
          { node: chip('azf-pub-db', 'Azure SQL', TEAL), at: [0, 1] },
          { node: chip('azf-pub-app', 'App Service', TEAL), at: [1, 1] },
        ]),
      ),
      at: [1, 0],
    },
  ]),
)

const privateCell = container(
  { id: 'azf-dep-private', label: 'Private (single-tenant)', color: GRAY },
  wgrid({ cols: [1, 2.6], rows: [1], gap: 0.3, padding: 0.28 }, [
    { node: chip('azf-priv-you', 'You', BLUE), at: [0, 0] },
    {
      node: group(
        'azf-priv-flavors',
        wgrid({ cols: [1], rows: [1, 1], gap: 0.2, padding: 0.04 }, [
          { node: chip('azf-priv-onprem', 'Azure Stack Hub', TEAL), at: [0, 0] },
          { node: chip('azf-priv-dedicated', 'Azure Dedicated Host', TEAL), at: [0, 1] },
        ]),
      ),
      at: [1, 0],
    },
  ]),
)

const hybridCell = container(
  { id: 'azf-dep-hybrid', label: 'Hybrid', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.6, padding: 0.32 }, [
    { node: chip('azf-hyb-onprem', 'On-Prem', GRAY), at: [0, 0] },
    { node: chip('azf-hyb-azure', 'Azure', TEAL), at: [1, 0] },
  ]),
)

const multiCloudStack = group(
  'azf-mc-stack',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.14, padding: 0.04 }, [
    { node: chip('azf-mc-azure', 'Azure', TEAL), at: [0, 0] },
    { node: chip('azf-mc-aws', 'AWS', ORANGE), at: [0, 1] },
    { node: chip('azf-mc-gcp', 'GCP', BLUE), at: [0, 2] },
  ]),
)

const multiCloudCell = container(
  { id: 'azf-dep-multi', label: 'Multi-cloud', color: PURPLE },
  wgrid({ cols: [1, 1.5], rows: [1], gap: 0.32, padding: 0.32 }, [
    { node: chip('azf-mc-you', 'You', BLUE), at: [0, 0] },
    { node: multiCloudStack, at: [1, 0] },
  ]),
)

const deploymentModels = container(
  { id: 'azf-deployment-models', label: 'Deployment Models', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.45, padding: 0.38 }, [
    { node: publicCell, at: [0, 0] },
    { node: privateCell, at: [1, 0] },
    { node: hybridCell, at: [0, 1] },
    { node: multiCloudCell, at: [1, 1] },
  ]),
)

// ─── BAND 3 ─ Connecting to Azure (three doors, one ARM plane) ──────────────

const doors = group(
  'azf-conn-doors',
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.14, padding: 0.04 }, [
    { node: chip('azf-conn-portal', 'Portal', YELLOW, 'user / password → session token'), at: [0, 0] },
    { node: chip('azf-conn-cli', 'Azure CLI', YELLOW, 'service principal / managed identity'), at: [0, 1] },
    { node: chip('azf-conn-sdk', 'SDK', YELLOW, 'service principal / managed identity'), at: [0, 2] },
  ]),
)

const connecting = container(
  { id: 'azf-connecting', label: 'Connecting to Azure', color: YELLOW },
  wgrid({ cols: [1, 1.2, 1], rows: [1], gap: 0.3, padding: 0.3 }, [
    { node: chip('azf-conn-you', 'You / App', BLUE), at: [0, 0] },
    { node: doors, at: [1, 0] },
    { node: chip('azf-conn-apis', 'ARM APIs', TEAL), at: [2, 0] },
  ]),
)

// ─── BAND 4 ─ Global Infrastructure (Geography ⊃ Region ⊃ Zone ⊃ Data Center) ─

const dc = (id: string, color: string): NodeSeed =>
  container(
    { id, label: 'DC', color },
    wgrid({ cols: [1], rows: [1, 1], gap: 0.18, padding: 0.06 }, [
      { node: chip(`${id}-srv`, 'Servers', TEAL), at: [0, 0] },
      { node: chip(`${id}-stg`, 'Storage', TEAL), at: [0, 1] },
    ]),
  )

const azA = container(
  { id: 'azf-az-a', label: 'Zone 1', color: TEAL },
  wgrid({ cols: [1], rows: [1], gap: 0.18, padding: 0.08 }, [{ node: dc('azf-az-a-dc1', GRAY), at: [0, 0] }]),
)

const azB = container(
  { id: 'azf-az-b', label: 'Zone 2', color: TEAL },
  wgrid({ cols: [1], rows: [1], gap: 0.18, padding: 0.08 }, [{ node: dc('azf-az-b-dc1', GRAY), at: [0, 0] }]),
)

const azC = container(
  { id: 'azf-az-c', label: 'Zone 3', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.18, padding: 0.25 }, [
    { node: dc('azf-az-c-dc1', GRAY), at: [0, 0] },
    { node: dc('azf-az-c-dc2', GRAY), at: [1, 0] },
  ]),
)

const region = container(
  { id: 'azf-region', label: 'Region: Southeast Asia (Singapore) · pairs with East Asia', color: GREEN },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.3, padding: 0.32 }, [
    { node: azA, at: [0, 0] },
    { node: azB, at: [1, 0] },
    { node: azC, at: [0, 1, 2, 1] },
  ]),
)

const geography = container(
  { id: 'azf-geography', label: 'Geography: Asia Pacific', color: GREEN },
  wgrid({ cols: [1], rows: [1], gap: 0.2, padding: 0.1 }, [{ node: region, at: [0, 0] }]),
)

const globalInfra = container(
  { id: 'azf-global-infra', label: 'Global Infrastructure', color: GREEN },
  wgrid({ cols: [1], rows: [1], gap: 0.2, padding: 0.1 }, [{ node: geography, at: [0, 0] }]),
)

// ─── COLUMNS ────────────────────────────────────────────────────────────────

const leftCol = group(
  'azf-left',
  wgrid({ cols: [1], rows: [3, 9], gap: 0.45, padding: 0.02 }, [
    { node: serviceModels, at: [0, 0] },
    { node: deploymentModels, at: [0, 1] },
  ]),
)

const rightCol = group(
  'azf-right',
  wgrid({ cols: [1], rows: [3, 9], gap: 0.45, padding: 0.02 }, [
    { node: connecting, at: [0, 0] },
    { node: globalInfra, at: [0, 1] },
  ]),
)

const root: SceneNodeSpec = group(
  'azf-root',
  wgrid({ cols: [1, 1], rows: [1], gap: 0.14, padding: 0.04 }, [
    { node: leftCol, at: [0, 0] },
    { node: rightCol, at: [1, 0] },
  ]),
)

export const azureFundamentals: SceneSpec = {
  id: 'azure-fundamentals',
  topic: 'azure',
  title: 'Azure Foundations — the cloud, end to end',
  subtitle: 'service models · deployment models · connecting to Azure · global infrastructure',
  // The source map's 26×14 frame (≈1.86:1).
  canvas: { width: 1456, height: 784 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // Service Models — You fans into the stack
    { from: 'azf-svc-you', to: 'azf-svc-saas', color: BLUE },
    { from: 'azf-svc-you', to: 'azf-svc-paas', color: BLUE },
    { from: 'azf-svc-you', to: 'azf-svc-iaas', color: BLUE },

    // Deployment Models — each cell's defining topology
    { from: 'azf-pub-you', to: 'azf-pub-cloud', label: 'Internet', color: TEAL },
    { from: 'azf-priv-you', to: 'azf-priv-onprem', label: 'Corp network', color: GRAY },
    { from: 'azf-priv-you', to: 'azf-priv-dedicated', label: 'ExpressRoute', color: TEAL },
    { from: 'azf-hyb-onprem', to: 'azf-hyb-azure', label: 'VPN / ExpressRoute / Arc', color: PURPLE },
    { from: 'azf-mc-you', to: 'azf-mc-azure', color: TEAL },
    { from: 'azf-mc-you', to: 'azf-mc-aws', color: ORANGE },
    { from: 'azf-mc-you', to: 'azf-mc-gcp', color: BLUE },

    // Connecting to Azure — three doors, one ARM plane
    { from: 'azf-conn-you', to: 'azf-conn-portal', color: BLUE },
    { from: 'azf-conn-you', to: 'azf-conn-cli', color: BLUE },
    { from: 'azf-conn-you', to: 'azf-conn-sdk', color: BLUE },
    { from: 'azf-conn-portal', to: 'azf-conn-apis', label: 'HTTPS', color: TEAL },
    { from: 'azf-conn-cli', to: 'azf-conn-apis', label: 'HTTPS', color: TEAL },
    { from: 'azf-conn-sdk', to: 'azf-conn-apis', label: 'HTTPS', color: TEAL },
  ],
}
