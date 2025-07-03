'use client'

import React, {useState} from 'react'
import ReactFlow, { ReactFlowProvider, type Edge, type Node, MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import RoadmapNode from '@/components/RoadmapNode'
import NodeModal from './NodeModal'

const nodeTypes = { roadmapNode: RoadmapNode }
const initialEdges: Edge[] = []

interface RoadmapNodeData {
  label: string
  progress?: number
  onClick?: (id: string) => void
}

interface RoadmapFlowProps {
    initialNodes: Node<RoadmapNodeData>[]
  }

export default function RoadmapFlow({ initialNodes }: RoadmapFlowProps) {
    const [modalNode, setModalNode] = useState<Node | null>(null)

    const nodes = initialNodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onClick: () => {
        setModalNode(node)
      }
    }
  }))

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
        {modalNode && (
          <NodeModal
            node={modalNode}
            onClose={() => setModalNode(null)}
          />
        )}
      </ReactFlowProvider>
    </div>
  )
}
