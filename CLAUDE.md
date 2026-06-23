# CLAUDE.md — graphl-ux

The **unified** node-graph learning/presentation app. It consolidates three
earlier prototypes into one codebase that works across mobile and desktop:

| Old app                       | Role it played                          | Folds into graphl-ux as |
| ----------------------------- | --------------------------------------- | ----------------------- |
| `../Projects/NodeMap`         | Desktop, R3F 3D, detailed concept learning | Canvas mode + content panel |
| `../Apps/graphl-mobile`       | Mobile PWA, vertical "reels" feed        | Feed mode               |
| `../Presentations/graphl-ui`  | Desktop, Udemy/presentation slides       | Canvas mode + content panel |

These three are the **same core**: declarative node-graph scenes → grid resolver
→ notebook + audio content. graphl-ux is that core, built **once**, with the
per-platform differences expressed as *modes*, not separate apps.

---

## Why this rewrite exists (read before changing direction)

The three prototypes each carry their own copy of the scene engine (grid
resolver, SceneNode/FlowEdge, SceneSpec). One maintainer cannot keep three
diverging copies healthy. graphl-ux replaces them with one engine + one content
model + thin UI shells/modes.

The owner built the prior apps with Claude Code in large batches and ended up
feeling **alien to the code**. graphl-ux is built the opposite way — see the
Working Agreement below. This is the most important rule in this file.

---

## Working agreement (HARD RULE — do not skip)

1. **Step by step, with review at each step.** Propose → get approval → implement
   one small slice → stop and let the owner review → only then continue. Never
   batch multiple features/files without a review gate in between.
2. **Explain before writing.** Before each slice, say in plain prose what it does,
   why, and what files it touches. Small enough that the owner can hold it in
   their head.
3. **The owner is involved.** Prefer changes the owner can read, run, and reason
   about. No silent scaffolding, no "I generated 12 files." If something needs
   many files, list them and get a yes first.
4. **Discuss design in prose, not question-pickers.** (Owner preference.)
5. **One concept per commit/slice.** Keep diffs small and named.

---

## Locked design decisions

These were settled by discussion. Don't relitigate without the owner.

- **Renderer: React Flow (`@xyflow/react`).** R3F / three.js is **dropped**. The
  only real loss is 3D z-depth (mostly novelty for a learning tool); React Flow
  covers nesting (parent nodes + `extent`) and the zoom-based **dot-collapse LOD**
  (drive it off the live viewport zoom instead of per-frame pixel measurement).
- **One canonical layout: portrait `800×1200` SceneSpec**, authored once, used on
  every platform. Rationale: on desktop the content panel takes ~half the width,
  so the canvas region is portrait-ish anyway; `fitView` scales the same scene to
  any device with no distortion. Panel-open on desktop tiles a 16:9 recording
  frame nicely (good for Udemy); panel-closed on wide screens pillarboxes (cosmetic,
  like Reels on desktop web — fill the margins with chrome).
- **Two interaction modes, toggled (defaulted by device, user can switch):**
  - **Feed mode** — one scene per viewport, vertical snap-paging, narration
    autoplay, panel as overlay caption. Mobile default.
  - **Canvas mode** — pan/zoom the full graph, user-paced, side **content panel**.
    Desktop default.
  Mode is an explicit toggle, NOT a responsive layout that stretches between the
  two. Build it the same way the content panel show/hide works.
- **Content panel: hidden by default, user toggles it** to read content (notebook
  section / slide) instead of / beside the diagram. Same mechanism powers feed↔canvas.
- **Content model: manifest + notebook-as-source-of-truth** (graphl-ui's model — the
  most mature of the three). The manifest only *wires* scene + highlights + audio
  per section; the notebook holds the prose/code. Audio/tts live in per-topic
  content repos fetched at runtime (keeps the app bundle tiny).
- **Authoring caveat:** strongly left→right pipeline scenes get cramped in a portrait
  canvas — author wide flows to **wrap/stack** rather than one long horizontal line.
- **Visual style: calm filled blocks, NOT neon.** Color lives in a muted *fill*
  (role hue ~30% over a dark base), not a glowing outline — no `box-shadow`,
  no backdrop-blur, no dotted grid. Flat neutral bg `#16181d`. Edges are plain
  gray with a small slow flow dot; bright color/motion is reserved for the
  (optional) narration spotlight. Semantic role colors are memory cues (driver=blue,
  executors=green, storage=orange, …). **Full spec: `apache-spark-content/DESIGN.md`** —
  read it before restyling. (We explicitly moved *off* the old neon look.)
- **Reel chrome (the shell around every scene):** a 2:3 portrait frame with a top
  **brand bar** (logo · topic · ☰ menu), a bottom-left **caption** (topic kicker ·
  title · subtitle), a bottom-right **play/pause**, and a **progress line pinned to
  the bottom edge** (zero layout cost). Modeled on graphl-mobile's reel.
- **Content panel UX:** hidden by default; toggled from a brand-bar button. When
  open it's a **resizable right sidebar** (drag its left edge, clamp 340px–60vw) and
  the **scene keeps the bulk** of the width. On narrow screens (<760px) it becomes a
  **full overlay sheet**, not a side split.
- **Panel drops notebook images.** The `.ipynb` diagram images (`![]()`) are stripped
  by the parser — our React Flow **scenes ARE those diagrams**, so rendering them in
  the panel would duplicate the canvas. A section with an image but no scene = a
  signal to author a scene, not inline a picture. (Fenced ASCII/`text` blocks stay.)
- **Navigation:** the manifest maps each `##` section → a scene; ◀▶ (arrow keys or
  the panel stepper) swaps the **scene + panel + caption + audio** together. The
  scene remounts on `sceneId` change to refit; sections sharing a scene don't remount.

---

## Scene = SceneSpec (the authoring contract)

Carried over from graphl-mobile / graphl-ui (the cleaner of the engines):
- A scene is declarative data: `{ id, grid, nodes, edges }`.
- Nodes carry a logical `cell: [col, row, colSpan?, rowSpan?]`; a recursive grid
  resolver converts cells → pixel boxes inside their parent's box (exact
  containment). Compose with pattern helpers (`rows`/`columns`/`pipeline`/`fanOut`/
  `hubSpoke`/`container`/`group`/`stack`) — don't hand-count cells.
- Node kinds: `symbol` | `term` | `container` | `group`.
- Render-free on purpose (an AI generator may emit SceneSpec later).

---

## Structure (as built)

```
graphl-ux/
  apache-spark-content/     # the Spark content repo (see its README + DESIGN + MODULES)
    manifest.json           #   wires sections → scene/spine/audio per module
    notebooks/ scenes/ tts/ audio/
  src/
    engine/                 # the visual engine
      types.ts              #   SceneSpec authoring contract
      colors.ts             #   semantic role palette + bg/edge (calm, see DESIGN.md)
      grid.ts               #   resolveGrid: cell → pixel boxes (recursive, +DEV validate)
      patterns.ts           #   rows/columns/pipeline/fanOut/hubSpoke/container/group/stack
      SceneNode.tsx         #   symbol/term/container/group node
      FlowEdge.tsx          #   flow-in-path edge + edge labels
      SceneViewer.tsx       #   React Flow wrapper, fitView + refit-on-resize
      scene.css
    content/
      notebook.ts           #   parseNotebook: .ipynb → Section[] (strips images)
      module.ts             #   buildPages: sections + manifest overlay → Page[]
    scenes/
      index.ts              #   scene registry (id → SceneSpec)
      spark-cluster.ts, spark-execution.ts
    components/
      RightPanel.tsx, panel.css   # the content panel (markdown render + resize)
    App.tsx                 # the shell: scene + reel chrome + panel + nav
    index.css
```

Migration note: NodeMap has 50+ scenes in a `tree + connections` format that could
be converted to `SceneSpec` (`nodes + edges`) — the long pole if we pursue it. Open
question: migrate all, or re-author the good ones. (Current focus is Apache Spark
content built fresh, not migrating NodeMap.)

---

## Stack (as built)

- React 19 + TypeScript + **Vite 6**; React Flow (`@xyflow/react` 12).
- Content panel: `react-markdown` + `remark-gfm` (tables) + `rehype-highlight` +
  `highlight.js` (github-dark theme).
- **Plain CSS, no Tailwind** — we style with focused `.css` files to keep deps minimal.
- In-repo imports use explicit `.ts`/`.tsx` extensions. `npm run build`
  (`tsc -b && vite build`) is the verification gate. (Linter still TODO.)

## Status

Apache Spark **module 01** is wired end-to-end (build target: mobile reels + Udemy):
- Engine + pattern helpers ported from graphl-mobile (calm-restyled).
- Two scenes built: `spark-cluster`, `spark-execution`.
- Reel chrome (brand bar · caption · play/pause · edge progress), real narration
  audio wired (per-scene), and the calm visual style locked (`DESIGN.md`).
- Content panel: notebook 01 parsed → sections, rendered (prose/tables/code), images
  stripped; hidden-by-default, toggleable, resizable sidebar; mobile overlay.
- **Navigation is manifest-driven**: ◀▶ / arrow keys swap scene + panel + caption +
  audio per section (21/21 sections matched to scenes).

**Interim shortcuts (flagged in code, to replace):**
1. The notebook + audio are **bundled** via direct import. The proper path is the
   runtime content client fetching from the served content repo (keeps `dist` tiny).
2. **Audio is per-scene**, not per-section — needs per-section TTS clips generated.
3. Scenes `aqe` and `spark-connect` aren't built; those sections fall back to
   `defaultScene` (`spark-cluster`).

**Likely next:** build `aqe`/`spark-connect` scenes · the real content loader (stop
bundling) · the ☰ sections drawer · feed mode · the optional amber narration spotlight.
