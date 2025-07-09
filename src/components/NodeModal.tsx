'use client'
import React, { useState } from 'react'
import { Node } from 'reactflow'
import { useData } from '@/context/DataContext'
import ProblemCard from './ProblemCard'
import type { Subcategory } from '@/types/data'

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
  // pull in your problems lookup from context
  const { problemsById } = useData()
  const subs = node.data.subcategories
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setOpenMap(m => ({ ...m, [id]: !m[id] }))

  return (
    <div className="fixed inset-0 flex justify-center items-end z-[1000] bg-black/70 pb-8">
      <div className="relative bg-[#24252A] p-8 rounded-lg w-[85vw] h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#f20404] text-white px-4 py-2 rounded"
        >
          Close
        </button>
        <h2 className="text-center text-3xl font-bold mb-6">
          {node.data.label}
        </h2>

        <div className="space-y-4 mt-4">
          {subs.length === 0 && (
            <p className="text-gray-400 italic">No subcategories.</p>
          )}

          {subs.map(sub => (
            <div key={sub.id} className="border-b border-[#444] pb-2">
              {/* Subcategory header */}
              <button
                onClick={() => toggle(sub.id.toString())}
                className="flex justify-between w-full text-xl font-semibold text-white py-2"
              >
                Subcategory {sub.id}
                <span className="ml-2">
                  {openMap[sub.id] ? '▾' : '▸'}
                </span>
              </button>

              {/* Dropdown of problems */}
              {openMap[sub.id] && (
                <div className="mt-2 space-y-2 pl-4">
                  {sub.problemIds.length > 0 ? (
                    sub.problemIds.map(pid => {
                      const problem = problemsById.get(pid)
                      return problem ? (
                        <ProblemCard key={pid} problem={problem} />
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
          ))}
        </div>
      </div>
    </div>
  )
}
