import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import {
  container,
  group,
  type NodeSeed,
  type PatternResult,
  type WeightedSeed,
  type WeightedSpec,
} from '../engine/patterns.ts'
import { BLUE, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// The WHOLE Kubernetes platform on one wide map — ported from NodeMap's `kubernetes.ts`
// (`~/Projects/NodeMap/src/data/scenes/kubernetes.ts`). Two bands:
//   TOP    spine  — Client (kubectl) | Cluster (Control Plane · Worker Node) | Registry
//   BOTTOM detail — Workloads (Pod · Workload kinds · Rollout) | Resources (Storage · Networking · Config) | Operate (Scheduling · RBAC · Security)
// Geometry is the lesson: the api-server sits at the center of the control plane; every
// kubectl verb points at it, the scheduler/controllers watch it, the kubelet executes its
// decisions, and every workload/resource/policy resolves onto the Pods it governs. This is
// the single dense scene every kubernetes-content module rides (the camera frames one
// subsystem per section via the manifest `highlight`/`focus`).  Faithful transcription:
// same node ids (`k8s-*`), same colors, same weighted grid tracks — only the dialect changes.
//
// Palette maps 1:1 to graphl-ux roles: BLUE=client (kubectl), ORANGE=control plane / node
// runtime, RED=Pods + security, YELLOW=workloads, TEAL=resources (storage/net/config),
// PURPLE=registry + scheduling + RBAC, GREEN=rollout lifecycle, GRAY=inert wrappers.
//
// One deviation (shared with the docker/linux/sql ports): graphl-ux pads by a fraction of a
// CELL, so the source's 0.3 padding on a 1-COLUMN stack becomes a huge side gutter. Those
// stacks use a small padding here so children fill the column; multi-column paddings pass
// through unchanged.

const G = 0.25
const P = 0.3

/** A NodeMap bare titled leaf → graphl-ux `symbol`: glyph + label. */
const comp = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'symbol' })

/** A NodeMap `term()` chip → graphl-ux `term`: a filled chip whose text IS the concept. */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term' })

/** Native weighted-track authoring: the grid carries relative track WEIGHTS and each
 *  child's `at` becomes its `cell`, indexing those tracks 1:1 (engine resolves arrays). */
const wgrid = (spec: WeightedSpec, children: WeightedSeed[]): PatternResult => ({
  grid: spec,
  nodes: children.map(({ node, at }) => ({ ...node, cell: at })),
})

// ─── CLIENT (left of spine) ──────────────────────────────────────────────────

const clientCol = container(
  { id: 'k8s-client', label: 'Client', color: BLUE },
  wgrid({ cols: [1], rows: [1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'k8s-kubectl', label: 'kubectl', color: BLUE },
        wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-kc-apply', 'apply', BLUE), at: [0, 0] },
          { node: chip('k8s-kc-get', 'get', BLUE), at: [1, 0] },
          { node: chip('k8s-kc-describe', 'describe', BLUE), at: [0, 1] },
          { node: chip('k8s-kc-logs', 'logs', BLUE), at: [1, 1] },
          { node: chip('k8s-kc-exec', 'exec', BLUE), at: [0, 2] },
          { node: chip('k8s-kc-pf', 'port-forward', BLUE), at: [1, 2] },
          { node: chip('k8s-kc-rollout', 'rollout', BLUE), at: [0, 3] },
          { node: chip('k8s-kc-scale', 'scale', BLUE), at: [1, 3] },
        ]),
      ),
      at: [0, 0],
    },
  ]),
)

// ─── CLUSTER (the spine) ─────────────────────────────────────────────────────

const controlPlaneBox = container(
  { id: 'k8s-control-plane', label: 'Control Plane', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
    { node: comp('k8s-apiserver', 'kube-apiserver', ORANGE), at: [0, 0] },
    { node: comp('k8s-etcd', 'etcd', ORANGE), at: [0, 1] },
    { node: comp('k8s-scheduler', 'kube-scheduler', ORANGE), at: [0, 2] },
    { node: comp('k8s-controllers', 'controller-manager', ORANGE), at: [0, 3] },
    { node: comp('k8s-ccm', 'cloud-controller-mgr', ORANGE), at: [0, 4] },
  ]),
)

const nodeRuntimeBox = container(
  { id: 'k8s-node-runtime', label: 'Node runtime', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: 0.15, padding: 0.08 }, [
    { node: comp('k8s-kubelet', 'kubelet', ORANGE), at: [0, 0] },
    { node: comp('k8s-kube-proxy', 'kube-proxy', ORANGE), at: [0, 1] },
    { node: comp('k8s-cri', 'CRI (containerd)', ORANGE), at: [0, 2] },
  ]),
)

const podsBox = container(
  { id: 'k8s-pods', label: 'Pods', color: RED },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
    { node: chip('k8s-pod-a', 'Pod', RED), at: [0, 0] },
    { node: chip('k8s-pod-b', 'Pod', RED), at: [1, 0] },
    { node: chip('k8s-pod-c', 'Pod', RED), at: [0, 1] },
    { node: chip('k8s-pod-d', 'Pod', RED), at: [1, 1] },
  ]),
)

const workerNode = container(
  { id: 'k8s-worker', label: 'Worker Node', color: ORANGE },
  wgrid({ cols: [1], rows: [1.2, 1], gap: G, padding: 0.08 }, [
    { node: nodeRuntimeBox, at: [0, 0] },
    { node: podsBox, at: [0, 1] },
  ]),
)

const clusterCol = container(
  { id: 'k8s-cluster', label: 'Cluster', color: ORANGE },
  wgrid({ cols: [1, 1.3], rows: [1], gap: G, padding: P }, [
    { node: controlPlaneBox, at: [0, 0] },
    { node: workerNode, at: [1, 0] },
  ]),
)

// ─── REGISTRY (right of spine) ───────────────────────────────────────────────

const registryCol = container(
  { id: 'k8s-registry', label: 'Registry', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'k8s-reg-stores', label: 'Stores', color: PURPLE },
        wgrid({ cols: [1], rows: [1, 1], gap: 0.15, padding: 0.08 }, [
          { node: comp('k8s-hub', 'Docker Hub', PURPLE), at: [0, 0] },
          { node: comp('k8s-private', 'Private registry', PURPLE), at: [0, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'k8s-reg-identity', label: 'Identity', color: PURPLE },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-tag', 'name:tag', PURPLE), at: [0, 0] },
          { node: chip('k8s-digest-pin', '@sha256', PURPLE), at: [1, 0] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'k8s-reg-pull-box', label: 'Pull', color: PURPLE },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-pullsecret', 'imagePullSecret', PURPLE), at: [0, 0] },
          { node: chip('k8s-pullpolicy', 'pull policy', PURPLE), at: [1, 0] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

// ─── TOP BAND: Client | Cluster | Registry ──────────────────────────────────

const spine = group(
  'k8s-spine',
  wgrid({ cols: [1, 3.4, 1.1], rows: [1], gap: 0.4, padding: 0 }, [
    { node: clientCol, at: [0, 0] },
    { node: clusterCol, at: [1, 0] },
    { node: registryCol, at: [2, 0] },
  ]),
)

// ─── BOTTOM BAND: Workloads | Resources | Operate ───────────────────────────

const workloadsCol = container(
  { id: 'k8s-workloads', label: 'Workloads', color: YELLOW },
  wgrid({ cols: [1], rows: [1.4, 1.6, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'k8s-pod-kind', label: 'Pod', color: YELLOW },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-pod-containers', 'containers', YELLOW), at: [0, 0] },
          { node: chip('k8s-pod-init', 'initContainers', YELLOW), at: [1, 0] },
          { node: chip('k8s-pod-sidecar', 'sidecar', YELLOW), at: [0, 1] },
          { node: chip('k8s-pod-probes', 'probes', YELLOW), at: [1, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'k8s-workload-kinds', label: 'Workload kinds', color: YELLOW },
        wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-deployment', 'Deployment', YELLOW), at: [0, 0] },
          { node: chip('k8s-replicaset', 'ReplicaSet', YELLOW), at: [1, 0] },
          { node: chip('k8s-statefulset', 'StatefulSet', YELLOW), at: [0, 1] },
          { node: chip('k8s-daemonset', 'DaemonSet', YELLOW), at: [1, 1] },
          { node: chip('k8s-job', 'Job', YELLOW), at: [0, 2] },
          { node: chip('k8s-cronjob', 'CronJob', YELLOW), at: [1, 2] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'k8s-rollout', label: 'Rollout', color: GREEN },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-ro-rolling', 'rolling', GREEN), at: [0, 0] },
          { node: chip('k8s-ro-recreate', 'recreate', GREEN), at: [1, 0] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

const resourcesCol = container(
  { id: 'k8s-resources', label: 'Resources', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1, 1], gap: G, padding: P }, [
    {
      node: container(
        { id: 'k8s-storage', label: 'Storage', color: TEAL },
        wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-pv', 'PV', TEAL), at: [0, 0] },
          { node: chip('k8s-pvc', 'PVC', TEAL), at: [1, 0] },
          { node: chip('k8s-sc', 'StorageClass', TEAL), at: [2, 0] },
          { node: chip('k8s-csi', 'CSI', TEAL), at: [3, 0] },
        ]),
      ),
      at: [0, 0, 2, 1],
    },
    {
      node: container(
        { id: 'k8s-networking', label: 'Networking', color: TEAL },
        wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-service', 'Service', TEAL), at: [0, 0] },
          { node: chip('k8s-ingress', 'Ingress', TEAL), at: [1, 0] },
          { node: chip('k8s-netpol', 'NetworkPolicy', TEAL), at: [2, 0] },
          { node: chip('k8s-dns', 'CoreDNS', TEAL), at: [3, 0] },
        ]),
      ),
      at: [0, 1, 2, 1],
    },
    {
      node: container(
        { id: 'k8s-config', label: 'Config', color: TEAL },
        wgrid({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-configmap', 'ConfigMap', TEAL), at: [0, 0] },
          { node: chip('k8s-secret', 'Secret', TEAL), at: [1, 0] },
          { node: chip('k8s-cfg-env', 'env / mount', TEAL), at: [2, 0] },
        ]),
      ),
      at: [0, 2, 2, 1],
    },
  ]),
)

const operateCol = container(
  { id: 'k8s-operate', label: 'Operate', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1.2, 1.2, 1], gap: G, padding: P }, [
    {
      node: container(
        { id: 'k8s-scheduling', label: 'Scheduling', color: PURPLE },
        wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-nodeselector', 'nodeSelector', PURPLE), at: [0, 0] },
          { node: chip('k8s-affinity', 'affinity', PURPLE), at: [1, 0] },
          { node: chip('k8s-taints', 'taints', PURPLE), at: [2, 0] },
          { node: chip('k8s-tolerations', 'tolerations', PURPLE), at: [0, 1] },
          { node: chip('k8s-requests', 'requests', PURPLE), at: [1, 1] },
          { node: chip('k8s-limits', 'limits', PURPLE), at: [2, 1] },
        ]),
      ),
      at: [0, 0, 2, 1],
    },
    {
      node: container(
        { id: 'k8s-rbac', label: 'RBAC', color: PURPLE },
        wgrid({ cols: [1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-role', 'Role', PURPLE), at: [0, 0] },
          { node: chip('k8s-rb', 'RoleBinding', PURPLE), at: [1, 0] },
          { node: chip('k8s-sa', 'ServiceAccount', PURPLE), at: [2, 0] },
          { node: chip('k8s-crole', 'ClusterRole', PURPLE), at: [0, 1] },
          { node: chip('k8s-crb', 'ClusterRoleBinding', PURPLE), at: [1, 1] },
          { node: chip('k8s-subject', 'subject', PURPLE), at: [2, 1] },
        ]),
      ),
      at: [0, 1, 2, 1],
    },
    {
      node: container(
        { id: 'k8s-security', label: 'Security', color: RED },
        wgrid({ cols: [1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('k8s-sec-psa', 'PSA', RED), at: [0, 0] },
          { node: chip('k8s-sec-seccomp', 'seccomp', RED), at: [1, 0] },
          { node: chip('k8s-sec-nonroot', 'runAsNonRoot', RED), at: [2, 0] },
          { node: chip('k8s-sec-readonly', 'read-only fs', RED), at: [3, 0] },
        ]),
      ),
      at: [0, 2, 2, 1],
    },
  ]),
)

const detail = group(
  'k8s-detail',
  wgrid({ cols: [1.1, 1.5, 1.6], rows: [1], gap: 0.4, padding: 0 }, [
    { node: workloadsCol, at: [0, 0] },
    { node: resourcesCol, at: [1, 0] },
    { node: operateCol, at: [2, 0] },
  ]),
)

// ─── ARCHITECTURE FRAME ──────────────────────────────────────────────────────

// No outer "Kubernetes" container: the concept name already lives in the brand bar +
// caption, so a labeled wrapper frame is a redundant tautology that only steals a
// title band + padding gutter from the two bands. An invisible `group` keeps the
// 4.5/3.5 spine-over-detail split without the chrome.
const architecture: SceneNodeSpec = group(
  'k8s-root',
  wgrid({ cols: [1], rows: [4.5, 3.5], gap: 0.5, padding: 0.04 }, [
    { node: spine, at: [0, 0] },
    { node: detail, at: [0, 1] },
  ]),
)

export const kubernetes: SceneSpec = {
  id: 'kubernetes',
  topic: 'kubernetes',
  title: 'Kubernetes — the full platform',
  subtitle: 'kubectl → api-server → control loop → Pods → resources → policy',
  // The source map's 30×22 frame (≈1.36:1) so the two bands keep their shape.
  canvas: { width: 1440, height: 1056 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [architecture],
  edges: [
    // ── kubectl verbs → api-server (the canonical entry) ──────────────────────
    { from: 'k8s-kc-apply', to: 'k8s-apiserver', label: 'POST/PATCH', color: BLUE },
    { from: 'k8s-kc-get', to: 'k8s-apiserver', label: 'LIST/GET', color: BLUE },
    { from: 'k8s-kc-describe', to: 'k8s-apiserver', label: 'GET', color: BLUE },
    { from: 'k8s-kc-rollout', to: 'k8s-apiserver', label: 'PATCH', color: BLUE },
    { from: 'k8s-kc-scale', to: 'k8s-apiserver', label: 'PATCH', color: BLUE },
    { from: 'k8s-kc-logs', to: 'k8s-kubelet', label: 'proxied', color: BLUE },
    { from: 'k8s-kc-exec', to: 'k8s-kubelet', label: 'SPDY', color: BLUE },
    { from: 'k8s-kc-pf', to: 'k8s-kubelet', label: 'stream', color: BLUE },

    // ── Control plane wiring (the reconciliation loop) ────────────────────────
    { from: 'k8s-apiserver', to: 'k8s-etcd', label: 'persist', color: ORANGE },
    { from: 'k8s-scheduler', to: 'k8s-apiserver', label: 'watch', color: ORANGE },
    { from: 'k8s-controllers', to: 'k8s-apiserver', label: 'watch', color: ORANGE },
    { from: 'k8s-scheduler', to: 'k8s-kubelet', label: 'bind Pod', color: ORANGE },

    // ── Worker node executes pods ─────────────────────────────────────────────
    { from: 'k8s-kubelet', to: 'k8s-cri', label: 'CRI gRPC', color: ORANGE },
    { from: 'k8s-cri', to: 'k8s-pods', label: 'spawn', color: ORANGE },
    { from: 'k8s-kube-proxy', to: 'k8s-service', label: 'iptables / IPVS', color: TEAL },

    // ── Registry ↔ kubelet (image pull) ───────────────────────────────────────
    { from: 'k8s-kubelet', to: 'k8s-registry', label: 'pull', color: PURPLE },
    { from: 'k8s-registry', to: 'k8s-pods', label: 'image', color: PURPLE },
    { from: 'k8s-pullsecret', to: 'k8s-registry', label: 'auth', color: PURPLE },
    { from: 'k8s-tag', to: 'k8s-pod-containers', label: 'names', color: PURPLE },

    // ── Workload ownership chain (Deployment → RS → Pod) ──────────────────────
    { from: 'k8s-deployment', to: 'k8s-replicaset', label: 'owns', color: YELLOW },
    { from: 'k8s-replicaset', to: 'k8s-pod-kind', label: 'owns', color: YELLOW },
    { from: 'k8s-statefulset', to: 'k8s-pod-kind', label: 'owns', color: YELLOW },
    { from: 'k8s-daemonset', to: 'k8s-pod-kind', label: 'one/node', color: YELLOW },
    { from: 'k8s-cronjob', to: 'k8s-job', label: 'spawns', color: YELLOW },
    { from: 'k8s-job', to: 'k8s-pod-kind', label: 'runs', color: YELLOW },
    { from: 'k8s-pod-kind', to: 'k8s-pods', label: 'instance of', color: YELLOW },

    // ── Rollout strategies drive Deployment ───────────────────────────────────
    { from: 'k8s-ro-rolling', to: 'k8s-deployment', label: 'default', color: GREEN },
    { from: 'k8s-ro-recreate', to: 'k8s-deployment', label: 'strategy', color: GREEN },

    // ── Resources attach to Pods ──────────────────────────────────────────────
    { from: 'k8s-pvc', to: 'k8s-pv', label: 'binds', color: TEAL },
    { from: 'k8s-sc', to: 'k8s-pv', label: 'provisions', color: TEAL },
    { from: 'k8s-csi', to: 'k8s-sc', label: 'driver', color: TEAL },
    { from: 'k8s-pvc', to: 'k8s-pods', label: 'mount', color: TEAL },
    { from: 'k8s-configmap', to: 'k8s-cfg-env', label: 'projects', color: TEAL },
    { from: 'k8s-secret', to: 'k8s-cfg-env', label: 'projects', color: TEAL },
    { from: 'k8s-cfg-env', to: 'k8s-pods', label: 'env / volume', color: TEAL },

    // ── Service / Ingress / DNS / NetworkPolicy ───────────────────────────────
    { from: 'k8s-service', to: 'k8s-pods', label: 'selects', color: TEAL },
    { from: 'k8s-ingress', to: 'k8s-service', label: 'routes', color: TEAL },
    { from: 'k8s-dns', to: 'k8s-service', label: 'resolves', color: TEAL },
    { from: 'k8s-netpol', to: 'k8s-pods', label: 'filters', color: TEAL },

    // ── Scheduling rules feed the scheduler ───────────────────────────────────
    { from: 'k8s-nodeselector', to: 'k8s-scheduler', label: 'pins', color: PURPLE },
    { from: 'k8s-affinity', to: 'k8s-scheduler', label: 'hint', color: PURPLE },
    { from: 'k8s-taints', to: 'k8s-scheduler', label: 'repels', color: PURPLE },
    { from: 'k8s-tolerations', to: 'k8s-taints', label: 'matches', color: PURPLE },
    { from: 'k8s-requests', to: 'k8s-scheduler', label: 'capacity', color: PURPLE },
    { from: 'k8s-limits', to: 'k8s-pods', label: 'cgroup', color: PURPLE },

    // ── RBAC gates kubectl → api-server ───────────────────────────────────────
    { from: 'k8s-rb', to: 'k8s-role', label: 'grants', color: PURPLE },
    { from: 'k8s-crb', to: 'k8s-crole', label: 'grants', color: PURPLE },
    { from: 'k8s-rb', to: 'k8s-subject', label: 'to', color: PURPLE },
    { from: 'k8s-sa', to: 'k8s-pods', label: 'token mount', color: PURPLE },
    { from: 'k8s-rbac', to: 'k8s-apiserver', label: 'authorizes', color: PURPLE },

    // ── Security constrains Pods ──────────────────────────────────────────────
    { from: 'k8s-security', to: 'k8s-pods', label: 'constrains', color: RED },
    { from: 'k8s-sec-psa', to: 'k8s-apiserver', label: 'admission', color: RED },
    { from: 'k8s-sec-seccomp', to: 'k8s-pods', label: 'syscall filter', color: RED },
  ],
}
