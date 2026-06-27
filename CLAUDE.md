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
- **One canonical layout: landscape `16:9` big map** (SUPERSEDES the earlier
  portrait `800×1200` decision — settled 2026-06-24). One dense spatial map per
  concept is the **single source of truth**, authored once at 16:9. Rationale: the
  spatial topology (Worker A *beside* Worker B, memory *nested in* heap, storage
  *under* the lakehouse) **is** the lesson — one retained big picture beats N small
  fragments the learner can't hold in memory. 16:9 = the Udemy/HD recording frame,
  so the primary (desktop video) target needs no re-fit.
  - **The phone is a viewport, not a smaller canvas.** A 16:9 map can't legibly
    `fitView` into 9:16, and reflowing nodes into a portrait column destroys the
    spatial model. So on mobile we **never show the whole map shrunk** — the camera
    frames one subsystem at a time (see the camera-focus spine below); pinch-out /
    a button returns the whole map with "you are here" lit. Rotating to landscape is
    a fallback, not the mechanism — at ~700px the abbreviated labels aren't readable,
    so rotation alone gives a silhouette, not the model.
  - **Panel-open keeps the canvas at 16:9.** On desktop the canvas box shrinks as the
    right panel opens but holds 16:9 (pillarbox the spare space); panel-**closed** =
    clean full-frame 16:9 for recording. On **mobile the map and the content panel are
    a toggle** (each full-screen, tap to swap) — NOT side-by-side and NOT a shrunk map
    behind text. Same show/hide mechanism as desktop, different layout.
- **Camera-focus spine (how a linear walkthrough rides one big map).** Each section
  carries an optional **`focus`** target (node id / region) alongside the existing
  **`highlight`** (spotlight + dim the rest). Paging moves the camera to that region:
  - **Desktop video:** pan/zoom over the master map (Prezi/Ken-Burns) to the narrated
    subsystem — more watchable than a static 50-node wall, and it reinforces the one
    mental model.
  - **Mobile:** zoom hard to the focused subsystem (legible at full size); pinch-out =
    the whole map.
  This is the *merge* of the two source views: the dense map = the territory, the paged
  slides = a camera path over it. Reuses today's spine + `highlight` + audio
  auto-advance; `focus` is one added field on `SectionOverlay` (`content/module.ts`).
- **Two interaction modes, toggled (defaulted by device, user can switch):**
  - **Feed mode** — one scene per viewport, narration autoplay, panel as overlay
    caption. Mobile default. Paging is **two-axis** (see Navigation model below):
    horizontal between sections, vertical between modules.
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
- **Authoring caveat:** the big map is wide (16:9), so spread subsystems horizontally
  and use nesting for depth; the constraint is now **vertical** — tall pipeline scenes
  get cramped, so let deep flows breathe across the width rather than stacking. (The
  portrait-era "wrap a wide flow to stack" caveat no longer applies.)
- **Visual style: calm filled blocks, NOT neon.** Color lives in a muted *fill*
  (role hue ~30% over a dark base), not a glowing outline — no `box-shadow`,
  no backdrop-blur, no dotted grid. Flat neutral bg `#16181d`. Edges are plain
  gray with a small slow flow dot; bright color/motion is reserved for the
  (optional) narration spotlight. Semantic role colors are memory cues (driver=blue,
  executors=green, storage=orange, …). **Full spec: `apache-spark-content/DESIGN.md`** —
  read it before restyling. (We explicitly moved *off* the old neon look.)
- **Reel chrome (the shell around every scene):** a frame wrapping the **16:9 map**
  (canvas pillarboxed within the device viewport) with a top
  **brand bar** (logo → home + the current **concept** label; ☰ menu still TODO), a
  bottom-left **caption**, a bottom-right **play/pause + content-panel toggle**, and a
  **progress line pinned to the bottom edge** (zero layout cost). Modeled on
  graphl-mobile's reel. The brand-bar logo is the **home affordance** —
  `navigate('')` returns to the concept catalog (see Navigation model).
- **Caption = the hierarchy breadcrumb** (`components/ReelCaption.tsx`, two lines): **module** title
  (`moduleMeta.title`, e.g. "Foundations & Execution Model") · **section** title
  (`page.heading`) with the `N/M` counter dimmed on that same section line. The
  **concept** lives in the brand bar (top), not the caption — the old concept-kicker
  line was dropped as a duplicate once the brand bar shipped. **Use `module.title`,
  not `scene.title`, for the module line:** several sections in a module share/swap
  scenes, so the scene title flips mid-module; the module title is stable. The old
  per-scene `subtitle` is not shown (it duplicated across a module).
- **Content panel UX:** hidden by default; toggled from a brand-bar button. When
  open it's a **resizable right sidebar** (drag its left edge, clamp 340px–60vw) and
  the **scene keeps the bulk** of the width. On narrow screens (<760px) it becomes a
  **full overlay sheet**, not a side split. **Open state + width persist in
  `localStorage`** — a personal viewing preference, deliberately NOT in the URL (a
  shared deep link shouldn't force the panel open on someone else). The panel has **no
  paging stepper** (← → and tap-zones own paging); its header carries a **top-right
  contents button** (opens a slide list to jump anywhere — a list icon, kept distinct
  from the module ☰) **+ a close button**.
- **Panel drops notebook images.** The `.ipynb` diagram images (`![]()`) are stripped
  by the parser — our React Flow **scenes ARE those diagrams**, so rendering them in
  the panel would duplicate the canvas. A section with an image but no scene = a
  signal to author a scene, not inline a picture. (Fenced ASCII/`text` blocks stay.)
- **Navigation model (one continuous axis + a menu).** Content nests **concept →
  module → section** (e.g. Apache Spark → `01-foundations` → "Lazy evaluation"). Plan
  for the shape: future concepts (AWS, Databricks, …), **~9 modules/concept, ~15
  sections/module**.
  - **Horizontal = one continuous section flow across the WHOLE concept.** On load the
    app fetches *every* module's notebook and flattens them into a single page list
    (`hooks/useContentNav.ts`), so paging runs straight past a module boundary — module 1's last
    section → module 2's first — with **no refetch and no jump-to-start**. Touch:
    story **tap zones** (left third = prev, right third = next). Desktop: ← → arrow
    keys. A step swaps **scene + panel + caption + audio together**; the scene remounts
    on `sceneId` change, and since each module now rides **one dense scene**, in-module
    steps don't remount (smooth). The caption shows each page's own module title; the
    counter resets per module (`section N/M`).
  - **Module switch = the ☰ brand-bar picker** — it jumps to a module's first page
    *within the flat list* (no refetch). There is **no separate vertical/swipe axis**;
    paging across a boundary already crosses modules. (The earlier "vertical swipe =
    module" plan was dropped in favor of this continuous model.)
  - **Audio follows navigation** (`playingRef` in `hooks/useNarration.ts`). Play state persists
    across steps: if narration is on, the next slide's clip auto-plays; if paused, it
    stays paused. When a clip ends mid-playback it **auto-advances** to the next slide
    and keeps playing — a hands-free playthrough **bounded to the current module**
    (stops at the boundary; one-line guard to make it cross modules).
  - **Refresh-safe deep links.** The hash carries the section:
    `#/<concept>/<module>/<section-slug>` (`router.ts`). Paging silently rewrites the
    URL via `replaceState` (no `hashchange` → no effect loop, no Back/Forward churn);
    a refresh or shared link **restores the exact slide**. The slug derives from the
    heading (`sectionSlug` in `module.ts`), stable across reordering vs. a numeric index.
  - **Concept is the third level, NOT a scroll axis** (no third gesture). The
    **home page is the concept catalog** (`components/Home.tsx`, calm card grid
    driven by `content/catalog.ts`); the brand-bar logo routes there (`navigate('')`).
    A richer in-scene concept picker is still future.

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
~/Products/  (two separate repos, siblings)
  apache-spark-content/     # SEPARATE repo — fetched at runtime via raw GitHub (see its README)
    manifest.json           #   wires sections → scene/spine/audio per module
    notebooks/ tts/ audio/  #   scenes are NOT served from here (they live in graphl-ux)

graphl-ux/                  # this repo — the render engine; ships no content
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
      catalog.ts            #   concept registry (id · label · accent · contentBaseUrl) — app-owned
      notebook.ts           #   parseNotebook: .ipynb → Section[] (strips images)
      module.ts             #   buildPages: sections + manifest overlay → Page[]
      client.ts             #   fetch manifest/notebook/audio from a concept's contentBaseUrl
    scenes/                 #   one dense scene per module (+ extras kept for reuse)
      index.ts              #   scene registry (id → SceneSpec)
      spark-execution.ts, spark-rdd-api.ts, apache-spark-api-stack.ts
    components/              #   presentational pieces — props in, callbacks out (no own state)
      Home.tsx, home.css          # the concept catalog (home page)
      RightPanel.tsx, panel.css   # the content panel (markdown + contents list + resize)
      Header.tsx                  # brand bar (logo→home + concept label + ☰ module picker)
      ReelCaption.tsx             # bottom-left module · section breadcrumb + N/M counter
      ReelControls.tsx            # bottom-right show-full / play / panel cluster
      TapZones.tsx                # mobile prev/next/center-play tap zones
      icons.tsx                   # the reel control SVGs (play-pause / panel / expand)
    hooks/                  #   App's stateful logic, one concern per hook
      useContentNav.ts            # fetch+flatten pages, pageIdx, deep-link restore, URL sync
      useNarration.ts             # <audio> ref + play/progress + clip reset on page change
      usePanelPrefs.ts            # panel open/width (localStorage) + drag-resize
    router.ts               # hash router #/<concept>/<module>/<section>; navigate / replaceRoute
    App.tsx                 # the shell: wires the hooks + components together; owns only the
                            #   nav/narration seam (handleClipEnded, keyboard) + showFull/showHint
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

Apache Spark **modules 01–02** are wired end-to-end (build target: mobile reels + Udemy):
- Engine + pattern helpers ported from graphl-mobile (calm-restyled).
- **One dense scene per module**: module 01 = `spark-execution`, module 02 =
  `spark-rdd-api`; `apache-spark-api-stack` kept in the registry for reuse. Five
  earlier per-section scenes were removed (`spark-cluster`, `rdd-partitions`,
  `rdd-lineage`, `rdd-narrow-wide`, `spark-cache-persist`).
- Reel chrome (brand bar · caption · play/pause · edge progress), real narration
  audio wired (per-section), and the calm visual style locked (`DESIGN.md`).
- Content panel: notebooks parsed → sections, rendered (prose/tables/code), images
  stripped; hidden-by-default, toggleable, resizable sidebar (open/width persisted);
  mobile overlay; header **contents list + close**, no stepper.
- **Home page built**: `#/` shows the concept catalog (`components/Home.tsx`, calm card
  grid from `content/catalog.ts`); a card routes to `#/<concept>` (hash router,
  `router.ts`); the in-scene brand-bar logo routes back home.
- **Navigation — continuous flow built**: all modules load flattened into one page
  list; ← → (desktop) and **tap zones** (mobile, `≤760px`) page straight across module
  boundaries; the ☰ picker jumps to a module. **Audio persists across steps and
  auto-advances within a module** on clip end. **Deep links restore the exact slide on
  refresh** (`#/<concept>/<module>/<section-slug>`).
- **Content is fetched at runtime** per concept from that concept's `contentBaseUrl`
  (in `content/catalog.ts`; Spark = `apache-spark-content` over raw GitHub).
  `VITE_CONTENT_BASE_URL` is now only a dev override / fallback default in
  `content/client.ts`, not the primary source. The app bundles only the render engine
  + scenes + concept registry — `dist` stays content-free.
- **Narration spotlight built**: a section can name `highlight: string[]` (scene node
  ids) in the manifest overlay; those nodes light AMBER and the rest dim back. Plumbed
  `SectionOverlay`/`Page` (`module.ts`) → `App.tsx` → `SceneViewer` (`expandHighlight`
  also lights a lit container's children) → `SceneNode` (`--highlighted`/`--dimmed`,
  `scene.css`). Since the scene doesn't remount within a module, paging glides the
  spotlight across the one dense scene (the "unique flow" payoff). Sections that omit
  `highlight` render full-strength. **Module 01 is fully highlighted** (14 non-hook
  sections; the hook stays full-map); module 02 not yet.

**Interim shortcuts (flagged in code, to replace):**
1. **Per-section audio is wired** (`page.audio` per manifest section), but the `.wav`s
   still need a Colab generation pass — a missing clip 404s (auto-advance halts there)
   rather than narrating. The `sceneAudioFallback` map in `App.tsx` covers only
   sections that omit `audio` entirely; delete it once every section has a real clip.
2. On load the app fetches **all** wired notebooks up front (fine at 2 modules). Once
   all ~9 are wired, switch to lazy-loading per module.

**Likely next:** highlight module 02 (`spark-rdd-api`) — pure manifest editing now ·
generate the per-section narration `.wav`s · lazy-load module notebooks · CDN
(jsDelivr) for content (swap `VITE_CONTENT_BASE_URL`).
