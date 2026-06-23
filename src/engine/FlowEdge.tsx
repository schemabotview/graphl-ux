import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import { EDGE } from './colors.ts'

// A calm connector: a plain gray bezier with an arrowhead and a small, slow gray
// dot drifting along it as a gentle directional cue. Set data.animated = false
// for a fully static line. Edges that enter/leave on the same side use an
// orthogonal step path. (The brighter amber narration spotlight is separate.)
export function FlowEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd } =
    props
  const geo = { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }
  const [path, labelX, labelY] =
    sourcePosition === targetPosition
      ? getSmoothStepPath({ ...geo, borderRadius: 14, offset: 64 })
      : getBezierPath(geo)

  const color = (data?.color as string) ?? EDGE
  const animated = data?.animated !== false
  const label = data?.label as string | undefined

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ stroke: color, strokeWidth: 1.5, opacity: 0.9 }}
      />
      {animated && (
        <circle r={3} fill={color} opacity={0.85}>
          <animateMotion dur="2.4s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {label && (
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
