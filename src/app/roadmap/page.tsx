'use client'

import React from 'react'
import ReactFlow, { ReactFlowProvider, MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import RoadmapNode from '@/components/RoadmapNode'

const nodeTypes = { roadmapNode: RoadmapNode }

// — simple example nodes & edges —
const initialNodes = [
  { id: '1', type: 'roadmapNode', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', type: 'roadmapNode', position: { x: 200, y: 200 }, data: { label: 'Node 2' } },
]
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true,
    style: { stroke: 'white', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'white' }
  }
]

export default function RoadmapPage() {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
        />
      </ReactFlowProvider>
    </div>
  )
}
