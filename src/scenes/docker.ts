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

// The WHOLE Docker platform on one wide map — ported from NodeMap's `docker.ts`
// (`~/Projects/NodeMap/src/data/scenes/docker.ts`). Two bands:
//   TOP    spine  — Client (docker CLI) | Docker Host (Engine · Images · Containers) | Registry
//   BOTTOM detail — Author (Dockerfile · Layer model) | Resources (Volumes · Networks · Ports) | Orchestrate (Compose · Swarm · Cluster net · Security)
// Geometry is the lesson: the daemon stack (dockerd → containerd → runc) sits at the
// center; everything points at the container it builds, runs, or constrains. This is
// the single dense scene every docker-content module rides (the camera frames one
// subsystem per section via the manifest `highlight`).  Faithful transcription: same
// node ids (`dk-*`), same colors, same weighted grid tracks — only the dialect changes.
//
// Palette maps 1:1 to graphl-ux roles: BLUE=client CLI, ORANGE=daemon/host/images,
// YELLOW=authoring & build cache, RED=container isolation + security, GREEN=lifecycle,
// TEAL=resources, PURPLE=registry + orchestration, GRAY=inert wrappers.
//
// One deviation (shared with the linux/sql ports): graphl-ux pads by a fraction of a
// CELL, so the source's 0.3 padding on a 1-COLUMN stack becomes a huge side gutter.
// Those stacks use a small padding here so children fill the column; multi-column
// paddings pass through unchanged.

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
  { id: 'dk-client', label: 'Client', color: BLUE },
  wgrid({ cols: [1], rows: [1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'dk-cli', label: 'docker CLI', color: BLUE },
        wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-run', 'run', BLUE), at: [0, 0] },
          { node: chip('dk-build', 'build', BLUE), at: [1, 0] },
          { node: chip('dk-pull', 'pull', BLUE), at: [0, 1] },
          { node: chip('dk-push', 'push', BLUE), at: [1, 1] },
          { node: chip('dk-exec', 'exec', BLUE), at: [0, 2] },
          { node: chip('dk-ps', 'ps', BLUE), at: [1, 2] },
          { node: chip('dk-logs', 'logs', BLUE), at: [0, 3] },
          { node: chip('dk-inspect', 'inspect', BLUE), at: [1, 3] },
        ]),
      ),
      at: [0, 0],
    },
  ]),
)

// ─── DOCKER HOST (the spine) ─────────────────────────────────────────────────

const engineBox = container(
  { id: 'dk-engine', label: 'Engine', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.08 }, [
    { node: comp('dk-engine-cli', 'docker CLI', ORANGE), at: [0, 0] },
    { node: comp('dk-dockerd', 'dockerd', ORANGE), at: [0, 1] },
    { node: comp('dk-containerd', 'containerd', ORANGE), at: [0, 2] },
    { node: comp('dk-runc', 'runc', ORANGE), at: [0, 3] },
  ]),
)

const imagesBox = container(
  { id: 'dk-images', label: 'Images', color: ORANGE },
  wgrid({ cols: [1], rows: [1, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'dk-image', label: 'Image', color: ORANGE },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-layer', 'layer', ORANGE), at: [0, 0] },
          { node: chip('dk-manifest', 'manifest', ORANGE), at: [1, 0] },
          { node: chip('dk-digest', 'digest', ORANGE), at: [0, 1] },
          { node: chip('dk-img-tag', 'tag', ORANGE), at: [1, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'dk-build-cache', label: 'Build cache', color: YELLOW },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-buildkit', 'BuildKit', YELLOW), at: [0, 0, 2, 1] },
          { node: chip('dk-layer-cache', 'layer cache', YELLOW), at: [0, 1] },
          { node: chip('dk-multistage', 'multi-stage', YELLOW), at: [1, 1] },
        ]),
      ),
      at: [0, 1],
    },
  ]),
)

const containersBox = container(
  { id: 'dk-containers', label: 'Containers', color: ORANGE },
  wgrid({ cols: [1], rows: [1.4, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'dk-container', label: 'Container', color: RED },
        wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-ns-pid', 'pid ns', RED), at: [0, 0] },
          { node: chip('dk-ns-net', 'net ns', RED), at: [1, 0] },
          { node: chip('dk-ns-mnt', 'mnt ns', RED), at: [0, 1] },
          { node: chip('dk-ns-user', 'user ns', RED), at: [1, 1] },
          { node: chip('dk-ns-uts', 'uts/ipc', RED), at: [0, 2] },
          { node: chip('dk-cgroups', 'cgroups', RED), at: [1, 2] },
          { node: chip('dk-caps', 'caps', RED), at: [0, 3, 2, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'dk-lifecycle', label: 'Lifecycle', color: GREEN },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-create', 'create', GREEN), at: [0, 0] },
          { node: chip('dk-start', 'start', GREEN), at: [1, 0] },
          { node: chip('dk-stop', 'stop', GREEN), at: [0, 1] },
          { node: chip('dk-rm', 'rm', GREEN), at: [1, 1] },
        ]),
      ),
      at: [0, 1],
    },
  ]),
)

const hostCol = container(
  { id: 'dk-host', label: 'Docker Host', color: ORANGE },
  wgrid({ cols: [1, 1.3, 1.3], rows: [1], gap: G, padding: P }, [
    { node: engineBox, at: [0, 0] },
    { node: imagesBox, at: [1, 0] },
    { node: containersBox, at: [2, 0] },
  ]),
)

// ─── REGISTRY (right of spine) ───────────────────────────────────────────────

const registryCol = container(
  { id: 'dk-registry', label: 'Registry', color: PURPLE },
  wgrid({ cols: [1], rows: [1, 1, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'dk-reg-stores', label: 'Stores', color: PURPLE },
        wgrid({ cols: [1], rows: [1, 1], gap: 0.15, padding: 0.08 }, [
          { node: comp('dk-hub', 'Docker Hub', PURPLE), at: [0, 0] },
          { node: comp('dk-private', 'Private registry', PURPLE), at: [0, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'dk-reg-identity', label: 'Identity', color: PURPLE },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-tag', 'name:tag', PURPLE), at: [0, 0] },
          { node: chip('dk-digest-pin', '@sha256', PURPLE), at: [1, 0] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'dk-reg-dist', label: 'Distribution', color: PURPLE },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-reg-push', 'push', PURPLE), at: [0, 0] },
          { node: chip('dk-reg-pull', 'pull', PURPLE), at: [1, 0] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

// ─── TOP BAND: Client | Docker Host | Registry ──────────────────────────────

const spine = group(
  'dk-spine',
  wgrid({ cols: [1, 3.4, 1.1], rows: [1], gap: 0.4, padding: 0 }, [
    { node: clientCol, at: [0, 0] },
    { node: hostCol, at: [1, 0] },
    { node: registryCol, at: [2, 0] },
  ]),
)

// ─── BOTTOM BAND: Author | Resources | Orchestrate ──────────────────────────

const authorCol = container(
  { id: 'dk-author', label: 'Author', color: YELLOW },
  wgrid({ cols: [1], rows: [1.6, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'dk-dockerfile', label: 'Dockerfile', color: YELLOW },
        wgrid({ cols: [1, 1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-df-from', 'FROM', YELLOW), at: [0, 0] },
          { node: chip('dk-df-arg', 'ARG', YELLOW), at: [1, 0] },
          { node: chip('dk-df-run', 'RUN', YELLOW), at: [0, 1] },
          { node: chip('dk-df-copy', 'COPY', YELLOW), at: [1, 1] },
          { node: chip('dk-df-env', 'ENV', YELLOW), at: [0, 2] },
          { node: chip('dk-df-workdir', 'WORKDIR', YELLOW), at: [1, 2] },
          { node: chip('dk-df-cmd', 'CMD', YELLOW), at: [0, 3] },
          { node: chip('dk-df-entry', 'ENTRYPOINT', YELLOW), at: [1, 3] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'dk-layer-model', label: 'Layer model', color: ORANGE },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-unionfs', 'union FS', ORANGE), at: [0, 0] },
          { node: chip('dk-overlay2', 'overlay2', ORANGE), at: [1, 0] },
        ]),
      ),
      at: [0, 1],
    },
  ]),
)

const resourcesCol = container(
  { id: 'dk-resources', label: 'Resources', color: TEAL },
  wgrid({ cols: [1, 1], rows: [1, 1], gap: G, padding: P }, [
    {
      node: container(
        { id: 'dk-volumes', label: 'Volumes', color: TEAL },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-vol-named', 'named', TEAL), at: [0, 0] },
          { node: chip('dk-vol-bind', 'bind', TEAL), at: [1, 0] },
          { node: chip('dk-vol-tmpfs', 'tmpfs', TEAL), at: [0, 1] },
          { node: chip('dk-vol-driver', 'driver', TEAL), at: [1, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'dk-networks', label: 'Networks', color: TEAL },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-net-bridge', 'bridge', TEAL), at: [0, 0] },
          { node: chip('dk-net-host', 'host', TEAL), at: [1, 0] },
          { node: chip('dk-net-overlay', 'overlay', TEAL), at: [0, 1] },
          { node: chip('dk-net-none', 'none', TEAL), at: [1, 1] },
        ]),
      ),
      at: [1, 0],
    },
    {
      node: container(
        { id: 'dk-ports', label: 'Ports', color: TEAL },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-port-publish', '-p host:ctr', TEAL), at: [0, 0] },
          { node: chip('dk-port-expose', 'EXPOSE', TEAL), at: [1, 0] },
        ]),
      ),
      at: [0, 1, 2, 1],
    },
  ]),
)

const orchestrateCol = container(
  { id: 'dk-orchestrate', label: 'Orchestrate', color: PURPLE },
  wgrid({ cols: [1, 1], rows: [1.2, 1.2, 1], gap: G, padding: P }, [
    {
      node: container(
        { id: 'dk-compose', label: 'Compose', color: PURPLE },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-cmp-services', 'services', PURPLE), at: [0, 0] },
          { node: chip('dk-cmp-networks', 'networks', PURPLE), at: [1, 0] },
          { node: chip('dk-cmp-volumes', 'volumes', PURPLE), at: [0, 1] },
          { node: chip('dk-cmp-depends', 'depends_on', PURPLE), at: [1, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'dk-swarm', label: 'Swarm', color: PURPLE },
        wgrid({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-sw-manager', 'manager', PURPLE), at: [0, 0] },
          { node: chip('dk-sw-worker', 'worker', PURPLE), at: [1, 0] },
          { node: chip('dk-sw-service', 'service', PURPLE), at: [0, 1] },
          { node: chip('dk-sw-task', 'task', PURPLE), at: [1, 1] },
        ]),
      ),
      at: [1, 0],
    },
    {
      node: container(
        { id: 'dk-sw-net', label: 'Cluster net', color: PURPLE },
        wgrid({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-sw-overlay-net', 'overlay net', PURPLE), at: [0, 0] },
          { node: chip('dk-sw-mesh', 'routing mesh', PURPLE), at: [1, 0] },
        ]),
      ),
      at: [0, 1, 2, 1],
    },
    {
      node: container(
        { id: 'dk-security', label: 'Security', color: RED },
        wgrid({ cols: [1, 1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('dk-sec-rootless', 'rootless', RED), at: [0, 0] },
          { node: chip('dk-sec-secrets', 'secrets', RED), at: [1, 0] },
          { node: chip('dk-sec-scan', 'scan', RED), at: [2, 0] },
          { node: chip('dk-sec-sbom', 'SBOM', RED), at: [3, 0] },
          { node: chip('dk-sec-seccomp', 'seccomp', RED), at: [0, 1] },
          { node: chip('dk-sec-apparmor', 'AppArmor', RED), at: [1, 1] },
          { node: chip('dk-sec-capsdrop', 'caps drop', RED), at: [2, 1] },
          { node: chip('dk-sec-readonly', 'read-only', RED), at: [3, 1] },
        ]),
      ),
      at: [0, 2, 2, 1],
    },
  ]),
)

const detail = group(
  'dk-detail',
  wgrid({ cols: [1.1, 1.5, 1.6], rows: [1], gap: 0.4, padding: 0 }, [
    { node: authorCol, at: [0, 0] },
    { node: resourcesCol, at: [1, 0] },
    { node: orchestrateCol, at: [2, 0] },
  ]),
)

// ─── ARCHITECTURE FRAME ──────────────────────────────────────────────────────

// No outer "Docker" container: the concept name already lives in the brand bar +
// caption, so a labeled wrapper frame is a redundant tautology that only steals a
// title band + padding gutter from the two bands. An invisible `group` keeps the
// 4.5/3.5 spine-over-detail split without the chrome.
const architecture: SceneNodeSpec = group(
  'dk-root',
  wgrid({ cols: [1], rows: [4.5, 3.5], gap: 0.5, padding: 0.04 }, [
    { node: spine, at: [0, 0] },
    { node: detail, at: [0, 1] },
  ]),
)

export const docker: SceneSpec = {
  id: 'docker',
  topic: 'docker',
  title: 'Docker — the full platform',
  subtitle: 'client → daemon → image/container → registry → orchestration',
  // The source map's 30×22 frame (≈1.36:1) so the two bands keep their shape.
  canvas: { width: 1440, height: 1056 },
  grid: { cols: 1, rows: 1, gap: 0, padding: 0.05 },
  nodes: [architecture],
  edges: [
    // ── Canonical three-arrow flow: Client → Daemon → Image → Container ────────
    { from: 'dk-run', to: 'dk-dockerd', label: 'docker run', color: BLUE },
    { from: 'dk-build', to: 'dk-dockerd', label: 'docker build', color: BLUE },
    { from: 'dk-pull', to: 'dk-dockerd', label: 'docker pull', color: BLUE },
    { from: 'dk-push', to: 'dk-dockerd', label: 'docker push', color: BLUE },

    // ── Daemon stack delegation (the chain DCA tests on) ──────────────────────
    { from: 'dk-dockerd', to: 'dk-containerd', label: 'OCI gRPC', color: ORANGE },
    { from: 'dk-containerd', to: 'dk-runc', label: 'spawn', color: ORANGE },
    { from: 'dk-runc', to: 'dk-container', label: 'ns+cgroups', color: RED },

    // ── Local image → container (run path) ────────────────────────────────────
    { from: 'dk-dockerd', to: 'dk-image', label: 'resolve', color: ORANGE },
    { from: 'dk-image', to: 'dk-container', label: 'instantiate', color: ORANGE },

    // ── Registry ↔ local image cache ──────────────────────────────────────────
    { from: 'dk-dockerd', to: 'dk-registry', label: 'pull', color: PURPLE },
    { from: 'dk-registry', to: 'dk-image', label: 'fetch', color: PURPLE },
    { from: 'dk-image', to: 'dk-registry', label: 'push', color: PURPLE },
    { from: 'dk-tag', to: 'dk-image', label: 'names', color: PURPLE },
    { from: 'dk-digest-pin', to: 'dk-image', label: 'pins', color: PURPLE },

    // ── Build path: Dockerfile → cache → image layers ─────────────────────────
    { from: 'dk-dockerfile', to: 'dk-buildkit', label: 'parse', color: YELLOW },
    { from: 'dk-buildkit', to: 'dk-layer-cache', label: 'reuse', color: YELLOW },
    { from: 'dk-buildkit', to: 'dk-layer', label: 'emit', color: YELLOW },
    { from: 'dk-multistage', to: 'dk-image', label: 'slim final', color: YELLOW },
    { from: 'dk-unionfs', to: 'dk-layer', label: 'stacks', color: ORANGE },
    { from: 'dk-overlay2', to: 'dk-unionfs', label: 'impl', color: ORANGE },

    // ── Lifecycle verbs target the container ──────────────────────────────────
    { from: 'dk-create', to: 'dk-container', label: 'allocate', color: GREEN },
    { from: 'dk-start', to: 'dk-container', label: 'PID 1', color: GREEN },
    { from: 'dk-stop', to: 'dk-container', label: 'SIGTERM', color: GREEN },
    { from: 'dk-rm', to: 'dk-container', label: 'reap', color: GREEN },

    // ── CLI inspection verbs hit the daemon ───────────────────────────────────
    { from: 'dk-ps', to: 'dk-dockerd', label: 'list', color: BLUE },
    { from: 'dk-logs', to: 'dk-dockerd', label: 'stream', color: BLUE },
    { from: 'dk-inspect', to: 'dk-dockerd', label: 'json', color: BLUE },
    { from: 'dk-exec', to: 'dk-container', label: 'enter ns', color: BLUE },

    // ── Resources attach TO containers ────────────────────────────────────────
    { from: 'dk-volumes', to: 'dk-container', label: 'mount', color: TEAL },
    { from: 'dk-networks', to: 'dk-container', label: 'attach', color: TEAL },
    { from: 'dk-ports', to: 'dk-container', label: 'publish', color: TEAL },

    // ── Orchestrators drive the daemon ────────────────────────────────────────
    { from: 'dk-compose', to: 'dk-dockerd', label: 'API (local)', color: PURPLE },
    { from: 'dk-swarm', to: 'dk-dockerd', label: 'API (cluster)', color: PURPLE },
    { from: 'dk-sw-task', to: 'dk-container', label: 'instance of', color: PURPLE },
    { from: 'dk-sw-service', to: 'dk-sw-task', label: 'spawns N', color: PURPLE },
    { from: 'dk-sw-overlay-net', to: 'dk-net-overlay', label: 'uses', color: PURPLE },

    // ── Security constrains the container ─────────────────────────────────────
    { from: 'dk-security', to: 'dk-container', label: 'constrains', color: RED },
    { from: 'dk-sec-seccomp', to: 'dk-caps', label: 'syscall filter', color: RED },
    { from: 'dk-sec-rootless', to: 'dk-ns-user', label: 'remap uid', color: RED },
    { from: 'dk-sec-secrets', to: 'dk-container', label: 'tmpfs inject', color: RED },
  ],
}
