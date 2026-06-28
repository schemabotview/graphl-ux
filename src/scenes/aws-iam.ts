import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, type NodeSeed, type PatternResult, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, YELLOW } from '../engine/colors.ts'

// AWS IAM on one map — ported from NodeMap's `aws-iam.ts`
// (`~/Projects/NodeMap/src/data/scenes/aws-iam.ts`). A 3×3 layout:
//   TOP BANNER  the anatomy of every account (root · users/groups · roles · policies · resources)
//   ROW 2 LEFT  the org story — Corp IdP federates into AWS Organizations (mgmt-acct ·
//              Security OU · Workloads OU) — and below it, inside a workload account, the
//              trust + workload roles.
//   ROW 2 MID   the role-assumption handshake (GitHub OIDC → STS → DeployerRole's trust +
//              perm policy → target infra) — the headline cross-account arrow.
//   RIGHT COL   the policy-evaluation chain (SCP → Boundary → Identity/Resource → Session,
//              with Explicit Deny as the kill switch).
// This is the dense scene module 02 (IAM, Organizations & Account Security) rides; the
// manifest frames one subsystem per section via highlight/focus. Faithful transcription:
// same node ids, same colors, same weighted tracks — only the dialect changes.

/** A NodeMap bare titled leaf → graphl-ux `symbol`: glyph + label (+ optional sub). */
const comp = (id: string, label: string, color: string, sub?: string): NodeSeed => ({ id, label, color, kind: 'symbol', sub })

/** A NodeMap `term()` chip → graphl-ux `term`: a filled chip whose text IS the concept. */
const chip = (id: string, label: string, color: string, sub?: string): NodeSeed => ({ id, label, color, kind: 'term', sub })

const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── ANATOMY BANNER ─────────────────────────────────────────────────────────

const anatomyBanner = container(
  { id: 'anatomy-banner', label: 'Anatomy of every AWS account', color: GRAY },
  wgrid({ cols: [1, 1, 1, 1, 1], rows: [1], gap: 0.3, padding: 0.32 }, [
    { node: comp('anat-root', 'root', GRAY), at: [0, 0] },
    { node: comp('anat-users', 'users / groups', BLUE), at: [1, 0] },
    { node: comp('anat-roles', 'roles', RED), at: [2, 0] },
    { node: comp('anat-policies', 'identity policies', YELLOW), at: [3, 0] },
    { node: comp('anat-resources', 'resources', GREEN), at: [4, 0] },
  ]),
)

// ─── CORP IDENTITY PROVIDER ──────────────────────────────────────────────────

const corpIdp = container(
  { id: 'corp-idp', label: 'Corp IdP', color: GRAY },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.14, padding: 0.16 }, [
    { node: comp('grp-okta', 'Okta', GRAY), at: [0, 0] },
    { node: comp('grp-ad', 'Entra ID', GRAY), at: [0, 1] },
    { node: comp('grp-dev', 'Developers', GRAY), at: [0, 2] },
    { node: comp('grp-github', 'GitHub Act', GRAY), at: [0, 3] },
  ]),
)

// ─── AWS ORGANIZATIONS — Mgmt + Security OU + Workloads OU ──────────────────

const mgmtAcct = container(
  { id: 'mgmt-acct', label: 'mgmt-acct', color: ORANGE },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.18, padding: 0.2 }, [
    { node: comp('idc', 'IAM IdC', RED), at: [0, 0] },
    { node: chip('org-scps', 'Org SCPs', YELLOW), at: [1, 0] },
    { node: chip('org-billing', 'Billing', GRAY), at: [2, 0] },
  ]),
)

const securityOU = container(
  { id: 'sec-ou', label: 'Security OU', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.16, padding: 0.2 }, [
    { node: comp('sec-log-archive', 'Log Archive', GREEN), at: [0, 0] },
    { node: comp('sec-s3-central', 'S3-central', GREEN), at: [1, 0] },
    { node: comp('sec-cloudtrail', 'CloudTrail', PURPLE), at: [0, 1] },
    { node: chip('sec-objlock', 'Obj Lock', RED), at: [1, 1] },
  ]),
)

const workloadsOU = container(
  { id: 'wl-ou', label: 'Workloads OU', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.18, padding: 0.2 }, [
    { node: comp('acct-dev', 'Dev', ORANGE), at: [0, 0] },
    { node: comp('acct-prod', 'Prod', ORANGE), at: [1, 0] },
  ]),
)

const org = container(
  { id: 'org', label: 'AWS Organizations', color: YELLOW },
  wgrid({ cols: [1, 1], rows: [1, 1.6], gap: 0.25, padding: 0.32 }, [
    { node: mgmtAcct, at: [0, 0, 2, 1] },
    { node: securityOU, at: [0, 1] },
    { node: workloadsOU, at: [1, 1] },
  ]),
)

const story = container(
  { id: 'story', label: 'Story (Org + OUs + Accounts)', color: GRAY },
  wgrid({ cols: [1, 3.2], rows: [1], gap: 0.3, padding: 0.32 }, [
    { node: corpIdp, at: [0, 0] },
    { node: org, at: [1, 0] },
  ]),
)

// ─── INSIDE A WORKLOAD ACCOUNT ──────────────────────────────────────────────

const trustRolesBand = container(
  { id: 'trust-roles-band', label: 'Cross-acct trust roles', color: RED },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.18, padding: 0.22 }, [
    { node: chip('deployer-role', 'DeployerRole', RED), at: [0, 0] },
    { node: chip('breakglass-role', 'BreakGlassRole', RED), at: [1, 0] },
    { node: chip('auditread-role', 'AuditReadRole', RED), at: [2, 0] },
  ]),
)

const webTier = container(
  { id: 'web-tier', label: 'Web tier', color: BLUE },
  wgrid({ cols: [1], rows: [1], gap: 0.18, padding: 0.2 }, [{ node: chip('web-task-role', 'WebTaskRole', RED), at: [0, 0] }]),
)

const appTier = container(
  { id: 'app-tier', label: 'App tier', color: BLUE },
  wgrid({ cols: [1], rows: [1], gap: 0.18, padding: 0.2 }, [{ node: chip('app-task-role', 'AppTaskRole', RED), at: [0, 0] }]),
)

const dataTier = container(
  { id: 'data-tier', label: 'Data tier', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.14, padding: 0.2 }, [
    { node: chip('rds-mon-role', 'RDSMonRole', RED), at: [0, 0] },
    { node: chip('secrets-rot-role', 'SecretsRotRole', RED), at: [0, 1] },
  ]),
)

const workloadRolesBand = container(
  { id: 'workload-roles-band', label: 'Workload roles', color: BLUE },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.18, padding: 0.22 }, [
    { node: webTier, at: [0, 0] },
    { node: appTier, at: [1, 0] },
    { node: dataTier, at: [2, 0] },
  ]),
)

const workloadAcct = container(
  { id: 'workload-acct', label: 'Inside a Workload Account', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1.4], gap: 0.25, padding: 0.32 }, [
    { node: trustRolesBand, at: [0, 0] },
    { node: workloadRolesBand, at: [0, 1] },
  ]),
)

// ─── ROLE-ASSUMPTION HANDSHAKE: GitHub OIDC → DeployerRole ──────────────────

const callerSide = container(
  { id: 'caller-side', label: 'Caller — GitHub Actions', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.18, padding: 0.22 }, [
    { node: chip('oidc-token', 'OIDC token', PURPLE), at: [0, 0] },
    { node: chip('identity-policy', 'identity policy', YELLOW), at: [0, 1] },
  ]),
)

const stsMediator = container(
  { id: 'sts', label: 'STS', color: PURPLE },
  wgrid({ cols: [1], rows: [1], gap: 0.18, padding: 0.22 }, [
    { node: chip('sts-assume', 'AssumeRoleWithWebIdentity', PURPLE), at: [0, 0] },
  ]),
)

const roleSide = container(
  { id: 'role-side', label: 'DeployerRole — acct-prod', color: RED },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.18, padding: 0.22 }, [
    { node: chip('trust-policy', 'trust policy', YELLOW), at: [0, 0] },
    { node: chip('perm-policy', 'perm policy', YELLOW), at: [0, 1] },
    { node: comp('target-infra', 'target infra', GREEN), at: [0, 2] },
  ]),
)

const handshake = container(
  { id: 'handshake', label: 'Role-assumption handshake', color: PURPLE },
  wgrid({ cols: [1.2, 1, 1.4], rows: [1], gap: 0.25, padding: 0.32 }, [
    { node: callerSide, at: [0, 0] },
    { node: stsMediator, at: [1, 0] },
    { node: roleSide, at: [2, 0] },
  ]),
)

// ─── POLICY EVALUATION ──────────────────────────────────────────────────────

const evalCol = container(
  { id: 'eval-col', label: 'Policy Evaluation', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.2, padding: 0.22 }, [
    { node: chip('eval-scp', 'SCP', YELLOW), at: [0, 0] },
    { node: chip('eval-boundary', 'Boundary', YELLOW), at: [1, 0] },
    { node: chip('eval-identity', 'Identity', BLUE), at: [0, 1] },
    { node: chip('eval-resource', 'Resource', GREEN), at: [1, 1] },
    { node: chip('eval-session', 'Session', PURPLE), at: [0, 2] },
    { node: chip('eval-deny', 'Explicit Deny', RED), at: [1, 2] },
  ]),
)

// ─── ROOT ───────────────────────────────────────────────────────────────────

const root: SceneNodeSpec = group(
  'aws-iam-root',
  wgrid({ cols: [13, 11, 6], rows: [2.5, 8, 7.5], gap: 0.32, padding: 0.04 }, [
    { node: anatomyBanner, at: [0, 0, 3, 1] },
    { node: story, at: [0, 1, 2, 1] },
    { node: workloadAcct, at: [0, 2] },
    { node: handshake, at: [1, 2] },
    { node: evalCol, at: [2, 1, 1, 2] },
  ]),
)

export const awsIam: SceneSpec = {
  id: 'aws-iam',
  topic: 'aws',
  title: 'AWS IAM — identities, roles & policy evaluation',
  subtitle: 'Organizations → accounts → roles · the assume-role handshake · policy evaluation',
  // The source map's 30×18 frame (≈1.67:1).
  canvas: { width: 1440, height: 864 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // Federation: corp groups → IAM Identity Center
    { from: 'grp-okta', to: 'idc', label: 'SAML', color: PURPLE },
    { from: 'grp-ad', to: 'idc', label: 'SAML', color: PURPLE },
    { from: 'grp-dev', to: 'idc', label: 'OIDC', color: PURPLE },

    // IdC vends permission-set sessions into workload-account roles
    { from: 'idc', to: 'breakglass-role', label: 'mgmt + MFA', color: YELLOW },
    { from: 'idc', to: 'auditread-role', label: 'auditor session', color: YELLOW },

    // Org guardrails
    { from: 'org-scps', to: 'acct-prod', label: 'SCP: no RDS del w/o MFA', color: YELLOW },

    // Security OU — org-wide audit pipeline (CloudTrail → central S3 → object lock)
    { from: 'sec-cloudtrail', to: 'sec-s3-central', label: 'log delivery', color: GREEN },
    { from: 'sec-s3-central', to: 'sec-objlock', label: 'WORM', color: RED },

    // THE headline cross-account arrow: GitHub Actions federates to DeployerRole
    { from: 'grp-github', to: 'deployer-role', label: 'sts:AssumeRoleWithWebIdentity', color: ORANGE },

    // Handshake internals — STS brokers between caller and role
    { from: 'oidc-token', to: 'identity-policy', label: 'asserts identity', color: PURPLE },
    { from: 'identity-policy', to: 'sts-assume', label: 'AssumeRoleWithWebIdentity', color: ORANGE },
    { from: 'sts-assume', to: 'trust-policy', label: 'validates trust', color: PURPLE },
    { from: 'trust-policy', to: 'perm-policy', label: 'session created', color: RED },
    { from: 'perm-policy', to: 'target-infra', label: 'temp creds act', color: GREEN },

    // Evaluation chain (broad → narrow), plus deny-wins kill switch
    { from: 'eval-scp', to: 'eval-boundary', label: 'caps', color: YELLOW },
    { from: 'eval-boundary', to: 'eval-identity', label: 'caps', color: YELLOW },
    { from: 'eval-identity', to: 'eval-resource', label: 'either grants', color: BLUE },
    { from: 'eval-resource', to: 'eval-session', label: 'session filters', color: GREEN },
    { from: 'eval-deny', to: 'eval-scp', label: 'kills at any layer', color: RED },
  ],
}
