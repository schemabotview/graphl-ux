import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  MarkerType,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { SceneNodeSpec, SceneSpec } from './types.ts'
import { resolveGrid, type Box } from './grid.ts'
import { GRAY, EDGE } from './colors.ts'
import { SceneNode, type SceneNodeData } from './SceneNode.tsx'
import { FlowEdge } from './FlowEdge.tsx'
import './scene.css'

const nodeTypes = { scene: SceneNode }
const edgeTypes = { flow: FlowEdge }

// Default virtual canvas (portrait); a scene may override via `scene.canvas` (e.g.
// a wide 16:9 map). React Flow's fitView scales whichever it is to the viewport.
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

/** Expand a highlight list: spotlighting a container also lights its children,
 *  so authors can name the box and not enumerate every chip inside it. Returns
 *  null when nothing is highlighted (so the scene renders at full strength). */
function expandHighlight(nodes: SceneNodeSpec[], highlight?: string[]): Set<string> | null {
  if (!highlight?.length) return null
  const lit = new Set(highlight)
  const addDescendants = (n: SceneNodeSpec) => {
    for (const c of n.children ?? []) {
      lit.add(c.id)
      addDescendants(c)
    }
  }
  const visit = (n: SceneNodeSpec) => {
    if (lit.has(n.id)) addDescendants(n)
    n.children?.forEach(visit)
  }
  nodes.forEach(visit)
  return lit
}

export function SceneViewer({
  scene,
  highlight,
  focus,
}: {
  scene: SceneSpec
  highlight?: string[]
  focus?: string | string[]
}) {
  const direction = scene.grid.cols > scene.grid.rows ? 'horizontal' : 'vertical'
  const highlightKey = highlight?.join(',') ?? ''
  const focusIds = useMemo(() => (Array.isArray(focus) ? focus : focus ? [focus] : []), [focus])

  // Resolved geometry, shared by node placement AND the camera (so framing a
  // focus region reuses the exact boxes React Flow renders).
  const boxes = useMemo(() => resolveGrid(scene.nodes, scene.grid, scene.canvas ?? CANVAS), [scene])

  // The spotlight set (null = nothing highlighted), shared by nodes AND edges so an
  // edge can fade in step with the nodes it connects.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lit = useMemo(() => expandHighlight(scene.nodes, highlight), [scene, highlightKey])

  const nodes = useMemo<Node<SceneNodeData>[]>(() => {
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
          highlighted: lit?.has(n.id) ?? false,
          dimmed: lit ? !lit.has(n.id) : false,
        },
      }
    })
  }, [scene, direction, boxes, lit])

  const edges = useMemo<Edge[]>(
    () =>
      scene.edges.map((e, i) => {
        // An edge is "active" when a spotlight is on and it touches a lit node;
        // "dimmed" when a spotlight is on but it touches neither. With no spotlight
        // every edge is calm (neither) — see FlowEdge for the visual states.
        const active = lit ? lit.has(e.from) || lit.has(e.to) : false
        const dimmed = lit ? !active : false
        return {
          id: `${e.from}-${e.to}-${i}`,
          source: e.from,
          target: e.to,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          type: 'flow',
          data: { color: e.color ?? EDGE, animated: e.animated, label: e.label, active, dimmed },
          markerEnd: { type: MarkerType.ArrowClosed, color: e.color ?? EDGE },
        }
      }),
    [scene, lit],
  )

  const instRef = useRef<ReactFlowInstance<Node<SceneNodeData>, Edge> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // The camera: frame the union box of the focused node(s); with no focus, fit the
  // whole scene. One helper drives every trigger (section change, init, resize) so
  // a refit always respects the current focus.
  const applyCamera = useCallback(() => {
    const inst = instRef.current
    if (!inst) return
    const framed = focusIds.map((id) => boxes[id]).filter(Boolean) as Box[]
    if (framed.length) {
      const minX = Math.min(...framed.map((b) => b.x))
      const minY = Math.min(...framed.map((b) => b.y))
      const maxX = Math.max(...framed.map((b) => b.x + b.w))
      const maxY = Math.max(...framed.map((b) => b.y + b.h))
      inst.fitBounds(
        { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
        { padding: 0.18, duration: 500 },
      )
    } else {
      inst.fitView({ padding: 0.1, duration: 500 })
    }
  }, [boxes, focusIds])

  // Re-aim the camera when the focus changes. In-module section steps reuse the same
  // scene (no remount), so this effect — not mount — is what pans between subsystems.
  useEffect(() => {
    const id = requestAnimationFrame(applyCamera)
    return () => cancelAnimationFrame(id)
  }, [applyCamera])

  // Refit when the scene's box changes (panel toggled / resized, window resize).
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => requestAnimationFrame(applyCamera))
    ro.observe(el)
    return () => ro.disconnect()
  }, [applyCamera])

  return (
    <div ref={wrapRef} className="scene-flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(i) => {
          instRef.current = i
          applyCamera()
        }}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        // Manual zoom/pan = the "read it yourself" escape hatch over a dense map.
        // The camera still drives paging (focus/fitView), and a page step re-frames,
        // so any stray manual zoom self-corrects on the next slide. Desktop canvas is
        // unobstructed; on mobile two-finger pinch clears the single-tap paging zones.
        // Wide zoom range so the deepest nested chips can be zoomed up to legibility.
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={8}
      />
    </div>
  )
}
