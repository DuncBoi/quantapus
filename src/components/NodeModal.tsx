// src/components/NodeModal.tsx
'use client'
import React from 'react'

export default function NodeModal({ node, onClose }: { node: any, onClose: () => void }) {
  // In a real app, fetch/load problems here based on node.id
  // For now, just demo data
  const problems = [
    { id: 1, title: 'Problem 1', completed: false },
    { id: 2, title: 'Problem 2', completed: true },
  ]

  return (
    <div className="fixed inset-0 flex justify-center items-end z-[1000] bg-black/70 pb-8 modal-overlay">
      <div className="modal-content animate-in relative bg-[#24252A] p-8 rounded-lg w-[85vw] h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="modal-close absolute top-4 right-4 bg-[#f20404] text-white px-4 py-2 rounded hover:opacity-90"
        >
          Close
        </button>
        <h2 className="modal-title text-center text-[3rem] font-bold mb-8">
          {node.data.label}
        </h2>
        <div className="modal-progress-container flex flex-col items-center mb-6">
          <div className="progress-label italic text-lg font-medium text-[#ccc] mb-2">
            Progress
          </div>
          <div className="progress-bar w-2/3 h-5 bg-[#f0f0f0] rounded-[9px] mb-2 shadow-inner">
            <div
              className="progress-bar-fill h-full rounded-[9px_0_0_9px] transition-all duration-500"
              style={{
                width: node.data.progress ? `${node.data.progress}%` : '0%',
                background: 'linear-gradient(90deg, #5dd39e 0%, #38b88f 100%)',
              }}
            />
          </div>
        </div>

        <div>
          {/* Simulated Problems */}
          <div className="space-y-6">
            {problems.map(p => (
              <div key={p.id}
                className={`subcategory-group p-6 rounded-lg mb-6 relative bg-black/30 shadow-lg overflow-hidden
                  ${p.completed ? "completed" : ""}`}>
                <div className="subcategory-header flex items-center cursor-pointer text-2xl font-semibold text-[#edf0f1] border-l-4 border-[#61a9f1] pl-3">
                  {p.title}
                  <span className="subcategory-check ml-3 flex items-center justify-center w-7 h-7 border-2 border-white rounded-full bg-[#5dd39e1a] pointer-events-none transition-all duration-300
                    ${p.completed ? 'scale-100 opacity-100 bg-gradient-to-tr from-[#5dd39e] to-[#38b88f] shadow-md border-white' : 'scale-0 opacity-0'}
                  ">
                    ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
