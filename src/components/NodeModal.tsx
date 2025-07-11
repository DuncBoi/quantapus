'use client'
import React, { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { useData } from '@/context/DataContext'
import ProblemCard from './ProblemCard'
import ProgressBar from './ProgressBar'
import type { Subcategory } from '@/types/data'
import { useRouter } from 'next/navigation'

interface RoadmapNodeData {
  label: string
  subcategories: Subcategory[]
}

export default function NodeModal({
  node,
  onClose,
}: {
  node: Node<RoadmapNodeData>
  onClose: () => void
}) {
  const { problemsById } = useData()
  const subs = node.data.subcategories
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  const router = useRouter()

useEffect(() => {
  // When modal opens, update the URL (replace state, don't push)
  router.replace(`?open=${node.id}`, { scroll: false })
  return () => {
    // When modal closes, remove the param
    router.replace(`?`, { scroll: false })
  }
}, [node.id, router])


  const toggle = (id: string) =>
    setOpenMap(m => ({ ...m, [id]: !m[id] }))

  return (
    <div className="fixed inset-0 flex justify-center items-end z-[1000] bg-black/70 pb-8 modal-overlay">
      <div className="relative bg-[#24252A] p-8 rounded-lg w-[85vw] h-[90vh] overflow-y-auto modal-content animate-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#f20404] text-white px-4 py-2 rounded modal-close"
        >
          Close
        </button>
        <h1 className="text-center text-[5rem] font-bold mb-3">
          {node.data.label}
        </h1>
        <ProgressBar nodeId={node.id} showFraction={true} />

        <div className="space-y-6 mt-6">
          {subs.map(sub => {
            return (
              <div
                key={sub.id}
                className={
                  "bg-[rgba(0,0,0,0.3)] p-6 rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] mb-6 relative subcategory-group"
                }
              >
                <button
                  onClick={() => toggle(sub.id.toString())}
                  className="flex items-center cursor-pointer text-2xl font-semibold text-[#edf0f1] border-l-4 border-[#61a9f1] pl-3 subcategory-header select-none w-full"
                  type="button"
                >
                {sub.id}
                  <span className="ml-3 subcategory-check" />
                  <span className={`ml-auto transition-transform ${openMap[sub.id] ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                {openMap[sub.id] && (
                  <div className="mt-4 space-y-2 pl-4">
                    {sub.problemIds.length > 0 ? (
                      sub.problemIds.map(pid => {
                        const problem = problemsById.get(pid)
                        return problem ? (
                          <ProblemCard key={pid} problem={problem} variant='roadmap' />
                        ) : null
                      })
                    ) : (
                      <p className="text-gray-500 italic">
                        No problems in this subcategory.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <style jsx global>{`
        .modal-content.animate-in { animation: zoomIn 0.25s ease-out forwards; }
        @keyframes zoomIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
