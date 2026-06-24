import { Handle, Position, type NodeProps } from '@xyflow/react'
import { GRAY } from './colors.ts'
import type { NodeKind } from './types.ts'

/**
 * Proportionate label size: shrink the font so the label fits its box instead of
 * wrapping mid-word into garble. We size to the LONGEST WORD (so words stay whole
 * and wrap only at spaces) against the box width, and to the line budget against
 * the box height, then clamp. This keeps a dense map's small chips legible on one
 * or two clean lines without the dot-collapse LOD.
 */
function fitFontPx(label: string, width: number, height: number, kind: NodeKind): number {
  const isContainer = kind === 'container'
  // Per-em character width: monospace term chips are wide; uppercase + letter-spaced
  // container titles wider still; sans symbols a touch narrower.
  // Per-em char width estimate. Slightly CONSERVATIVE for proportional sans so a
  // width-bound long word (repartition, sortMergeJoin) fits instead of fitting a
  // font a hair too big and clipping its tail. Cap-bound chips (e.g. SparkSession)
  // are unaffected — they hit `max` below, not this width bound.
  const charEm = isContainer ? 0.72 : kind === 'term' ? 0.64 : 0.58
  // Leaf chips keep a small centering margin — but a tight pad so long single
  // words (e.g. createGlobalTempView) shrink to FIT a narrow column instead of
  // clipping at the font floor. Must track the chip's CSS horizontal padding.
  const padX = isContainer ? 16 : kind === 'term' ? 14 : 18
  const words = label.split(/\s+/).filter(Boolean)
  const longest = Math.max(1, ...words.map((w) => w.length))
  const byWidth = Math.max(width - padX, 8) / (longest * charEm)
  // Container titles live in a top band; leaves use the whole box. Allow a second
  // line only for multi-word leaf labels.
  const bandH = isContainer ? Math.min(height * 0.28, 46) - 6 : height - 16
  const lines = !isContainer && words.length > 1 ? 2 : 1
  const byHeight = Math.max(bandH, 8) / (lines * 1.2)
  const max = isContainer ? 14 : kind === 'symbol' ? 22 : 16
  return Math.max(6, Math.min(byWidth, byHeight, max))
}

export interface SceneNodeData {
  label: string
  sub?: string
  color: string
  kind: NodeKind
  /** Dominant flow direction of the scene, sets handle placement. */
  direction: 'horizontal' | 'vertical'
  width: number
  height: number
  /** This node is the current section's spotlight. */
  highlighted?: boolean
  /** A spotlight is active elsewhere; this node recedes. */
  dimmed?: boolean
  [key: string]: unknown
}

export function SceneNode({ data }: NodeProps) {
  const d = data as SceneNodeData
  const horizontal = d.direction === 'horizontal'
  const targetPos = horizontal ? Position.Left : Position.Top
  const sourcePos = horizontal ? Position.Right : Position.Bottom

  return (
    <div
      className={`scene-node scene-node--${d.kind}${d.highlighted ? ' scene-node--highlighted' : ''}${d.dimmed ? ' scene-node--dimmed' : ''}`}
      style={{
        width: d.width,
        height: d.height,
        borderColor: d.color,
        ['--node-color' as string]: d.color,
      }}
    >
      <Handle type="target" position={targetPos} className="scene-handle" isConnectable={false} />
      {d.kind === 'container' && (
        // Title rides the top-left border (NodeMap-style): just the colored
        // label, masking the border line behind it — no badge, no body cost.
        <span className="scene-node__title">
          <span className="scene-node__label">{d.label}</span>
        </span>
      )}
      {(d.kind === 'symbol' || d.kind === 'term') && (
        <span
          className="scene-node__label"
          style={{ fontSize: fitFontPx(d.label, d.width, d.height, d.kind) }}
        >
          {d.label}
        </span>
      )}
      {d.kind !== 'group' && d.sub && <span className="scene-node__sub">{d.sub}</span>}
      <Handle type="source" position={sourcePos} className="scene-handle" isConnectable={false} />
    </div>
  )
}

SceneNode.defaultColor = GRAY
