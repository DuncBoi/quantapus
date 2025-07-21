'use client'

import React, { useState, useMemo, useRef } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  type Edge,
  type Node,
  type Connection,
  MarkerType,
  OnNodesChange,
  applyNodeChanges,
  type NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import RoadmapNode from '@/components/roadmap/RoadmapNode'
import PremiumNode from '@/components/roadmap/PremiumNode'
import RoadmapProgressDashboard from '@/components/roadmap/RoadmapProgressDashboard'
import AdminNodeModal from '@/components/admin/AdminNodeModal'
import { useAdminData } from '@/context/AdminDataContext'

// ---- Types ----
interface RoadmapNodeData {
  label: string
  subcategories: any[]
  onDelete?: () => void
}

export default function AdminRoadmapEditor() {
  // Only sync in roadmap *once* (on mount)
  const {
    roadmap,
    setRoadmap,
    setIsDirty,
  } = useAdminData()

  // Init from context ONCE
  const [nodes, setNodes] = useState<Node<RoadmapNodeData>[]>(() =>
    roadmap.map(rn => ({
      id: rn.id.toString(),
      type: rn.styling,
      position: { x: rn.positionX, y: rn.positionY },
      data: {
        label: rn.label,
        subcategories: rn.subcategories,
      },
    }))
  )
  const [edges, setEdges] = useState<Edge[]>(() =>
    roadmap.flatMap(rn =>
      (rn.children || []).map(childId => ({
        id: `${rn.id}-${childId}`,
        source: rn.id.toString(),
        target: childId.toString(),
        animated: true,
        style: { stroke: '#fff', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' },
      }))
    )
  )
  const [modalId, setModalId] = useState<string | null>(null)

  const addNode = () => {
  const id = window.prompt('Enter id for new node:')
  if (!id) return
  if (nodes.some(n => n.id === id)) {
    alert('A node with that id already exists!')
    return
  }
  const label = window.prompt('Enter label for new node:') ?? id
  setNodes(prev => [
    ...prev,
    {
      id,
      type: 'roadmap',
      position: { x: 0, y: 0 },
      data: { label, subcategories: [] },
    },
  ])
  setIsDirty(true)
}


  // --- Node Delete Handler
  function handleNodeDelete(id: string) {
    setNodes(prev => prev.filter(n => n.id !== id))
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id))
    setIsDirty(true)
  }

  // --- NodeTypes with onDelete ONLY for admin
  const nodeTypes = useMemo(() => ({
  roadmap: (props: NodeProps<RoadmapNodeData>) => (
    <RoadmapNode
      {...props}
      data={{
        ...props.data,
        onDelete: () => handleNodeDelete(props.id as string),
      }}
    />
  ),
  premium: (props: NodeProps<any>) => <PremiumNode/>,
  progressDashboard: () => (
    <div className="w-[350px] min-h-[330px] flex items-center justify-center">
      <RoadmapProgressDashboard />
    </div>
  ),
}), [])


  // --- ReactFlow Events ---
  const handleNodesChange: OnNodesChange = changes => {
    setNodes(nds => applyNodeChanges(changes, nds))
    if (changes.some(c => c.type === 'position')) setIsDirty(true)
  }

  const handleConnect = (c: Connection) => {
    const exists = edges.some(
      e => e.source === c.source && e.target === c.target
    )
    if (exists) return
    setEdges(prev => [
      ...prev,
      {
        ...c,
        id: `${c.source}-${c.target}`,
        animated: true,
        style: { stroke: '#fff', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' },
      } as Edge,
    ])
    setIsDirty(true)
  }

  const handleEdgeClick = (_: any, edge: Edge) => {
    setEdges(prev => prev.filter(e => e.id !== edge.id))
    setIsDirty(true)
  }

  // --- Modal logic ---
  const modalNode = useMemo(
    () => nodes.find(n => n.id === modalId) || null,
    [nodes, modalId]
  )
  const openModal = (id: string) => setModalId(id)
  const closeModal = () => setModalId(null)

  // --- SAVE ALL (push local node/edge state into context) ---
  const handleSaveAll = () => {
    // Update context roadmap from local nodes/edges state
    setRoadmap(
      nodes.map(n => ({
        id: n.id,
        label: n.data.label,
        positionX: Math.round(n.position.x),
        positionY: Math.round(n.position.y),
        styling: n.type ?? 'roadmap',
        subcategories: n.data.subcategories ?? [],
        children: edges.filter(e => e.source === n.id).map(e => e.target),
      }))
    )
    setIsDirty(true)
    alert("Roadmap changes staged")
  }

  return (
    <div className="relative w-full h-screen">
      <style>{`
        .react-flow__handle {
          visibility: visible !important;
          pointer-events: auto !important;
        }
      `}</style>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#fff', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#fff',
            },
          }}
          onNodesChange={handleNodesChange}
          onConnect={handleConnect}
          onEdgeClick={handleEdgeClick}
          onNodeClick={(_, n) => openModal(n.id)}
        />
        {modalNode && (
          <AdminNodeModal node={modalNode} onClose={closeModal} />
        )}
      </ReactFlowProvider>
      {/* Add Node and Save button */}
      <div className="fixed bottom-8 left-0 w-screen z-50 text-center pointer-events-none">
        <button
          onClick={addNode}
          className="pointer-events-auto mr-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition"
        >
          Add Node
        </button>
        <button
          onClick={handleSaveAll}
          className="pointer-events-auto px-6 py-2 rounded-lg font-bold text-white bg-[#48b5b5] shadow-lg transition hover:bg-[#4848b5] ml-4"
        >
          Stage Roadmap Changes
        </button>
      </div>
    </div>
  )
}
