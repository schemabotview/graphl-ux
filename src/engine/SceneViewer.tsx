import { useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  MarkerType,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { SceneNodeSpec, SceneSpec } from './types.ts'
import { resolveGrid } from './grid.ts'
import { GRAY, EDGE } from './colors.ts'
import { SceneNode, type SceneNodeData } from './SceneNode.tsx'
import { FlowEdge } from './FlowEdge.tsx'
import './scene.css'

const nodeTypes = { scene: SceneNode }
const edgeTypes = { flow: FlowEdge }

// Virtual portrait canvas; React Flow's fitView scales it to the real viewport.
const CANVAS = { width: 800, height: 1200 }

/** Flatten the scene tree, parent before each of its children (depth-first). */
function flattenNodes(nodes: SceneNodeSpec[]): SceneNodeSpec[] {
  const out: SceneNodeSpec[] = []
  for (const n of nodes) {
    out.push(n)
    if (n.children?.length) out.push(...flattenNodes(n.children))
  }
  return out
}

export function SceneViewer({ scene }: { scene: SceneSpec }) {
  const direction = scene.grid.cols > scene.grid.rows ? 'horizontal' : 'vertical'

  const nodes = useMemo<Node<SceneNodeData>[]>(() => {
    const boxes = resolveGrid(scene.nodes, scene.grid, CANVAS)
    const flat = flattenNodes(scene.nodes)
    return flat.map((n) => {
      const box = boxes[n.id]
      return {
        id: n.id,
        type: 'scene',
        position: { x: box.x, y: box.y },
        draggable: false,
        selectable: false,
        data: {
          label: n.label,
          sub: n.sub,
          color: n.color ?? GRAY,
          kind: n.kind ?? 'symbol',
          direction,
          width: box.w,
          height: box.h,
        },
      }
    })
  }, [scene, direction])

  const edges = useMemo<Edge[]>(
    () =>
      scene.edges.map((e, i) => ({
        id: `${e.from}-${e.to}-${i}`,
        source: e.from,
        target: e.to,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: 'flow',
        data: { color: e.color ?? EDGE, animated: e.animated, label: e.label },
        markerEnd: { type: MarkerType.ArrowClosed, color: e.color ?? EDGE },
      })),
    [scene],
  )

  // Refit when the scene's box changes (panel toggled / resized, window resize).
  const instRef = useRef<ReactFlowInstance<Node<SceneNodeData>, Edge> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => instRef.current?.fitView({ padding: 0.1 }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="scene-flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(i) => {
          instRef.current = i
        }}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
      />
    </div>
  )
}
