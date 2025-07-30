'use client'
import React, { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import { useData } from '@/context/DataContext'
import ProblemCard from '../problemcomponents/ProblemCard'
import ProgressBar from '../problemcomponents/ProgressBar'
import type { Subcategory } from '@/types/data'

interface RoadmapNodeData {
  label: string
  subcategories: Subcategory[]
  styling?: string // add this if it isn't already included
}

function getInitialOpenMap(nodeId: string, subIds: (string | number)[]): Record<string, boolean> {
  if (typeof window !== 'undefined') {
    const key = `roadmapNodeOpenMap_${nodeId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (typeof parsed === 'object' && parsed !== null) return parsed
      } catch { /* ignore */ }
    }
  }
  const initial: Record<string, boolean> = {}
  for (const id of subIds) initial[id.toString()] = true
  return initial
}

function saveOpenMap(nodeId: string, openMap: Record<string, boolean>) {
  if (typeof window !== 'undefined') {
    const key = `roadmapNodeOpenMap_${nodeId}`
    localStorage.setItem(key, JSON.stringify(openMap))
  }
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
  const isPremium = node.data.styling === 'premium'

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(
    () => getInitialOpenMap(node.id, subs.map(s => s.id))
  )

  useEffect(() => {
    setOpenMap(prev => {
      const updated: Record<string, boolean> = { ...prev }
      for (const sub of subs) {
        const k = sub.id.toString()
        if (!(k in updated)) updated[k] = true
      }
      Object.keys(updated).forEach(k => {
        if (!subs.some(s => s.id.toString() === k)) delete updated[k]
      })
      return updated
    })
    // eslint-disable-next-line
  }, [subs.map(s => s.id).join(',')])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleClose = () => {
    saveOpenMap(node.id, openMap)
    onClose()
  }

  const toggle = (id: string) =>
    setOpenMap(m => {
      const updated = { ...m, [id]: !m[id] }
      saveOpenMap(node.id, updated)
      return updated
    })

  return (
    <div
      className={`
    fixed inset-0 flex justify-center items-end z-[1000] bg-black/50 pb-8 modal-overlay backdrop-blur-lg
    sm:items-end
  `}
      onClick={handleClose}
    >
      <div
        className={`
      relative bg-[#24252A] p-4 sm:p-8 rounded-none sm:rounded-lg
      w-full h-full
      sm:w-[85vw] sm:h-[90vh]
      overflow-y-auto modal-content animate-in
      max-w-[100vw] max-h-[100vh]
    `}
        onClick={e => e.stopPropagation()}
      >

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-[#f20404] text-white z-[30] px-4 py-2 rounded modal-close cursor-pointer"
        >
          x
        </button>

        {/* Premium Under Construction */}
        {isPremium ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#24252A]/80 z-20 rounded-lg backdrop-blur-lg">
            <span className="text-7xl mb-4">🔨</span>
            <h2 className="text-4xl font-extrabold text-white mb-2 text-center">
              Under Construction
            </h2>
          </div>
        ) : (
          <>
            <h1 className="text-center text-fluid-xl font-bold mb-3">
              {node.data.label}
            </h1>
            <ProgressBar nodeId={node.id} showFraction={true} />

            <div className="space-y-6 mt-6">
              {subs.map(sub => (
                <div
                  key={sub.id}
                  className={`
  bg-[rgba(0,0,0,0.3)] p-3 sm:p-5
  rounded-none sm:rounded-[8px]
  shadow-[0_4px_15px_rgba(0,0,0,0.3)] mb-4
  relative subcategory-group
  w-[100vw] -mx-4 sm:w-auto sm:mx-0
`}
                >
                  <button
                    onClick={() => toggle(sub.id.toString())}
                    className="flex items-center cursor-pointer text-fluid-medium font-bold text-[#edf0f1] border-l-4 border-[#61a9f1] pl-3 subcategory-header select-none w-full"
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
              ))}
            </div>
          </>
        )}
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
