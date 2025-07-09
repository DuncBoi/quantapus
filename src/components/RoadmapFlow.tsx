// src/components/RoadmapFlow.tsx
'use client'

import React, { useState, useMemo } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  type Edge,
  type Node,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

import RoadmapNode from '@/components/RoadmapNode'
import PremiumNode from '@/components/PremiumNode'
import NodeModal from './NodeModal'
import { useData } from '@/context/DataContext'
import type { Subcategory } from '@/types/data'

interface RoadmapNodeData {
  label: string
  subcategories: Subcategory[]
  onClick: () => void
}

const nodeTypes = { roadmap: RoadmapNode, premium: PremiumNode }
const initialEdges: Edge[] = []

export default function RoadmapFlow() {
  const { roadmap } = useData()

   if (!roadmap) {
    // You can return null, a spinner, or some placeholder.
    return <div>Loading roadmap…</div>
  }

  const [modalNode, setModalNode] = useState<Node<RoadmapNodeData> | null>(null)

  const nodes: Node<RoadmapNodeData>[] = useMemo(() => {
    return roadmap.map(rn => {
      const id = rn.id.toString()
      const node: Node<RoadmapNodeData> = {
        id,
        type: rn.styling,
        position: { x: rn.positionX, y: rn.positionY },
        data: {
          label: rn.label,
          subcategories: rn.subcategories,
          onClick: () => setModalNode(node),
        },
      }
      return node
    })
  }, [roadmap])

  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#fff', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' },
          }}
        />
        {modalNode && <NodeModal node={modalNode} onClose={() => setModalNode(null)} />}
      </ReactFlowProvider>
    </div>
  )
}
