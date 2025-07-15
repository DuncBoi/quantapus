'use client'

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import ReactFlow, {
  ReactFlowProvider,
  type Edge,
  type Node,
  type Connection,
  MarkerType,
  OnNodesChange,
  NodeChange,
  applyNodeChanges,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { createClient } from '@/utils/supabase/client'
import { useData } from '@/context/DataContext'
import RoadmapNode from '@/components/RoadmapNode'
import PremiumNode from '@/components/PremiumNode'
import NodeModal from '@/components/NodeModal'

const nodeTypes = {
  roadmap: RoadmapNode,
  premium: PremiumNode,
}

interface RoadmapNodeData {
  label: string
  subcategories: any[]
}

export default function AdminRoadmapEditor() {
  const { roadmap } = useData()
  const supabase = createClient()

  const [nodes, setNodes] = useState<Node<RoadmapNodeData>[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [modalId, setModalId] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Remember the original node IDs so we can delete nodes
  const originalNodeIdsRef = useRef<string[] | null>(null)

  // Sync inital state from 'roadmap' context
  useEffect(() => {
    if (originalNodeIdsRef.current === null) {
      originalNodeIdsRef.current = roadmap.map(rn => rn.id.toString())
    }
    setNodes(
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
    setEdges(
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
    setIsDirty(false)
    setSaveSuccess(false)
  }, [roadmap])

  // Node drag/move
  const handleNodesChange: OnNodesChange = changes => {
    setNodes(prev => {
      const nxt = applyNodeChanges(changes, prev)
      if (changes.some(c => c.type === 'position')) setIsDirty(true)
      return nxt
    })
  }

  // Add edge
  const handleConnect = (c: Connection) => {
    setEdges(prev => {
      const exists = prev.some(
        e => e.source === c.source && e.target === c.target
      )
      if (exists) return prev
      setIsDirty(true)
      return [
        ...prev,
        {
          ...c,
          id: `${c.source}-${c.target}`,
          animated: true,
          style: { stroke: '#fff', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' },
        } as Edge,
      ]
    })
  }

  // Delete edge
  const handleEdgeClick = (_: any, edge: Edge) => {
    setEdges(prev => prev.filter(e => e.id !== edge.id))
    setIsDirty(true)
  }

  // Delete node on double‑click
  const handleNodeDoubleClick = (_: any, node: Node) => {
    setNodes(prev => prev.filter(n => n.id !== node.id))
    setEdges(prev =>
      prev.filter(e => e.source !== node.id && e.target !== node.id)
    )
    setIsDirty(true)
  }

  // Modal logic
  const modalNode = useMemo(
    () => nodes.find(n => n.id === modalId) || null,
    [nodes, modalId]
  )
  const openModal = (id: string) => setModalId(id)
  const closeModal = () => setModalId(null)

  // Add a new blank node
  const addNode = () => {
    const newId = crypto.randomUUID()
    setNodes(prev => [
      ...prev,
      {
        id: newId,
        type: 'roadmap',
        position: { x: 0, y: 0 },
        data: { label: 'New Node', subcategories: [] },
      },
    ])
    setIsDirty(true)
  }

  // Save only the deltas for edges & full upsert for nodes
  const saveChanges = async () => {
    setSaving(true)
    setSaveSuccess(false)

    // --- NODES ---
    // 1) Delete removed nodes
    const original = originalNodeIdsRef.current || []
    const current = nodes.map(n => n.id)
    const toDelete = original.filter(id => !current.includes(id))
    if (toDelete.length) {
      const { error } = await supabase
        .from('roadmap_nodes')
        .delete()
        .in('id', toDelete)
      if (error) {
        console.error('Failed to delete nodes:', error)
        setSaving(false)
        return
      }
    }

    // 2) Upsert all nodes (new + moved + relabeled)
    const upsertNodes = nodes.map(n => ({
      id: n.id,
      label: n.data.label,
      styling: n.type,
      position_x: Math.round(n.position.x),
      position_y: Math.round(n.position.y),
    }))
    {
      const { error } = await supabase
        .from('roadmap_nodes')
        .upsert(upsertNodes)
      if (error) {
        console.error('Failed to upsert nodes:', error)
        setSaving(false)
        return
      }
    }

    // Build sets of edge keys "source-target"
    const originalEdgesSet = new Set(
      roadmap.flatMap(rn =>
        (rn.children || []).map(child => `${rn.id}-${child}`)
      )
    )
    const currentEdgesSet = new Set(edges.map(e => `${e.source}-${e.target}`))

    // Compute inserts (in current but not original)
    const edgesToAdd = Array.from(currentEdgesSet)
      .filter(k => !originalEdgesSet.has(k))
      .map(k => {
        const [src, tgt] = k.split('-')
        return { parent_id: src, child_id: tgt }
      })

    // Compute deletes (in original but not current)
    const edgesToRemove = Array.from(originalEdgesSet)
      .filter(k => !currentEdgesSet.has(k))
      .map(k => {
        const [src, tgt] = k.split('-')
        return { parent_id: src, child_id: tgt }
      })

    // 1) Insert new edges
    if (edgesToAdd.length) {
      const { error } = await supabase
        .from('roadmap_node_children')
        .insert(edgesToAdd)
      if (error) {
        console.error('Failed to insert edges:', error)
        setSaving(false)
        return
      }
    }

    // 2) Delete removed edges
    if (edgesToRemove.length) {
      const results = await Promise.all(
        edgesToRemove.map(pair =>
          supabase
            .from('roadmap_node_children')
            .delete()
            .match(pair)
        )
      )
      const delErr = results.find(r => r.error)
      if (delErr) {
        console.error('Failed to delete edges:', delErr.error)
        setSaving(false)
        return
      }
    }

    // done
    originalNodeIdsRef.current = nodes.map(n => n.id)
    setSaveSuccess(true)
    setIsDirty(false)
    setSaving(false)
  }

  return (
    <div className="relative w-full h-screen">
      {/* re-enable handles locally */}
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
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeClick={(_, n) => openModal(n.id)}
        />
        {modalNode && (
          <NodeModal node={modalNode} onClose={closeModal} />
        )}
      </ReactFlowProvider>

      {/* Floating buttons */}
      <div className="fixed bottom-8 left-0 w-screen z-50 text-center pointer-events-none">
        <button
          onClick={addNode}
          className="pointer-events-auto mr-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition"
        >
          Add Node
        </button>
        <button
          onClick={saveChanges}
          disabled={!isDirty || saving}
          className={`
            pointer-events-auto px-6 py-2 rounded-lg font-bold text-white
            bg-[#48b5b5] shadow-lg transition hover:bg-[#4848b5]
            ${(!isDirty || saving) && 'opacity-50 cursor-not-allowed'}
          `}
        >
          {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save Changes'}
        </button>
        {saveSuccess && (
          <span className="ml-4 text-green-500 font-semibold">
            All changes saved ✔️
          </span>
        )}
      </div>
    </div>
  )
}
