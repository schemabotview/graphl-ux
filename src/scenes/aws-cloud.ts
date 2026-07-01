import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, weighted, type NodeSeed } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// AWS Cloud — the whole map — faithful port of NodeMap's `aws.ts`
// (`~/Projects/NodeMap/src/data/scenes/aws.ts`). This is the ONE dense "everything"
// map for the concept (per graphl-ux's "one dense spatial map is the single source of
// truth"): modules ride slices of it via the manifest's `focus`/`highlight`. Layout
// (west → east across a 40×23 frame):
//   leftStrip  Identity & Access (IAM · Identity Center · Orgs · STS · …) over
//              Edge / Front Door (Route 53 · CloudFront · GA · WAF · Shield)
//   DevOps     CI/CD pipeline (Developer → CodeCommit → CodePipeline → CodeBuild →
//              CodeDeploy → ECR) — pulled OUT of Region A into its own cross-cutting
//              column: it ships INTO the app (short deploy arrow) but isn't region-scoped.
//   Region A   3-tier OLTP web app — VPC ⊃ {IGW/TGW/Endpoints, AZ-a & AZ-b each ⊃
//              Public/App/Data subnets, shared ALB/ASG} over Auth · Integration/Messaging
//              · Block/File Storage bands
//   Cross-cut  Security & Crypto (KMS · Secrets · ACM · GuardDuty · Inspector · Macie)
//   Region B   Data-engineering pipeline (Ingest → Lake → Process → Query/BI)
//   globalBand Account / Management plane (CloudFormation · CloudTrail · … · Trusted Advisor)
//
// Faithful transcription: same node ids, colors, and edges as the source — only the
// dialect changes (NodeMap GridNode + weighted tracks → graphl-ux container/group +
// `weighted()`; `showChrome:false` wrappers → `group`; bare titled leaves → `symbol`).
//
// This is now the SINGLE AWS scene: the former `aws-vpc` and `aws-data-engineering`
// deep-dives were retired and their content lives here. Region B holds the full data-eng
// pipeline (aws-data-engineering was just that region re-axed left→right). Region A folds
// in aws-vpc's SG-vs-NACL geometry: each subnet carries a stateless NACL at its boundary
// and each resource tier a stateful SG (see `gate()`) — so the map teaches "NACL once per
// subnet, SG per resource" spatially. The deep packet-path detail (NLB, per-hop edges)
// was the standalone scene's job and is deliberately dropped in favor of one dense map.

/** A NodeMap bare titled leaf → graphl-ux `symbol`: glyph + label. */
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

/** A network-boundary gate → graphl-ux `term` chip (text IS the concept), so it reads as a
 *  boundary rather than a service. Folds the SG-vs-NACL geometry from the (now-retired)
 *  `aws-vpc` scene into Region A: a stateless NACL at each subnet edge, a stateful SG at the
 *  resource tier. NACL=orange / SG=red keep that scene's semantics. */
const gate = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

// ─── LEFT STRIP: Identity (top) + Edge (bottom) ─────────────────────────────

const identity = container(
  { id: 'identity', label: 'Identity & Access', color: YELLOW },
  weighted({ cols: [1], rows: [1, 1, 1, 1, 1, 1, 1], gap: 0.18, padding: 0.18 }, [
    { node: comp('iam', 'IAM', YELLOW), at: [0, 0] },
    { node: comp('identity-center', 'Identity Center', YELLOW), at: [0, 1] },
    { node: comp('organizations', 'Organizations', YELLOW), at: [0, 2] },
    { node: comp('sts', 'STS', ORANGE), at: [0, 3] },
    { node: comp('access-analyzer', 'Access Analyzer', BLUE), at: [0, 4] },
    { node: comp('directory-svc', 'Directory Service', PURPLE), at: [0, 5] },
    { node: comp('ram', 'RAM', GREEN), at: [0, 6] },
  ]),
)

const edge = container(
  { id: 'edge', label: 'Edge / Front Door', color: PURPLE },
  weighted({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.18, padding: 0.18 }, [
    { node: comp('route53', 'Route 53', PURPLE), at: [0, 0] },
    { node: comp('cloudfront', 'CloudFront', BLUE), at: [0, 1] },
    { node: comp('ga', 'Global Accelerator', TEAL), at: [0, 2] },
    { node: comp('waf', 'WAF', RED), at: [0, 3] },
    { node: comp('shield', 'Shield', RED), at: [0, 4] },
  ]),
)

const leftStrip = group(
  'left-strip',
  weighted({ cols: [1], rows: [4.8, 3.4], gap: 0.35, padding: 0 }, [
    { node: identity, at: [0, 0] },
    { node: edge, at: [0, 1] },
  ]),
)

// ─── REGION A — 3-tier OLTP web app ─────────────────────────────────────────

const devops = container(
  { id: 'devops', label: 'DevOps', color: YELLOW },
  weighted({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: 0.2, padding: 0.3 }, [
    { node: comp('developer', 'Developer', GRAY), at: [0, 0] },
    { node: comp('codecommit', 'CodeCommit', YELLOW), at: [0, 1] },
    { node: comp('codepipeline', 'CodePipeline', YELLOW), at: [0, 2] },
    { node: comp('codebuild', 'CodeBuild', YELLOW), at: [0, 3] },
    { node: comp('codedeploy', 'CodeDeploy', YELLOW), at: [0, 4] },
    { node: comp('ecr', 'ECR', BLUE), at: [0, 5] },
  ]),
)

const azA = container(
  { id: 'az-a', label: 'AZ-a (us-east-1a)', color: TEAL },
  weighted({ cols: [1], rows: [0.9, 1.7, 1.6], gap: 0.2, padding: 0.25 }, [
    {
      node: container(
        { id: 'public-a', label: 'Public Subnet', color: TEAL },
        weighted({ cols: [1], rows: [0.5, 1], gap: 0.15, padding: 0.2 }, [
          { node: gate('nacl-public-a', 'NACL', ORANGE), at: [0, 0] },
          { node: comp('nat-a', 'NAT GW', GRAY), at: [0, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'app-a', label: 'App Subnet', color: BLUE },
        weighted({ cols: [1, 1], rows: [0.5, 0.5, 1, 1], gap: 0.15, padding: 0.2 }, [
          { node: gate('nacl-app-a', 'NACL', ORANGE), at: [0, 0, 2, 1] },
          { node: gate('sg-app-a', 'SG', RED), at: [0, 1, 2, 1] },
          { node: comp('ec2-a', 'EC2', ORANGE), at: [0, 2] },
          { node: comp('ecs-a', 'ECS', PURPLE), at: [1, 2] },
          { node: comp('fargate-a', 'Fargate', BLUE), at: [0, 3] },
          { node: comp('lambda-a', 'Lambda', ORANGE), at: [1, 3] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'data-a', label: 'Data Subnet', color: BLUE },
        weighted({ cols: [1, 1], rows: [0.5, 0.5, 1, 1], gap: 0.15, padding: 0.2 }, [
          { node: gate('nacl-data-a', 'NACL', ORANGE), at: [0, 0, 2, 1] },
          { node: gate('sg-data-a', 'SG', RED), at: [0, 1, 2, 1] },
          { node: comp('cache-a', 'ElastiCache', RED), at: [0, 2] },
          { node: comp('rdsproxy-a', 'RDS Proxy', BLUE), at: [1, 2] },
          { node: comp('aurora-a', 'Aurora primary', BLUE), at: [0, 3, 2, 1] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

const azB = container(
  { id: 'az-b', label: 'AZ-b (us-east-1b)', color: TEAL },
  weighted({ cols: [1], rows: [0.9, 1.7, 1.6], gap: 0.2, padding: 0.25 }, [
    {
      node: container(
        { id: 'public-b', label: 'Public Subnet', color: TEAL },
        weighted({ cols: [1], rows: [0.5, 1], gap: 0.15, padding: 0.2 }, [
          { node: gate('nacl-public-b', 'NACL', ORANGE), at: [0, 0] },
          { node: comp('nat-b', 'NAT GW', GRAY), at: [0, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'app-b', label: 'App Subnet', color: BLUE },
        weighted({ cols: [1, 1], rows: [0.5, 0.5, 1, 1], gap: 0.15, padding: 0.2 }, [
          { node: gate('nacl-app-b', 'NACL', ORANGE), at: [0, 0, 2, 1] },
          { node: gate('sg-app-b', 'SG', RED), at: [0, 1, 2, 1] },
          { node: comp('ec2-b', 'EC2', ORANGE), at: [0, 2] },
          { node: comp('ecs-b', 'ECS', PURPLE), at: [1, 2] },
          { node: comp('fargate-b', 'Fargate', BLUE), at: [0, 3] },
          { node: comp('lambda-b', 'Lambda', ORANGE), at: [1, 3] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'data-b', label: 'Data Subnet', color: BLUE },
        weighted({ cols: [1, 1], rows: [0.5, 0.5, 1, 1], gap: 0.15, padding: 0.2 }, [
          { node: gate('nacl-data-b', 'NACL', ORANGE), at: [0, 0, 2, 1] },
          { node: gate('sg-data-b', 'SG', RED), at: [0, 1, 2, 1] },
          { node: comp('cache-b', 'ElastiCache', RED), at: [0, 2] },
          { node: comp('rdsproxy-b', 'RDS Proxy', BLUE), at: [1, 2] },
          { node: comp('aurora-b', 'Aurora standby', BLUE), at: [0, 3, 2, 1] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

const sharedCrossAz = group(
  'shared-cross-az',
  weighted({ cols: [1], rows: [0.9, 1.7, 1.6], gap: 0.2, padding: 0 }, [
    { node: comp('alb', 'ALB', ORANGE), at: [0, 0] },
    { node: comp('asg', 'ASG', ORANGE), at: [0, 1] },
  ]),
)

const vpc = container(
  { id: 'vpc-a', label: 'VPC (10.0.0.0/16)', color: GREEN },
  weighted({ cols: [1, 0.5, 1], rows: [0.4, 3.4], gap: 0.4, padding: 0.3 }, [
    {
      node: container(
        { id: 'vpc-edge', label: 'IGW · TGW · Endpoints', color: GREEN },
        weighted({ cols: [1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.18 }, [
          { node: comp('igw', 'IGW', PURPLE), at: [0, 0] },
          { node: comp('tgw', 'TGW', GREEN), at: [1, 0] },
          { node: comp('vpc-endpoint', 'VPC Endpoint', GREEN), at: [2, 0] },
          { node: comp('privatelink', 'PrivateLink', GREEN), at: [3, 0] },
        ]),
      ),
      at: [0, 0, 3, 1],
    },
    { node: azA, at: [0, 1] },
    { node: sharedCrossAz, at: [1, 1] },
    { node: azB, at: [2, 1] },
  ]),
)

const authBox = container(
  { id: 'auth-eng', label: 'Auth / Engagement', color: YELLOW },
  weighted({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
    { node: comp('cognito', 'Cognito', YELLOW), at: [0, 0] },
    { node: comp('pinpoint', 'Pinpoint', RED), at: [1, 0] },
    { node: comp('ses', 'SES', RED), at: [2, 0] },
  ]),
)

const integrationBox = container(
  { id: 'integration', label: 'Integration / Messaging', color: PURPLE },
  weighted({ cols: [1, 1, 1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
    { node: comp('apigw', 'API GW', PURPLE), at: [0, 0] },
    { node: comp('dynamodb', 'DynamoDB', BLUE), at: [1, 0] },
    { node: comp('sqs', 'SQS', PURPLE), at: [2, 0] },
    { node: comp('sns', 'SNS', RED), at: [3, 0] },
    { node: comp('eventbridge', 'EventBridge', YELLOW), at: [4, 0] },
    { node: comp('stepfunctions', 'Step Func', PURPLE), at: [5, 0] },
  ]),
)

const storageBox = container(
  { id: 'storage-a', label: 'Block / File Storage', color: GREEN },
  weighted({ cols: [1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
    { node: comp('ebs', 'EBS', GREEN), at: [0, 0] },
    { node: comp('efs', 'EFS', GREEN), at: [1, 0] },
    { node: comp('fsx', 'FSx', GREEN), at: [2, 0] },
    { node: comp('storage-gw', 'Storage Gateway', GRAY), at: [3, 0] },
  ]),
)

const regionA = container(
  // Single column now (DevOps left) — a large `padding` on a 1-col grid becomes a huge
  // side gutter (fraction of the FULL width), so keep it small or the VPC/bands float
  // inset with dead space left & right.
  { id: 'region-a', label: 'Region A — us-east-1 (3-tier OLTP)', color: BLUE },
  weighted({ cols: [1], rows: [5.2, 0.6, 0.6, 0.6], gap: 0.3, padding: 0.03 }, [
    { node: vpc, at: [0, 0] },
    { node: authBox, at: [0, 1] },
    { node: integrationBox, at: [0, 2] },
    { node: storageBox, at: [0, 3] },
  ]),
)

// ─── CROSS-CUTTING (Security & Crypto) ───────────────────────────────────────

const crossCutting = container(
  { id: 'cross-cut', label: 'Security & Crypto', color: RED },
  weighted({ cols: [1], rows: [1, 1, 1, 1, 1, 1], gap: 0.25, padding: 0.3 }, [
    { node: comp('kms', 'KMS', RED), at: [0, 0] },
    { node: comp('secrets', 'Secrets Mgr', RED), at: [0, 1] },
    { node: comp('acm', 'ACM', GREEN), at: [0, 2] },
    { node: comp('guardduty', 'GuardDuty', RED), at: [0, 3] },
    { node: comp('inspector', 'Inspector', YELLOW), at: [0, 4] },
    { node: comp('macie', 'Macie', BLUE), at: [0, 5] },
  ]),
)

// ─── REGION B — Data engineering pipeline ───────────────────────────────────

const ingestBox = container(
  { id: 'ingest', label: 'Ingest', color: TEAL },
  weighted({ cols: [1, 1, 1], rows: [1], gap: 0.2, padding: 0.25 }, [
    { node: comp('kinesis-streams', 'Kinesis Streams', TEAL), at: [0, 0] },
    { node: comp('msk', 'MSK (Kafka)', TEAL), at: [1, 0] },
    { node: comp('firehose', 'Firehose', TEAL), at: [2, 0] },
  ]),
)

const lakeBox = container(
  { id: 'lake', label: 'Data Lake (S3 zones)', color: GREEN },
  weighted({ cols: [1, 1, 1, 1], rows: [1], gap: 0.18, padding: 0.25 }, [
    { node: comp('s3-raw', 'S3 raw', GREEN), at: [0, 0] },
    { node: comp('s3-curated', 'S3 curated', GREEN), at: [1, 0] },
    { node: comp('s3-serving', 'S3 serving', GREEN), at: [2, 0] },
    { node: comp('glacier', 'Glacier', BLUE), at: [3, 0] },
  ]),
)

const processBox = container(
  { id: 'process', label: 'Process / Orchestrate', color: PURPLE },
  weighted({ cols: [1, 1, 1, 1], rows: [1], gap: 0.18, padding: 0.25 }, [
    { node: comp('glue', 'Glue', PURPLE), at: [0, 0] },
    { node: comp('emr', 'EMR', TEAL), at: [1, 0] },
    { node: comp('lambda-rb', 'Lambda', ORANGE), at: [2, 0] },
    { node: comp('stepfn-b', 'Step Func', PURPLE), at: [3, 0] },
  ]),
)

const queryBox = container(
  { id: 'query', label: 'Query / BI', color: ORANGE },
  weighted({ cols: [1, 1, 1, 1], rows: [1], gap: 0.18, padding: 0.25 }, [
    { node: comp('athena', 'Athena', ORANGE), at: [0, 0] },
    { node: comp('redshift', 'Redshift', BLUE), at: [1, 0] },
    { node: comp('quicksight', 'QuickSight', PURPLE), at: [2, 0] },
    { node: comp('opensearch', 'OpenSearch', TEAL), at: [3, 0] },
  ]),
)

const regionB = container(
  { id: 'region-b', label: 'Region B — us-west-2 (Data Engineering)', color: PURPLE },
  weighted({ cols: [1], rows: [1, 1, 1, 1], gap: 0.3, padding: 0.35 }, [
    { node: ingestBox, at: [0, 0] },
    { node: lakeBox, at: [0, 1] },
    { node: processBox, at: [0, 2] },
    { node: queryBox, at: [0, 3] },
  ]),
)

// ─── MAIN ROW: leftStrip | DevOps | Region A | Cross-cut | Region B ─────────

const mainRow = group(
  'aws-main',
  weighted({ cols: [1.0, 1.0, 4.5, 1.0, 3.0], rows: [1], gap: 1.4, padding: 0 }, [
    { node: leftStrip, at: [0, 0] },
    { node: devops, at: [1, 0] },
    { node: regionA, at: [2, 0] },
    { node: crossCutting, at: [3, 0] },
    { node: regionB, at: [4, 0] },
  ]),
)

// ─── BOTTOM BAND: account-wide / global plane ───────────────────────────────

const globalBand = container(
  { id: 'global-plane', label: 'Account / Management plane', color: GRAY },
  weighted({ cols: [1, 1, 1, 1, 1, 1, 1], rows: [1], gap: 0.2, padding: 0.3 }, [
    { node: comp('cloudformation', 'CloudFormation', RED), at: [0, 0] },
    { node: comp('cloudtrail', 'CloudTrail', BLUE), at: [1, 0] },
    { node: comp('cloudwatch', 'CloudWatch', PURPLE), at: [2, 0] },
    { node: comp('config', 'Config', GREEN), at: [3, 0] },
    { node: comp('cost', 'Cost Mgmt', GREEN), at: [4, 0] },
    { node: comp('health', 'Health', RED), at: [5, 0] },
    { node: comp('trusted-advisor', 'Trusted Advisor', GREEN), at: [6, 0] },
  ]),
)

// ─── ROOT — main row over the account/management band ───────────────────────

const root: SceneNodeSpec = group(
  'aws-cloud-root',
  weighted({ cols: [1], rows: [14, 1.6], gap: 1.4, padding: 0.04 }, [
    { node: mainRow, at: [0, 0] },
    { node: globalBand, at: [0, 1] },
  ]),
)

export const awsCloud: SceneSpec = {
  id: 'aws-cloud',
  topic: 'aws',
  title: 'AWS Cloud — the whole map',
  subtitle: 'Identity · Edge · DevOps · Region A (3-tier OLTP) · Security · Region B (data eng) · Management',
  // The source map's 40×23 frame (≈1.74:1).
  canvas: { width: 1600, height: 920 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // ── In-container flows ──────────────────────────────────────────────────

    // Identity & Access (workforce identity plane)
    { from: 'organizations', to: 'iam', label: 'SCP', color: YELLOW },
    { from: 'directory-svc', to: 'identity-center', label: 'AD source', color: PURPLE },
    { from: 'identity-center', to: 'iam', label: 'permission sets', color: YELLOW },

    // Edge (DNS → CDN → WAF chain)
    { from: 'route53', to: 'cloudfront', label: 'resolve', color: PURPLE },
    { from: 'cloudfront', to: 'waf', label: 'edge HTTPS', color: BLUE },

    // DevOps pipeline
    { from: 'developer', to: 'codecommit', label: 'git push', color: YELLOW },
    { from: 'codecommit', to: 'codepipeline', label: 'trigger', color: YELLOW },
    { from: 'codepipeline', to: 'codebuild', label: 'build stage', color: YELLOW },
    { from: 'codebuild', to: 'ecr', label: 'push image', color: BLUE },
    { from: 'codepipeline', to: 'codedeploy', label: 'deploy stage', color: YELLOW },

    // Data subnets (each pair inside its own AZ data subnet)
    { from: 'rdsproxy-a', to: 'aurora-a', label: 'SQL', color: BLUE },
    { from: 'rdsproxy-b', to: 'aurora-b', label: 'SQL', color: BLUE },

    // Region B groups
    { from: 'kinesis-streams', to: 'firehose', label: 'deliver', color: TEAL },
    { from: 's3-curated', to: 's3-serving', label: 'aggregate', color: GREEN },
    { from: 's3-raw', to: 'glacier', label: 'lifecycle >6mo', color: GRAY },
    { from: 'stepfn-b', to: 'glue', label: 'orchestrate', color: PURPLE },
    { from: 'redshift', to: 'quicksight', label: 'BI query', color: PURPLE },

    // ── Container ↔ Container: within Region A (AZ-level wiring) ────────────
    { from: 'alb', to: 'app-a', label: 'route', color: BLUE },
    { from: 'alb', to: 'app-b', label: 'route', color: BLUE },
    { from: 'asg', to: 'ec2-a', label: 'launches', color: ORANGE },
    { from: 'asg', to: 'ec2-b', label: 'launches', color: ORANGE },
    { from: 'alb', to: 'asg', label: 'target group', color: BLUE },
    { from: 'app-a', to: 'data-a', label: 'SQL + cache', color: BLUE },
    { from: 'app-b', to: 'data-b', label: 'SQL + cache', color: BLUE },
    { from: 'data-a', to: 'data-b', label: 'Aurora replica', color: BLUE },

    // ── Container ↔ Container: Region A higher level ────────────────────────
    { from: 'edge', to: 'vpc-a', label: 'HTTPS to ALB', color: PURPLE },
    { from: 'devops', to: 'vpc-a', label: 'deploy + image', color: YELLOW },
    { from: 'vpc-a', to: 'integration', label: 'invoke / enqueue', color: PURPLE },
    { from: 'integration', to: 'vpc-a', label: 'consume / event', color: TEAL },
    { from: 'auth-eng', to: 'integration', label: 'authorize', color: YELLOW },
    { from: 'storage-a', to: 'vpc-a', label: 'attach EBS / EFS', color: GREEN },

    // ── Cross-region: Region A → Region B ───────────────────────────────────
    { from: 'vpc-a', to: 'ingest', label: 'events', color: TEAL },
    { from: 'vpc-a', to: 'lake', label: 'CDC export', color: BLUE },
    { from: 'storage-a', to: 'lake', label: 'hybrid sync', color: GRAY },

    // ── Container ↔ Container: within Region B ──────────────────────────────
    { from: 'ingest', to: 'lake', label: 'write batch', color: TEAL },
    { from: 'ingest', to: 'process', label: 'consume', color: TEAL },
    { from: 'lake', to: 'process', label: 'crawl', color: PURPLE },
    { from: 'process', to: 'lake', label: 'transform', color: PURPLE },
    { from: 'lake', to: 'query', label: 'SQL / load', color: ORANGE },

    // ── Identity / Edge → workloads ─────────────────────────────────────────
    { from: 'identity', to: 'region-a', label: 'assume role (STS)', color: YELLOW },
    { from: 'identity', to: 'region-b', label: 'assume role', color: YELLOW },
    { from: 'identity', to: 'global-plane', label: 'auth events', color: BLUE },

    // ── Cross-cutting (Security & Crypto → regions) ─────────────────────────
    { from: 'cross-cut', to: 'region-a', label: 'encrypt + creds', color: RED },
    { from: 'cross-cut', to: 'region-b', label: 'encrypt', color: RED },
    { from: 'cross-cut', to: 'global-plane', label: 'findings', color: RED },

    // ── Account plane ↔ Regions ─────────────────────────────────────────────
    { from: 'region-a', to: 'global-plane', label: 'metrics / audit', color: PURPLE },
    { from: 'region-b', to: 'global-plane', label: 'metrics', color: PURPLE },
    { from: 'global-plane', to: 'region-a', label: 'provision (CFN)', color: RED },
  ],
}
