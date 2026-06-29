import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, type NodeSeed, type PatternResult, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL } from '../engine/colors.ts'

// Azure network traffic flow on one map — ported from NodeMap's
// `azure-network-traffic.ts`. North-to-south traffic flow:
//   Internet → Azure Front Door (global anycast · WAF) → into the VNet's AGW subnet
//   (NSG → Public IP → App Gateway), which fans out to two zonal app subnets, each
//   NSG → ASG → VMSS{ VM grid }. Azure NSGs are stateful, so there is no separate
//   NACL-equivalent layer — the contrast the scene teaches is NSG (subnet/NIC firewall)
//   vs ASG (tag-based NIC group), not SG vs NACL.
// This is the dense scene module 06 (Networking — VNets, Peering, VPN & ExpressRoute)
// rides; the manifest frames one hop per section via highlight/focus. Faithful
// transcription: same node ids (`aznet-*`), same colors, same weighted tracks — only
// the dialect changes (NodeMap GridNode → graphl-ux container/group/chip/comp).

/** A NodeMap bare titled leaf → graphl-ux `symbol`: glyph + label (+ optional sub). */
const comp = (id: string, label: string, color: string, sub?: string): NodeSeed => ({ id, label, color, kind: 'symbol', sub })

/** A NodeMap `term()` chip → graphl-ux `term`: a filled chip whose text IS the concept. */
const chip = (id: string, label: string, color: string, sub?: string): NodeSeed => ({ id, label, color, kind: 'term', sub })

const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── AGW SUBNET — horizontal chain: NSG → Public IP → App Gateway ───────────

const agwSubnet = container(
  { id: 'aznet-agw-subnet', label: 'AGW Subnet', color: TEAL },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.3, padding: 0.32 }, [
    { node: comp('aznet-nsg-agw', 'NSG: AGW NSG', RED, 'stateful · allow 443'), at: [0, 0] },
    { node: comp('aznet-public-ip', 'Public IP', PURPLE, 'standard · zonal'), at: [1, 0] },
    { node: comp('aznet-agw', 'App Gateway', BLUE, 'WAF v2 · L7 · path routing'), at: [2, 0] },
  ]),
)

// ─── APP SUBNET (Zone 1) — vertical: NSG → ASG → VMSS{ VM grid } ────────────

const vmssA = container(
  { id: 'aznet-vmss-1', label: 'VMSS — Zone 1', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.25 }, [
    { node: comp('aznet-vm-a1', 'VM', GREEN, 'vm-001'), at: [0, 0] },
    { node: comp('aznet-vm-a2', 'VM', GREEN, 'vm-002'), at: [1, 0] },
    { node: chip('aznet-vm-a-scaling', 'scaling out…', PURPLE), at: [0, 1, 2, 1] },
  ]),
)

const privateSubnetA = container(
  { id: 'aznet-private-1', label: 'App Subnet Zone 1', color: TEAL },
  wgrid({ cols: [1], rows: [0.55, 0.55, 2.2], gap: 0.22, padding: 0.1 }, [
    { node: comp('aznet-nsg-1', 'NSG: App NSG', RED, 'stateful · 443 from AGW subnet'), at: [0, 0] },
    { node: chip('aznet-asg-1', 'ASG: web', ORANGE, 'tag-based NIC group'), at: [0, 1] },
    { node: vmssA, at: [0, 2] },
  ]),
)

// ─── APP SUBNET (Zone 2) — mirror, with draining VMSS instance ──────────────

const vmssB = container(
  { id: 'aznet-vmss-2', label: 'VMSS — Zone 2', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.25 }, [
    { node: comp('aznet-vm-b1', 'VM', GREEN, 'vm-003'), at: [0, 0] },
    { node: comp('aznet-vm-b2', 'VM', GREEN, 'vm-004'), at: [1, 0] },
    { node: chip('aznet-vm-b-draining', 'draining…', ORANGE), at: [0, 1, 2, 1] },
  ]),
)

const privateSubnetB = container(
  { id: 'aznet-private-2', label: 'App Subnet Zone 2', color: TEAL },
  wgrid({ cols: [1], rows: [0.55, 0.55, 2.2], gap: 0.22, padding: 0.1 }, [
    { node: comp('aznet-nsg-2', 'NSG: App NSG', RED, 'stateful · 443 from AGW subnet'), at: [0, 0] },
    { node: chip('aznet-asg-2', 'ASG: web', ORANGE, 'tag-based NIC group'), at: [0, 1] },
    { node: vmssB, at: [0, 2] },
  ]),
)

const privateRow = group(
  'aznet-private-row',
  wgrid({ cols: [1, 1], rows: [1], gap: 0.45, padding: 0.02 }, [
    { node: privateSubnetA, at: [0, 0] },
    { node: privateSubnetB, at: [1, 0] },
  ]),
)

// ─── VNET — AGW subnet on top, app subnets row below ────────────────────────

const vnet = container(
  { id: 'aznet-vnet', label: 'VNet', color: GREEN },
  wgrid({ cols: [1], rows: [1.3, 5.8], gap: 0.45, padding: 0.1 }, [
    { node: agwSubnet, at: [0, 0] },
    { node: privateRow, at: [0, 1] },
  ]),
)

// ─── AZURE CLOUD — orange wrapper: Front Door on top, VNet below ────────────

const azureCloud = container(
  { id: 'aznet-azure-cloud', label: 'Azure Cloud', color: ORANGE },
  wgrid({ cols: [1], rows: [0.7, 8], gap: 0.45, padding: 0.1 }, [
    { node: comp('aznet-front-door', 'Azure Front Door', PURPLE, 'global anycast · WAF'), at: [0, 0] },
    { node: vnet, at: [0, 1] },
  ]),
)

// ─── ROOT — Internet on top → Azure Cloud below ─────────────────────────────

const root: SceneNodeSpec = group(
  'azure-network-traffic-root',
  wgrid({ cols: [1], rows: [0.55, 9], gap: 0.5, padding: 0.04 }, [
    { node: comp('aznet-internet', 'Internet (clients)', GRAY), at: [0, 0] },
    { node: azureCloud, at: [0, 1] },
  ]),
)

export const azureNetworkTraffic: SceneSpec = {
  id: 'azure-network-traffic',
  topic: 'azure',
  title: 'Azure — Network Traffic Flow (NSG vs ASG)',
  subtitle: 'Internet → Front Door → VNet (AGW subnet → zonal app subnets) · NSG vs ASG',
  // The source map's 22×14 frame (≈1.57:1).
  canvas: { width: 1232, height: 784 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // Internet → Front Door → into VNet (AGW subnet)
    { from: 'aznet-internet', to: 'aznet-front-door', label: 'HTTPS', color: GRAY },
    { from: 'aznet-front-door', to: 'aznet-agw-subnet', label: 'enter region', color: PURPLE },

    // inside AGW subnet: NSG → Public IP → App Gateway
    { from: 'aznet-nsg-agw', to: 'aznet-public-ip', label: 'allow 443', color: RED },
    { from: 'aznet-public-ip', to: 'aznet-agw', label: 'frontend bind', color: PURPLE },

    // App Gateway fans out to each zone's app subnet
    { from: 'aznet-agw', to: 'aznet-private-1', label: 'route Zone 1', color: BLUE },
    { from: 'aznet-agw', to: 'aznet-private-2', label: 'route Zone 2', color: BLUE },

    // inside Zone 1: NSG → ASG → VMSS
    { from: 'aznet-nsg-1', to: 'aznet-asg-1', label: 'from AGW subnet', color: RED },
    { from: 'aznet-asg-1', to: 'aznet-vmss-1', label: 'in 443', color: ORANGE },

    // inside Zone 2: same pattern
    { from: 'aznet-nsg-2', to: 'aznet-asg-2', label: 'from AGW subnet', color: RED },
    { from: 'aznet-asg-2', to: 'aznet-vmss-2', label: 'in 443', color: ORANGE },
  ],
}
