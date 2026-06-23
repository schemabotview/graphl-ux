import { Handle, Position, type NodeProps } from '@xyflow/react'
import { GRAY } from './colors.ts'
import type { NodeKind } from './types.ts'

export interface SceneNodeData {
  label: string
  sub?: string
  color: string
  kind: NodeKind
  /** Dominant flow direction of the scene, sets handle placement. */
  direction: 'horizontal' | 'vertical'
  width: number
  height: number
  [key: string]: unknown
}

export function SceneNode({ data }: NodeProps) {
  const d = data as SceneNodeData
  const horizontal = d.direction === 'horizontal'
  const targetPos = horizontal ? Position.Left : Position.Top
  const sourcePos = horizontal ? Position.Right : Position.Bottom

  return (
    <div
      className={`scene-node scene-node--${d.kind}`}
      style={{
        width: d.width,
        height: d.height,
        borderColor: d.color,
        ['--node-color' as string]: d.color,
      }}
    >
      <Handle type="target" position={targetPos} className="scene-handle" isConnectable={false} />
      {d.kind !== 'group' && <span className="scene-node__label">{d.label}</span>}
      {d.kind !== 'group' && d.sub && <span className="scene-node__sub">{d.sub}</span>}
      <Handle type="source" position={sourcePos} className="scene-handle" isConnectable={false} />
    </div>
  )
}

SceneNode.defaultColor = GRAY
