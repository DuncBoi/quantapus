// src/components/AdminFlow.tsx
'use client'

import React, { useState, useCallback } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeChange,
} from 'reactflow'
import 'reactflow/dist/style.css'

// ← import your Supabase-js client factory
import { createClient } from '@/utils/supabase/client'

// ← define your table interface
type NodeRow = { id: string; label: string; position_x: number; position_y: number }

const nodeTypes = {}

// your hard-coded edges
const initialEdges: Edge[] = []

export default function AdminFlow({ initialNodes }: { initialNodes: Node<{ label: string }>[] }) {
  const [nodes, setNodes] = useState<Node<{ label: string }>[]>(initialNodes)
  const [edges] = useState<Edge[]>(initialEdges)

  // instantiate the browser supabase client
  const supabase = createClient()

  // update local state as you drag
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  // when drag stops, persist the new position
  const onNodeDragStop = useCallback(
    async (_: React.MouseEvent, node: Node<{ label: string }>) => {
      // 1) update local state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, position: { x: node.position.x, y: node.position.y } }
            : n
        )
      )

      // 2) write back to Supabase
      const { error } = await supabase
      .from('roadmap_nodes').update({ position_x: node.position.x, position_y: node.position.y }).eq('id', node.id)

      if (error) {
        console.error('Failed to save node position', error)
      }
    },
    [supabase]
  )

  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
        />
      </ReactFlowProvider>
    </div>
  )
}
