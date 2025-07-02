'use client'

import React from 'react'
import ReactFlow, { ReactFlowProvider, type Edge, type Node, MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import RoadmapNode from '@/components/RoadmapNode'

const nodeTypes = { roadmapNode: RoadmapNode }

const initialEdges: Edge[] = []

interface RoadmapFlowProps {
    initialNodes: Node<{ label: string; progress?: number }>[]
  }

export default function RoadmapFlow({ initialNodes }: RoadmapFlowProps) {
    console.log("bruh", initialNodes)
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#fff', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' },
          }}
        />
      </ReactFlowProvider>
    </div>
  )
}
