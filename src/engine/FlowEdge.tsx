import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  useInternalNode,
  Position,
  type EdgeProps,
  type InternalNode,
  type Node,
} from '@xyflow/react'
import { EDGE } from './colors.ts'

// Floating-edge geometry: connect at the point on each node's border that faces
// the other node, so an edge leaves whichever side (L/R/T/B) actually points at
// its target. Fixed top/bottom handles tangle a dense 2D map; floating endpoints
// route like the hand-drawn reference. (Standard React Flow floating-edge math.)
function borderPoint(node: InternalNode<Node>, other: InternalNode<Node>) {
  const w = (node.measured.width ?? 0) / 2
  const h = (node.measured.height ?? 0) / 2
  const cx = node.internals.positionAbsolute.x + w
  const cy = node.internals.positionAbsolute.y + h
  const ox = other.internals.positionAbsolute.x + (other.measured.width ?? 0) / 2
  const oy = other.internals.positionAbsolute.y + (other.measured.height ?? 0) / 2
  const xx = (ox - cx) / (2 * w) - (oy - cy) / (2 * h)
  const yy = (ox - cx) / (2 * w) + (oy - cy) / (2 * h)
  const a = 1 / (Math.abs(xx) + Math.abs(yy) || 1)
  return { x: w * (a * xx + a * yy) + cx, y: h * (-a * xx + a * yy) + cy }
}

function sideOf(node: InternalNode<Node>, p: { x: number; y: number }): Position {
  const px = node.internals.positionAbsolute.x
  const py = node.internals.positionAbsolute.y
  const w = node.measured.width ?? 0
  const h = node.measured.height ?? 0
  if (p.x <= px + 1) return Position.Left
  if (p.x >= px + w - 1) return Position.Right
  if (p.y <= py + 1) return Position.Top
  return Position.Bottom
}

// A calm connector: a plain bezier with an arrowhead and a small, slow dot drifting
// along it as a gentle directional cue. Endpoints float to the facing borders; an
// edge whose two ends land on the SAME side uses an orthogonal step so it doesn't
// fold back on itself. Set data.animated = false for a fully static line.
export function FlowEdge(props: EdgeProps) {
  const { id, source, target, data, markerEnd } = props
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode?.measured.width || !targetNode?.measured.width) return null

  const s = borderPoint(sourceNode, targetNode)
  const t = borderPoint(targetNode, sourceNode)
  const sourcePosition = sideOf(sourceNode, s)
  const targetPosition = sideOf(targetNode, t)
  const geo = {
    sourceX: s.x,
    sourceY: s.y,
    targetX: t.x,
    targetY: t.y,
    sourcePosition,
    targetPosition,
  }
  const [path, labelX, labelY] =
    sourcePosition === targetPosition
      ? getSmoothStepPath({ ...geo, borderRadius: 14, offset: 24 })
      : getBezierPath(geo)

  const color = (data?.color as string) ?? EDGE
  const label = data?.label as string | undefined

  // Three calm states keyed off the section spotlight (set in SceneViewer):
  //   active  — touches a highlighted node: bright, animated dot, label shown.
  //   dimmed  — a spotlight is on but this edge isn't involved: nearly invisible.
  //   neither — no spotlight (overview): a quiet static line, no dot/label clutter.
  const active = data?.active === true
  const dimmed = data?.dimmed === true
  const opacity = dimmed ? 0.08 : active ? 0.95 : 0.4
  const showDot = active && data?.animated !== false
  const showLabel = !!label && active

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={dimmed ? undefined : markerEnd}
        style={{
          stroke: color,
          strokeWidth: active ? 1.75 : 1.25,
          opacity,
          transition: 'opacity 0.25s ease',
        }}
      />
      {showDot && (
        <circle r={3} fill={color} opacity={0.85}>
          <animateMotion dur="2.4s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            className="scene-edge-label"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
