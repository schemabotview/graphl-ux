# graphl-ux

A unified, diagram-driven app for learning technical topics — interactive node-graph
**scenes** (React Flow) paired with the source **notebook** content, narrated with
audio. One codebase for both mobile reels and desktop/Udemy presentations.

Currently focused on **Apache Spark** (module 01 wired end to end).

## Run

```sh
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```sh
npm run build    # tsc -b && vite build (the verification gate)
npm run preview  # serve the production build
```

Requires a recent Node (18+).

## Using it

- **Navigate sections** with the **← / →** arrow keys (or the panel's ◀ N/M ▶
  stepper). Each section swaps the scene, the content, the caption, and the audio.
- **Toggle the content panel** with the panel button in the top-right brand bar.
  When open it's a **resizable** right sidebar — drag its left edge. On narrow
  screens it becomes a full overlay.
- **Play narration** with the ▶ button (bottom-right); the progress line runs along
  the bottom edge and is click-to-scrub. (Audio is enabled on scenes that have a clip.)

## Layout

```
src/
  engine/    # visual engine — SceneSpec types, grid resolver, pattern helpers,
             #   SceneNode/FlowEdge, SceneViewer (React Flow)
  content/   # notebook parser + module loader (manifest overlay → Pages)
  scenes/    # SceneSpec data + scene registry
  components/# RightPanel (markdown content panel)
  App.tsx    # the shell: scene + reel chrome + panel + navigation
apache-spark-content/   # the content repo (notebooks, manifest, scenes, tts, audio)
```

## Docs

- **`CLAUDE.md`** — architecture, locked design decisions, working agreement, status.
- **`apache-spark-content/DESIGN.md`** — the visual house style (read before restyling).
- **`apache-spark-content/MODULES.md`** — the Spark module/section outline.
- **`apache-spark-content/README.md`** — the content contract.

## Stack

React 19 · TypeScript · Vite 6 · React Flow (`@xyflow/react`) · react-markdown
(+ remark-gfm, rehype-highlight, highlight.js). Plain CSS, no Tailwind.
