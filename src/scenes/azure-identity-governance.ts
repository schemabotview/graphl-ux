import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, type NodeSeed, type PatternResult, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, YELLOW } from '../engine/colors.ts'

// Azure Identity & Governance on one map — ported from NodeMap's
// `azure-identity-governance.ts`. A 3×3 layout:
//   TOP BANNER  the anatomy of every Azure access decision (tenant · subscription ·
//              resource group · principal · role assignment).
//   ROW 2 LEFT  Entra ID — the tenant identity plane (identity sources · human
//              principals · workload principals · sign-in plane).
//   ROW 2 MID   Azure Resource Manager — the scope ladder (Tenant Root MG → MG →
//              Subscription → Resource Group → Resource; assignments cascade down).
//   ROW 2 RIGHT the enforcement planes (Azure Policy · Resource Locks · DenyAssignment ·
//              the RBAC role × principal × scope tuple).
//   BOTTOM      the workload-identity-federation handshake (GitHub OIDC → Entra broker →
//              App Reg's federated cred + role assignment → target resource).
// This is the dense scene module 02 (Identity, Governance & Access) rides; the manifest
// frames one subsystem per section via highlight/focus. Faithful transcription: same node
// ids (`azid-*`), same colors, same weighted tracks — only the dialect changes
// (NodeMap GridNode → graphl-ux container/group/chip/comp + native weighted grids).

/** A NodeMap bare titled leaf → graphl-ux `symbol`: glyph + label (+ optional sub). */
const comp = (id: string, label: string, color: string, sub?: string): NodeSeed => ({ id, label, color, kind: 'symbol', sub })

/** A NodeMap `term()` chip → graphl-ux `term`: a filled chip whose text IS the concept. */
const chip = (id: string, label: string, color: string, sub?: string): NodeSeed => ({ id, label, color, kind: 'term', sub })

const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── ANATOMY BANNER — five things that define every Azure access decision ───

const anatomyBanner = container(
  { id: 'azid-anatomy-banner', label: 'Anatomy of Azure access', color: GRAY },
  wgrid({ cols: [1, 1, 1, 1, 1], rows: [1], gap: 0.3, padding: 0.32 }, [
    { node: comp('azid-anat-tenant', 'tenant', PURPLE, 'Entra directory'), at: [0, 0] },
    { node: comp('azid-anat-sub', 'subscription', ORANGE, 'billing + scope'), at: [1, 0] },
    { node: comp('azid-anat-rg', 'resource group', GREEN, 'lifecycle group'), at: [2, 0] },
    { node: comp('azid-anat-principal', 'principal', BLUE, 'user / SP / MI'), at: [3, 0] },
    { node: comp('azid-anat-rbac', 'role assignment', RED, 'role × scope'), at: [4, 0] },
  ]),
)

// ─── ENTRA ID — tenant identity plane (LEFT) ────────────────────────────────

const hybridSources = container(
  { id: 'azid-hybrid-sources', label: 'Identity sources', color: GRAY },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.14, padding: 0.18 }, [
    { node: comp('azid-entra-connect', 'Entra Connect', GRAY, 'AD sync'), at: [0, 0] },
    { node: comp('azid-okta', 'Okta', GRAY, 'SAML fed'), at: [1, 0] },
    { node: chip('azid-b2b', 'B2B / B2C', GRAY, 'external IDs'), at: [0, 1] },
    { node: comp('azid-github-fed', 'GitHub OIDC', GRAY, 'workload fed'), at: [1, 1] },
  ]),
)

const humanPrincipals = container(
  { id: 'azid-human-principals', label: 'Human principals', color: BLUE },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.14, padding: 0.18 }, [
    { node: comp('azid-users', 'Users', BLUE), at: [0, 0] },
    { node: comp('azid-groups', 'Groups', BLUE), at: [1, 0] },
    { node: chip('azid-guests', 'Guests', BLUE), at: [2, 0] },
  ]),
)

const workloadPrincipals = container(
  { id: 'azid-workload-principals', label: 'Workload principals', color: RED },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.14, padding: 0.18 }, [
    { node: comp('azid-app-reg', 'App Registration', RED, 'global app def'), at: [0, 0] },
    { node: comp('azid-sp', 'Service Principal', RED, 'tenant instance'), at: [1, 0] },
    { node: chip('azid-sys-mi', 'System MI', RED, 'bound to resource'), at: [0, 1] },
    { node: chip('azid-ua-mi', 'User-asgn MI', RED, 'standalone'), at: [1, 1] },
  ]),
)

const signInPlane = container(
  { id: 'azid-signin-plane', label: 'Sign-in plane', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.14, padding: 0.18 }, [
    { node: chip('azid-cond-access', 'Conditional Access', PURPLE, 'user · device · risk'), at: [0, 0] },
    { node: chip('azid-pim', 'PIM', PURPLE, 'just-in-time role'), at: [1, 0] },
  ]),
)

const entraColumn = container(
  { id: 'azid-entra-col', label: 'Entra ID — tenant', color: PURPLE },
  wgrid({ cols: [1], rows: [1.5, 0.9, 1.6, 0.9], gap: 0.25, padding: 0.1 }, [
    { node: hybridSources, at: [0, 0] },
    { node: humanPrincipals, at: [0, 1] },
    { node: workloadPrincipals, at: [0, 2] },
    { node: signInPlane, at: [0, 3] },
  ]),
)

// ─── AZURE RESOURCE MANAGER — scope ladder (MIDDLE) ─────────────────────────

const rgApp = container(
  { id: 'azid-rg-app', label: 'rg-app', color: GREEN },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.14, padding: 0.2 }, [
    { node: comp('azid-vm', 'VM', GREEN, 'system MI'), at: [0, 0] },
    { node: comp('azid-funcapp', 'FuncApp', GREEN, 'user-asgn MI'), at: [1, 0] },
    { node: comp('azid-storage', 'Storage acct', GREEN), at: [0, 1] },
    { node: comp('azid-keyvault', 'Key Vault', GREEN), at: [1, 1] },
  ]),
)

const subProd = container(
  { id: 'azid-sub-prod', label: 'Sub-Prod', color: ORANGE },
  wgrid({ cols: [1, 1, 2.5], rows: [1], gap: 0.18, padding: 0.22 }, [
    { node: chip('azid-rg-network', 'rg-network', GREEN), at: [0, 0] },
    { node: chip('azid-rg-platform', 'rg-platform', GREEN), at: [1, 0] },
    { node: rgApp, at: [2, 0] },
  ]),
)

const mgWorkloads = container(
  { id: 'azid-mg-workloads', label: 'MG-Workloads', color: ORANGE },
  wgrid({ cols: [1, 4], rows: [1], gap: 0.2, padding: 0.25 }, [
    { node: chip('azid-sub-dev', 'Sub-Dev', ORANGE), at: [0, 0] },
    { node: subProd, at: [1, 0] },
  ]),
)

const mgPlatform = container(
  { id: 'azid-mg-platform', label: 'MG-Platform', color: ORANGE },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.18, padding: 0.22 }, [
    { node: chip('azid-sub-platform', 'Sub-Platform', ORANGE), at: [0, 0] },
    { node: comp('azid-log-analytics', 'Log Analytics', GREEN), at: [1, 0] },
  ]),
)

const armColumn = container(
  { id: 'azid-arm-col', label: 'Azure Resource Manager — scope ladder', color: YELLOW },
  wgrid({ cols: [1], rows: [0.5, 0.9, 3.6], gap: 0.25, padding: 0.1 }, [
    { node: chip('azid-tenant-root', 'Tenant Root MG', ORANGE, 'inheritance root'), at: [0, 0] },
    { node: mgPlatform, at: [0, 1] },
    { node: mgWorkloads, at: [0, 2] },
  ]),
)

// ─── ENFORCEMENT PLANES (RIGHT) ─────────────────────────────────────────────

const policyBlock = container(
  { id: 'azid-policy', label: 'Azure Policy effects', color: YELLOW },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.14, padding: 0.2 }, [
    { node: chip('azid-pol-deny', 'Deny', RED), at: [0, 0] },
    { node: chip('azid-pol-audit', 'Audit', YELLOW), at: [1, 0] },
    { node: chip('azid-pol-modify', 'Modify', BLUE), at: [0, 1] },
    { node: chip('azid-pol-dine', 'DINE', PURPLE), at: [1, 1] },
  ]),
)

const lockBlock = container(
  { id: 'azid-lock', label: 'Resource Lock', color: YELLOW },
  wgrid({ cols: [1, 1], rows: [1], gap: 0.14, padding: 0.18 }, [
    { node: chip('azid-lock-del', 'CanNotDelete', YELLOW), at: [0, 0] },
    { node: chip('azid-lock-ro', 'ReadOnly', YELLOW), at: [1, 0] },
  ]),
)

const denyBlock = container(
  { id: 'azid-deny-assign', label: 'DenyAssignment', color: RED },
  wgrid({ cols: [1], rows: [1], gap: 0.14, padding: 0.06 }, [
    { node: chip('azid-deny-override', 'overrides RBAC', RED), at: [0, 0] },
  ]),
)

const rbacAnatomy = container(
  { id: 'azid-rbac-assign', label: 'RBAC assignment', color: RED },
  wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.14, padding: 0.2 }, [
    { node: chip('azid-rbac-role', 'role', RED), at: [0, 0] },
    { node: chip('azid-rbac-principal', 'principal', BLUE), at: [1, 0] },
    { node: chip('azid-rbac-scope', 'scope', YELLOW), at: [2, 0] },
  ]),
)

const enforcementColumn = container(
  { id: 'azid-enforce-col', label: 'Enforcement planes', color: GREEN },
  wgrid({ cols: [1], rows: [1.6, 0.8, 0.8, 1.0], gap: 0.25, padding: 0.1 }, [
    { node: policyBlock, at: [0, 0] },
    { node: lockBlock, at: [0, 1] },
    { node: denyBlock, at: [0, 2] },
    { node: rbacAnatomy, at: [0, 3] },
  ]),
)

// ─── HANDSHAKE — GitHub OIDC → Entra → role assignment → ARM API ────────────

const callerSide = container(
  { id: 'azid-caller-side', label: 'GH Actions workflow', color: BLUE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.18, padding: 0.1 }, [
    { node: chip('azid-oidc-token', 'OIDC ID token', PURPLE, 'iss=github · sub=repo:env'), at: [0, 0] },
    { node: chip('azid-client-assertion', 'client_assertion', YELLOW, 'no secret on caller'), at: [0, 1] },
  ]),
)

const entraBroker = container(
  { id: 'azid-entra-broker', label: 'Entra ID broker', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1], gap: 0.18, padding: 0.1 }, [
    { node: chip('azid-token-endpoint', 'oauth2/v2.0/token', PURPLE), at: [0, 0] },
    { node: chip('azid-fed-validate', 'validate signature', PURPLE), at: [0, 1] },
  ]),
)

const targetSide = container(
  { id: 'azid-target-side', label: 'App Reg → SP @ scope', color: RED },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.18, padding: 0.1 }, [
    { node: chip('azid-fed-cred', 'federated cred', YELLOW, 'sub=repo:env trusts GH'), at: [0, 0] },
    { node: chip('azid-handshake-role', 'role assignment', RED, 'Contributor @ rg-app'), at: [0, 1] },
    { node: comp('azid-handshake-target', 'target resource', GREEN, 'Storage acct write'), at: [0, 2] },
  ]),
)

const handshake = container(
  { id: 'azid-handshake', label: 'Workload identity federation — GitHub → Azure', color: PURPLE },
  wgrid({ cols: [1.2, 1, 1.4], rows: [1], gap: 0.3, padding: 0.32 }, [
    { node: callerSide, at: [0, 0] },
    { node: entraBroker, at: [1, 0] },
    { node: targetSide, at: [2, 0] },
  ]),
)

// ─── ROOT ───────────────────────────────────────────────────────────────────

const root: SceneNodeSpec = group(
  'azure-identity-root',
  wgrid({ cols: [10, 14, 8], rows: [2.5, 12, 5.5], gap: 0.32, padding: 0.04 }, [
    { node: anatomyBanner, at: [0, 0, 3, 1] },
    { node: entraColumn, at: [0, 1] },
    { node: armColumn, at: [1, 1] },
    { node: enforcementColumn, at: [2, 1] },
    { node: handshake, at: [0, 2, 3, 1] },
  ]),
)

export const azureIdentityGovernance: SceneSpec = {
  id: 'azure-identity-governance',
  topic: 'azure',
  title: 'Azure Identity & Governance — Entra, scope & RBAC',
  subtitle: 'Entra ID tenant · ARM scope ladder · enforcement planes · workload identity federation',
  // The source map's 32×20 frame (1.6:1).
  canvas: { width: 1792, height: 1120 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [root],
  edges: [
    // Identity arrives in the tenant
    { from: 'azid-okta', to: 'azid-users', label: 'SAML', color: PURPLE },
    { from: 'azid-entra-connect', to: 'azid-users', label: 'AD sync', color: PURPLE },
    { from: 'azid-b2b', to: 'azid-guests', label: 'guest invite', color: PURPLE },
    { from: 'azid-github-fed', to: 'azid-app-reg', label: 'fed cred', color: ORANGE },

    // App reg ↔ SP, MIs bind to resources
    { from: 'azid-app-reg', to: 'azid-sp', label: 'tenant instance', color: RED },
    { from: 'azid-sys-mi', to: 'azid-vm', label: 'system-assigned', color: RED },
    { from: 'azid-ua-mi', to: 'azid-funcapp', label: 'user-assigned', color: RED },

    // RBAC role assignments at scope — cross-plane (Entra principal → ARM scope)
    { from: 'azid-sp', to: 'azid-rg-app', label: 'Contributor @ rg-app', color: RED },
    { from: 'azid-groups', to: 'azid-mg-workloads', label: 'Reader, inherits ↓', color: RED },
    { from: 'azid-vm', to: 'azid-keyvault', label: 'system MI: Secret Reader', color: RED },
    { from: 'azid-funcapp', to: 'azid-storage', label: 'UA MI: Blob Data Reader', color: RED },

    // Sign-in plane gates principals (pre-token)
    { from: 'azid-users', to: 'azid-cond-access', label: 'sign-in evaluated', color: PURPLE },
    { from: 'azid-cond-access', to: 'azid-pim', label: 'role activation', color: PURPLE },

    // Resource governance applied at scope (Policy / Lock / DenyAssignment)
    { from: 'azid-pol-deny', to: 'azid-sub-prod', label: 'deny: no public IPs', color: YELLOW },
    { from: 'azid-lock-del', to: 'azid-storage', label: 'CanNotDelete', color: YELLOW },
    { from: 'azid-deny-override', to: 'azid-rg-app', label: 'overrides RBAC', color: RED },

    // Scope inheritance — the Azure-unique cascade
    { from: 'azid-tenant-root', to: 'azid-mg-workloads', label: 'role assignments inherit ↓', color: ORANGE },

    // RBAC anatomy: role × principal × scope tuple
    { from: 'azid-rbac-role', to: 'azid-rbac-scope', label: 'role', color: RED },
    { from: 'azid-rbac-principal', to: 'azid-rbac-scope', label: 'principal', color: BLUE },

    // HANDSHAKE — GitHub Actions → Azure resource via workload identity federation
    { from: 'azid-github-fed', to: 'azid-oidc-token', label: 'OIDC ID token', color: ORANGE },
    { from: 'azid-oidc-token', to: 'azid-client-assertion', label: 'JWT bearer', color: PURPLE },
    { from: 'azid-client-assertion', to: 'azid-token-endpoint', label: 'POST /token', color: ORANGE },
    { from: 'azid-token-endpoint', to: 'azid-fed-validate', label: 'verify', color: PURPLE },
    { from: 'azid-fed-validate', to: 'azid-fed-cred', label: 'matches subject', color: PURPLE },
    { from: 'azid-fed-cred', to: 'azid-handshake-role', label: 'access token issued', color: RED },
    { from: 'azid-handshake-role', to: 'azid-handshake-target', label: 'ARM API call', color: GREEN },
  ],
}
