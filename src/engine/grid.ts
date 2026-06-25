import type { SceneGrid, SceneNodeSpec } from './types.ts'

// Ported from graphl-mobile (itself from NodeMap's `resolve()`). Emits top-left
// pixel boxes because React Flow positions nodes by their top-left corner.

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

// NodeMap-style title placement: the container title is a compact tag that
// STRADDLES the top-left border (see SceneNode/scene.css), so it costs the body
// no vertical space — children fill the container's full box. Each child grid
// carries its own top padding, which leaves the strip the title sits in.

// Pixel inset applied between a container's border and its inner elements, so
// children get a little breathing room off the border (and clearance under the
// on-border title) on top of the child grid's own relative padding. Containers
// only — groups are invisible arrangers and stay flush.
const CONTAINER_INSET = 5

/**
 * Resolve the scene tree into an id -> absolute Box map (top-left origin). A node
 * with `children` + `layout` resolves those children INSIDE its own pixel box
 * (recursively), so a container truly measures its contents.
 */
export function resolveGrid(
  nodes: SceneNodeSpec[],
  grid: SceneGrid,
  canvas: { width: number; height: number },
): Record<string, Box> {
  if (import.meta.env.DEV) validateLayout(nodes, grid)
  const out: Record<string, Box> = {}
  layoutLevel(nodes, grid, { x: 0, y: 0, w: canvas.width, h: canvas.height }, out)
  return out
}

/**
 * Normalize a grid dimension to per-track WEIGHTS: a number `n` → `[1,1,…,1]`
 * (n equal tracks), an array passes through (relative track sizes). One axis of
 * the weighted/uniform unification — uniform is just the all-ones case.
 */
export const tracks = (dim: number | number[]): number[] =>
  Array.isArray(dim) ? dim : Array.from({ length: dim }, () => 1)

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Cumulative pixel offset BEFORE each track: `[w0,w1,w2]` → `[0,w0,w0+w1]`. */
const offsets = (sizes: number[]): number[] =>
  sizes.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s], [0])

/**
 * Lay out one axis: turn relative weights into pixel track sizes within `extent`,
 * reserving `padding` on both ends and `gap` between tracks (both measured in
 * weight-1 units, so a unit = one base track). Returns the unit size (for gap/pad
 * pixels), each track's size, and the cumulative offset before each track.
 */
function axis(weights: number[], extent: number, gap: number, padding: number) {
  const denom = sum(weights) + 2 * padding + (weights.length - 1) * gap
  const unit = extent / denom
  const sizes = weights.map((w) => w * unit)
  return { unit, sizes, before: offsets(sizes) }
}

/** Place one level of siblings within `box`, then recurse into their children. */
function layoutLevel(
  nodes: SceneNodeSpec[],
  grid: SceneGrid,
  box: Box,
  out: Record<string, Box>,
): void {
  const { gap = 0.2, padding = 0.4 } = grid
  const col = axis(tracks(grid.cols), box.w, gap, padding)
  const row = axis(tracks(grid.rows), box.h, gap, padding)
  const gapX = col.unit * gap
  const gapY = row.unit * gap
  const padX = col.unit * padding
  const padY = row.unit * padding

  for (const node of nodes) {
    const [c, r, cs = 1, rs = 1] = node.cell
    const nb: Box = {
      x: box.x + padX + col.before[c] + c * gapX,
      y: box.y + padY + row.before[r] + r * gapY,
      w: sum(col.sizes.slice(c, c + cs)) + (cs - 1) * gapX,
      h: sum(row.sizes.slice(r, r + rs)) + (rs - 1) * gapY,
    }
    out[node.id] = nb

    if (node.children?.length && node.layout) {
      // Children fill the box (title rides the border, no reserve), inset a few
      // px for containers so inner elements don't crowd the border.
      const i = node.kind === 'container' ? CONTAINER_INSET : 0
      const inner: Box = i
        ? { x: nb.x + i, y: nb.y + i, w: nb.w - 2 * i, h: nb.h - 2 * i }
        : nb
      layoutLevel(node.children, node.layout, inner, out)
    }
  }
}

type Rect = { id: string; c: number; r: number; cs: number; rs: number }

const rect = (n: SceneNodeSpec): Rect => {
  const [c, r, cs = 1, rs = 1] = n.cell
  return { id: n.id, c, r, cs, rs }
}

const overlaps = (a: Rect, b: Rect) =>
  a.c < b.c + b.cs && b.c < a.c + a.cs && a.r < b.r + b.rs && b.r < a.r + a.rs

const contains = (a: Rect, b: Rect) =>
  a.c <= b.c && a.r <= b.r && a.c + a.cs >= b.c + b.cs && a.r + a.rs >= b.r + b.rs

/**
 * Dev-only sanity check: warns on cells that run off their grid or two peers
 * that collide. A container/group is a backdrop its peers may sit on, and a
 * node may sit inside a larger backdrop term, so an overlap is a genuine
 * collision only when neither is a container/group and neither contains the
 * other. Checked per level (children live in their parent's sub-grid).
 */
export function validateLayout(nodes: SceneNodeSpec[], grid: SceneGrid): void {
  const cols = tracks(grid.cols).length
  const rows = tracks(grid.rows).length

  for (const { id, cell } of nodes) {
    const [c, r, cs = 1, rs = 1] = cell
    if (c < 0 || r < 0 || c + cs > cols || r + rs > rows) {
      console.warn(
        `[layout] "${id}" cell ${JSON.stringify(cell)} runs off the ${cols}×${rows} grid`,
      )
    }
  }

  const rects = nodes.map(rect)
  const isBackdrop = new Set(
    nodes.filter((n) => n.kind === 'container' || n.kind === 'group').map((n) => n.id),
  )
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]
      const b = rects[j]
      if (isBackdrop.has(a.id) || isBackdrop.has(b.id)) continue
      if (!overlaps(a, b) || contains(a, b) || contains(b, a)) continue
      console.warn(`[layout] "${a.id}" and "${b.id}" overlap`)
    }
  }

  for (const node of nodes) {
    if (node.children?.length && node.layout) validateLayout(node.children, node.layout)
  }
}
