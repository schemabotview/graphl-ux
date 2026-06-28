import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, type NodeSeed, type PatternResult, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL } from '../engine/colors.ts'

// AWS VPC traffic flow (SG vs NACL) — ported from NodeMap's `aws-network-security.ts`
// (`~/Projects/NodeMap/src/data/scenes/aws-network-security.ts`). A west→east packet path,
// nested as the network actually nests:
//   Internet → IGW → AWS Cloud ⊃ VPC ⊃ { Public Subnet (NACL → NLB → SG-ALB → ALB),
//   Private Subnet AZ-A / AZ-B (NACL → SG → ASG ⊃ EC2s) }.
// Geometry is the lesson: a NACL is a stateless gate at the SUBNET boundary; a Security
// Group is a stateful gate at the INSTANCE — so the path crosses a NACL once per subnet
// and an SG once per resource. This is the dense scene module 06 (VPC & Connectivity)
// rides; the manifest frames one hop per section via highlight/focus. Faithful
// transcription: same node ids (`ans-*`), same colors, same weighted tracks.
//
// Note: the source carried a descriptive subtitle on each leaf (e.g. "stateless · allow
// + deny"). graphl-ux renders a leaf `sub` at a fixed size that overflows these narrow
// cells, and the other ports (kubernetes/docker/linux) carry no leaf subs — so that
// detail lives in the notebook/narration here, and the nodes keep just their labels.

/** A NodeMap bare titled leaf → graphl-ux `symbol`: glyph + label. */
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

/** A NodeMap `term()` chip → graphl-ux `term`: a filled chip whose text IS the concept. */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── PUBLIC SUBNET — NACL → NLB → SG-ALB → ALB ──────────────────────────────

const publicSubnet = container(
  { id: 'ans-public-subnet', label: 'Public Subnet', color: TEAL },
  wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.3, padding: 0.32 }, [
    { node: comp('ans-nacl-public', 'NACL — public', ORANGE), at: [0, 0] },
    { node: comp('ans-nlb', 'NLB', PURPLE), at: [1, 0] },
    { node: comp('ans-sg-alb', 'SG: ALB SG', RED), at: [2, 0] },
    { node: comp('ans-alb', 'ALB', BLUE), at: [3, 0] },
  ]),
)

// ─── PRIVATE SUBNET (AZ-A) — NACL → SG → ASG ⊃ EC2s ─────────────────────────

const asgA = container(
  { id: 'ans-asg-a', label: 'ASG — AZ-A', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.25 }, [
    { node: comp('ans-ec2-a1', 'EC2', GREEN), at: [0, 0] },
    { node: comp('ans-ec2-a2', 'EC2', GREEN), at: [1, 0] },
    { node: chip('ans-ec2-a-launching', 'launching…', PURPLE), at: [0, 1, 2, 1] },
  ]),
)

const privateSubnetA = container(
  { id: 'ans-private-a', label: 'Private Subnet AZ-A', color: TEAL },
  wgrid({ cols: [1], rows: [0.55, 0.55, 2.2], gap: 0.22, padding: 0.3 }, [
    { node: comp('ans-nacl-a', 'NACL — AZ-A', ORANGE), at: [0, 0] },
    { node: comp('ans-sg-ec2-a', 'SG: EC2 SG', RED), at: [0, 1] },
    { node: asgA, at: [0, 2] },
  ]),
)

// ─── PRIVATE SUBNET (AZ-B) — mirror, with terminating EC2 ───────────────────

const asgB = container(
  { id: 'ans-asg-b', label: 'ASG — AZ-B', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.2, padding: 0.25 }, [
    { node: comp('ans-ec2-b1', 'EC2', GREEN), at: [0, 0] },
    { node: comp('ans-ec2-b2', 'EC2', GREEN), at: [1, 0] },
    { node: chip('ans-ec2-b-terminating', 'terminating…', ORANGE), at: [0, 1, 2, 1] },
  ]),
)

const privateSubnetB = container(
  { id: 'ans-private-b', label: 'Private Subnet AZ-B', color: TEAL },
  wgrid({ cols: [1], rows: [0.55, 0.55, 2.2], gap: 0.22, padding: 0.3 }, [
    { node: comp('ans-nacl-b', 'NACL — AZ-B', ORANGE), at: [0, 0] },
    { node: comp('ans-sg-ec2-b', 'SG: EC2 SG', RED), at: [0, 1] },
    { node: asgB, at: [0, 2] },
  ]),
)

const privateRow = group(
  'ans-private-row',
  wgrid({ cols: [1, 1], rows: [1], gap: 0.45, padding: 0 }, [
    { node: privateSubnetA, at: [0, 0] },
    { node: privateSubnetB, at: [1, 0] },
  ]),
)

// ─── VPC ⊃ public subnet over private subnets row ───────────────────────────

const vpc = container(
  { id: 'ans-vpc', label: 'VPC', color: GREEN },
  wgrid({ cols: [1], rows: [1.3, 5.8], gap: 0.45, padding: 0.45 }, [
    { node: publicSubnet, at: [0, 0] },
    { node: privateRow, at: [0, 1] },
  ]),
)

// ─── AWS CLOUD ⊃ IGW over VPC ───────────────────────────────────────────────

const awsCloud = container(
  { id: 'ans-aws-cloud', label: 'AWS Cloud', color: ORANGE },
  wgrid({ cols: [1], rows: [0.7, 8], gap: 0.45, padding: 0.45 }, [
    { node: comp('ans-igw', 'Internet Gateway (IGW)', GRAY), at: [0, 0] },
    { node: vpc, at: [0, 1] },
  ]),
)

// ─── ROOT — Internet (outside AWS) over AWS Cloud ───────────────────────────

const root: SceneNodeSpec = group(
  'aws-network-security-root',
  wgrid({ cols: [1], rows: [0.55, 9], gap: 0.5, padding: 0.04 }, [
    { node: comp('ans-internet', 'Internet (clients)', GRAY), at: [0, 0] },
    { node: awsCloud, at: [0, 1] },
  ]),
)

export const awsVpc: SceneSpec = {
  id: 'aws-vpc',
  topic: 'aws',
  title: 'AWS VPC — traffic flow (SG vs NACL)',
  subtitle: 'Internet → IGW → public subnet (ALB) → private subnets (SG → ASG → EC2)',
  // The source map's 22×14 frame (≈1.57:1).
  canvas: { width: 1408, height: 896 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // Internet → IGW → into VPC
    { from: 'ans-internet', to: 'ans-igw', label: 'HTTPS', color: GRAY },
    { from: 'ans-igw', to: 'ans-public-subnet', label: 'enter VPC', color: PURPLE },

    // inside public subnet: NACL → NLB → SG-ALB → ALB
    { from: 'ans-nacl-public', to: 'ans-nlb', label: 'allow 443', color: ORANGE },
    { from: 'ans-nlb', to: 'ans-sg-alb', label: 'forward', color: PURPLE },
    { from: 'ans-sg-alb', to: 'ans-alb', label: 'instance check', color: RED },

    // ALB fans out to each AZ's private subnet
    { from: 'ans-alb', to: 'ans-private-a', label: 'route AZ-A', color: BLUE },
    { from: 'ans-alb', to: 'ans-private-b', label: 'route AZ-B', color: BLUE },

    // inside AZ-A: NACL → SG → ASG
    { from: 'ans-nacl-a', to: 'ans-sg-ec2-a', label: 'subnet allow', color: ORANGE },
    { from: 'ans-sg-ec2-a', to: 'ans-asg-a', label: 'in 80 from ALB SG', color: RED },

    // inside AZ-B: same pattern
    { from: 'ans-nacl-b', to: 'ans-sg-ec2-b', label: 'subnet allow', color: ORANGE },
    { from: 'ans-sg-ec2-b', to: 'ans-asg-b', label: 'in 80 from ALB SG', color: RED },
  ],
}
