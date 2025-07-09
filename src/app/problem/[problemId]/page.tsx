'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useData } from '@/context/DataContext'
import ProblemDetail from '@/components/ProblemDetail'

export default function ProblemPage() {
  const params = useParams()
  let raw = params.problemId
  if (Array.isArray(raw)) raw = raw[0]
  const initialId = raw ?? ''

  const { problemsById } = useData()

  // 1) Build sorted ID list
  const allIds = useMemo(
    () =>
      Array.from(problemsById.keys())
        .sort((a, b) => a - b)
        .map(String),
    [problemsById]
  )

  // 2) Local index state, seeded from the URL param
  const initialIdx = allIds.indexOf(initialId)
  const [currentIdx, setCurrentIdx] = useState(
    initialIdx >= 0 ? initialIdx : 0
  )

  // 3) Sync the URL bar to match the current problem
  useEffect(() => {
    const id = allIds[currentIdx]
    if (id) {
      window.history.replaceState(null, '', `/problem/${id}`)
    }
  }, [currentIdx, allIds])

  // 4) Prev/Next only update state
  const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1))
  const goNext = () =>
    setCurrentIdx((i) => Math.min(allIds.length - 1, i + 1))

  // 5) Grab the current problem from context
  const currentId = allIds[currentIdx]
  const problem = problemsById.get(Number(currentId))

  if (!problem) {
    return <p className="p-4 text-center text-white">Problem not found.</p>
  }

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="flex justify-center mt-[30px] mb-[10px]" id="problem-header-container">
        <div className="inline-flex items-center gap-2 font-bold py-2 px-4 bg-[#2c2d33] border-2 border-black rounded-[12px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-[8px]">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="bg-transparent border-none text-[#f0f2f5] text-[2rem] mx-3 p-1 transition-colors duration-200 hover:text-[#61a9f1] nav-arrow"
          >
            ←
          </button>
          <span className="flex-shrink-0 text-center text-[1.35rem] py-3 px-4 whitespace-nowrap tracking-[0.5px] bg-[#1e3353] border-2 border-[#61a9f1] rounded-[8px] transition-transform duration-200 ease-in-out text-white hover:scale-105 header-title">
            {currentIdx + 1} / {allIds.length}
          </span>
          <button
            onClick={goNext}
            disabled={currentIdx === allIds.length - 1}
            className="bg-transparent border-none text-[#f0f2f5] text-[2rem] mx-3 p-1 transition-colors duration-200 hover:text-[#61a9f1] nav-arrow"
          >
            →
          </button>
        </div>
      </div>

      {/* Problem Detail */}
      <ProblemDetail
        problemId={currentId}
      />
    </div>
  )
}
