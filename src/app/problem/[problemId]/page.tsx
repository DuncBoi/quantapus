'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useData } from '@/context/DataContext'
import ProblemDetail from '@/components/problemcomponents/ProblemDetail'
import type { RoadmapNode } from '@/types/data'
import DifficultyBadge from '@/components/problemcomponents/DifficultyBadge'
import CategoryPill from '@/components/problemcomponents/CategoryPill'

export default function ProblemPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract problemId
  let raw = params.problemId
  if (Array.isArray(raw)) raw = raw[0]
  const problemId = raw ?? ''

  const { problemsById, roadmap, problemCategories, categories } = useData()

  // Roadmap mode and filters
  const roadmapMode = searchParams.get('list') === 'roadmap'
  const filterDifficulty = searchParams.get('difficulty') ?? 'All'
  const filterCategory = searchParams.get('category') ?? 'All'

  // Sync incoming filter params → localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(
      'problemsFilter',
      JSON.stringify({ difficulty: filterDifficulty, category: filterCategory })
    )
  })

  // Compute filtered problems (non-roadmap)
  const filteredProblems = useMemo(() => {
    let arr = Array.from(problemsById.values())
    if (filterDifficulty !== 'All') {
      arr = arr.filter(
        p => p.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
      )
    }
    if (filterCategory !== 'All' && problemCategories && categories) {
      const ids = new Set(
        problemCategories.filter(pc => pc.category_id === filterCategory).map(pc => pc.problem_id)
      )
      arr = arr.filter(p => ids.has(p.id))
    }
    return arr.sort((a, b) => a.id - b.id)
  }, [problemsById, filterDifficulty, filterCategory, problemCategories, categories])

  // Determine problem sequence
  const { allIds, currentNode } = useMemo(() => {
    let all: string[] = []
    let node: RoadmapNode | undefined
    if (roadmapMode && roadmap.length) {
      for (const n of roadmap) {
        const subs = n.subcategories.flatMap(sc => sc.problemIds)
        if (subs.includes(Number(problemId))) {
          node = n
          all = subs.map(String)
          break
        }
      }
      if (!node) {
        all = Array.from(problemsById.keys()).map(String).sort((x, y) => Number(x) - Number(y))
      }
    } else {
      all = filteredProblems.map(p => String(p.id))
    }
    return { allIds: all, currentNode: node }
  }, [roadmapMode, roadmap, filteredProblems, problemsById, problemId])

  // Track current index
  const initialIdx = allIds.indexOf(problemId)
  const [currentIdx, setCurrentIdx] = useState(initialIdx >= 0 ? initialIdx : 0)

  // Update index on URL change (Back/Forward)
  useEffect(() => {
    const idx = allIds.indexOf(problemId)
    setCurrentIdx(idx >= 0 ? idx : 0)
  }, [problemId, allIds])

  // Push history on arrow nav
  useEffect(() => {
    const id = allIds[currentIdx]
    if (!id) return
    const query = searchParams.toString()
    const url = `/problem/${id}${query ? '?' + query : ''}`
    if (window.location.pathname + window.location.search !== url) {
      router.push(url)
    }
  }, [currentIdx, allIds, searchParams, router])

  const goPrev = () => setCurrentIdx(i => Math.max(0, i - 1))
  const goNext = () => setCurrentIdx(i => Math.min(allIds.length - 1, i + 1))

  const currentId = allIds[currentIdx]
  const problem = problemsById.get(Number(currentId))
  if (!problem) return <p className="p-4 text-center text-white">Problem not found.</p>

  // Build header label, click handler
  let headerOnClick: () => void
  let headerClass =
    'flex-shrink-0 text-center text-[1.35rem] py-3 px-4 whitespace-nowrap tracking-[0.5px] cursor-pointer'
  let headerLabel: React.ReactNode = null

  if (roadmapMode && currentNode) {
    headerLabel = `${currentNode.label} (${currentIdx + 1}/${allIds.length})`
    headerOnClick = () => router.push(`/roadmap?open=${currentNode.id}`)
    headerClass +=
      ' bg-[#1e3353] border-2 border-[#61a9f1] rounded-[8px] text-white hover:scale-105 transition-transform duration-200 ease-in-out'
  } else {
    headerOnClick = () => router.push('/problems')

    if (filterDifficulty === 'All' && filterCategory === 'All') {
      headerLabel = <span style={{ color: "#fff", fontWeight: 700 }}>All problems</span>
      headerClass += ' text-white'
    } else {
      headerLabel = (
        <>
          {/* Difficulty badge if present */}
          {filterDifficulty !== 'All' && (
            <span className="mr-2 align-middle">
              <DifficultyBadge difficulty={filterDifficulty} />
            </span>
          )}
          {/* Category color if present and not All */}
          {filterCategory !== 'All' && (
            <span className="ml-1 align-middle">
              <CategoryPill category={filterCategory} clickable={false} />
            </span>
          )}

          {/* Problems always white */}
          <span style={{ color: "#fff", fontWeight: 700 }} className="ml-1 align-middle">
            Problems
          </span>
        </>
      )
    }
  }


  return (
    <div className="px-4 pt-20">
      <div className="flex justify-center mt-[10px]" id="problem-header-container">
        <div className="inline-flex items-center gap-2 font-bold py-2 px-4 bg-[#2c2d33] border-2 border-black rounded-[12px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-[8px]">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="bg-transparent border-none text-[#f0f2f5] text-[2rem] mx-3 p-1 transition-colors duration-200 nav-arrow cursor-pointer hover:scale-125"
          >
            ←
          </button>
          {/* Box (hover on scale) */}
          <span
            onClick={headerOnClick}
            className={
              headerClass +
              (roadmapMode
                ? // Roadmap:
                " bg-[#1e3353] border-2 border-[#61a9f1] rounded-[8px] text-white transition-transform duration-200 ease-in-out"
                : // Filter:
                " flex items-center px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer " +
                "bg-[#2c2d33] hover:bg-[#23242b] hover:scale-105"
              )
            }
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            {/* (num/total) index */}
            {!roadmapMode && (
              <span className="text-[1.1rem] text-white/70 font-bold mr-3 align-middle">
                ({currentIdx + 1}/{allIds.length})
              </span>
            )}
            {/* Filters label */}
            {headerLabel}
          </span>

          <button
            onClick={goNext}
            disabled={currentIdx === allIds.length - 1}
            className="bg-transparent border-none text-[#f0f2f5] text-[2rem] mx-3 p-1 transition-colors duration-200 nav-arrow cursor-pointer hover:scale-125"
          >
            →
          </button>
        </div>

      </div>
      <ProblemDetail problemId={currentId} />
    </div>
  )
}
