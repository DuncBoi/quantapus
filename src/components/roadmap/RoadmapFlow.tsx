'use client'

import React, { useMemo, useState, useEffect } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  type Edge,
  type Node,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

import RoadmapNode from '@/components/roadmap/RoadmapNode'
import PremiumNode from '@/components/roadmap/PremiumNode'
import NodeModal from './NodeModal'
import { useData } from '@/context/DataContext'
import RoadmapProgressDashboard from '@/components/roadmap/RoadmapProgressDashboard'

const nodeTypes = {
  roadmap: RoadmapNode,
  premium: PremiumNode,
  progressDashboard: () => (
    <div className="w-[350px] h-auto">
      <RoadmapProgressDashboard />
    </div>
  ),
}

function getOpenIdFromURL() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('open')
}

export default function RoadmapFlow() {
  const { roadmap } = useData()

  const [modalId, setModalId] = useState<string | null>(null)

  // On mount: open modal if URL has ?open=...
  useEffect(() => {
    const openId = getOpenIdFromURL()
    if (openId) setModalId(openId)
  }, [])

  // On modal open: update URL param
  const openModal = (id: string) => {
    setModalId(id)
    const params = new URLSearchParams(window.location.search)
    params.set('open', id)
    window.history.replaceState(null, '', `?${params.toString()}`)
  }

  // On modal close: remove param
  const closeModal = () => {
    setModalId(null)
    const params = new URLSearchParams(window.location.search)
    params.delete('open')
    window.history.replaceState(null, '', params.toString() ? `?${params.toString()}` : '/roadmap')
  }

  const nodes: Node[] = useMemo(() => {
  return roadmap.map(rn => ({
    id: rn.id.toString(),
    type: rn.styling, // or rn.type if you use that field
    position: { x: rn.positionX, y: rn.positionY },
    data: {
      label: rn.label,
      subcategories: rn.subcategories,
    },
    draggable: rn.styling === 'progressDashboard' ? true : undefined, // if you want to control drag per node
  }))
}, [roadmap])

  const edges = useMemo<Edge[]>(() => {
    return roadmap.flatMap(node =>
      (node.children || []).map(childId => ({
        id: `${node.id}-${childId}`,
        source: node.id,
        target: childId,
      }))
    )
  }, [roadmap])

  const modalNode = useMemo(
    () => nodes.find(n => n.id === modalId) || null,
    [nodes, modalId]
  )

  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#fff', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' },
          }}
          onNodeClick={(_, node) => {
    if (node.id === 'RoadmapDashboard') return
    openModal(node.id)
  }}
        />
        {modalNode && <NodeModal node={modalNode} onClose={closeModal} />}
      </ReactFlowProvider>
    </div>
  )
}
