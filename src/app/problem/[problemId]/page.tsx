'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useData } from '@/context/DataContext'
import ProblemDetail from '@/components/problemcomponents/ProblemDetail'

export default function ProblemPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  let raw = params.problemId
  if (Array.isArray(raw)) raw = raw[0]
  const initialId = raw ?? ''
  const { problemsById, roadmap, problemCategories, categories } = useData()

  // Roadmap mode
  const roadmapMode = searchParams?.get('list') === 'roadmap'
  const filterDifficulty = searchParams?.get('difficulty') ?? 'All'
  const filterCategory = searchParams?.get('category') ?? 'All'

  // Compute filtered problem IDs (for non-roadmap)
  const filteredProblems = useMemo(() => {
    let arr = Array.from(problemsById.values())
    if (filterDifficulty !== 'All') {
      arr = arr.filter(
        p => p.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
      )
    }
    if (filterCategory !== 'All' && problemCategories && categories) {
      const idsForCat = problemCategories
        .filter(pc => pc.category_id === filterCategory)
        .map(pc => pc.problem_id)
      arr = arr.filter(p => idsForCat.includes(p.id))
    }
    return arr.sort((a, b) => a.id - b.id)
  }, [problemsById, filterDifficulty, filterCategory, problemCategories, categories])

  // What set of problems to rotate through?
  let allIds: string[] = []
  let currentNode: any = undefined

  if (roadmapMode && roadmap.length) {
    for (const node of roadmap) {
      const subProblems = node.subcategories.flatMap(sc => sc.problemIds)
      if (subProblems.includes(Number(initialId))) {
        currentNode = node
        allIds = subProblems.map(String)
        break
      }
    }
    if (!currentNode) {
      allIds = Array.from(problemsById.keys()).sort((a, b) => a - b).map(String)
    }
  } else {
    // Use filtered problems if NOT in roadmap mode
    allIds = filteredProblems.map(p => String(p.id))
  }

  // Local index state (seeded from the URL param)
  const initialIdx = allIds.indexOf(initialId)
  const [currentIdx, setCurrentIdx] = useState(initialIdx >= 0 ? initialIdx : 0)

  // Sync URL as you rotate
  useEffect(() => {
    const id = allIds[currentIdx]
    if (!id) return
    const url = `/problem/${id}${searchParams?.toString() ? '?' + searchParams.toString() : ''}`
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, '', url)
    }
  }, [currentIdx, allIds, searchParams])

  // Prev/Next
  const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1))
  const goNext = () => setCurrentIdx((i) => Math.min(allIds.length - 1, i + 1))

  const currentId = allIds[currentIdx]
  const problem = problemsById.get(Number(currentId))

  if (!problem) {
    return <p className="p-4 text-center text-white">Problem not found.</p>
  }

  return (
    <div className="px-4 pt-20">
      {/* Header */}
      <div className="flex justify-center mt-[10px]" id="problem-header-container">
        <div className="inline-flex items-center gap-2 font-bold py-2 px-4 bg-[#2c2d33] border-2 border-black rounded-[12px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-[8px]">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="bg-transparent border-none text-[#f0f2f5] text-[2rem] mx-3 p-1 transition-colors duration-200 nav-arrow cursor-pointer hover:scale-125"
          >
            ←
          </button>
          {roadmapMode && currentNode ? (
            <span className="flex-shrink-0 text-center text-[1.35rem] py-3 px-4 whitespace-nowrap tracking-[0.5px] bg-[#1e3353] border-2 border-[#61a9f1] rounded-[8px] transition-transform duration-200 ease-in-out text-white hover:scale-105 header-title">
              <span className="font-bold text-white mr-2">
                {currentNode.label}
              </span>
              ({currentIdx + 1}/{allIds.length})
            </span>
          ) : (
            <span className="flex-shrink-0 text-center text-[1.35rem] py-3 px-4 whitespace-nowrap tracking-[0.5px] bg-[#1e3353] border-2 border-[#61a9f1] rounded-[8px] transition-transform duration-200 ease-in-out text-white hover:scale-105 header-title">
              {currentIdx + 1}/{allIds.length}
            </span>
          )}
          <button
            onClick={goNext}
            disabled={currentIdx === allIds.length - 1}
            className="bg-transparent border-none text-[#f0f2f5] text-[2rem] mx-3 p-1 transition-colors duration-200 cursor-pointer hover:scale-125 nav-arrow"
          >
            →
          </button>
        </div>
      </div>
      {/* Problem Detail */}
      <ProblemDetail problemId={currentId} />
    </div>
  )
}
