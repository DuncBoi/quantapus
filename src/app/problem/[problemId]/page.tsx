'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useData } from '@/context/DataContext'
import ProblemDetail from '@/components/problemcomponents/ProblemDetail'
import DifficultyBadge from '@/components/problemcomponents/DifficultyBadge'
import CategoryPill from '@/components/problemcomponents/CategoryPill'
import type { RoadmapNode } from '@/types/data'
import Link from 'next/link'
import { notFound } from 'next/navigation';

export default function ProblemPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  // Extract problemId from URL param
  let raw = params.problemId
  if (Array.isArray(raw)) raw = raw[0]
  const problemId = raw ?? ''

  const { problemsById, roadmap, problemCategories, categories } = useData()

  // FILTERS: from searchParams
  const roadmapMode = searchParams.get('list') === 'roadmap'
  const filterDifficulty = searchParams.get('difficulty') ?? 'All'
  const filterCategory = searchParams.get('category') ?? 'All'

  // Write filter state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(
      'problemsFilter',
      JSON.stringify({ difficulty: filterDifficulty, category: filterCategory })
    )
  }, [filterDifficulty, filterCategory])

  // ---- Compute filtered list ----
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

  // ---- Compute which ids are valid for navigation ----
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

  // ---- Maintain current index in array ----
  const initialIdx = allIds.indexOf(problemId)
  const [currentIdx, setCurrentIdx] = useState(initialIdx >= 0 ? initialIdx : 0)

  // When URL param changes (e.g. direct load or popstate), sync currentIdx
  useEffect(() => {
    const idx = allIds.indexOf(problemId)
    setCurrentIdx(idx >= 0 ? idx : 0)
  }, [problemId, allIds])

  // ---- Listen for browser back/forward ----
  useEffect(() => {
    const onPopState = () => {
      // Use URL param, not event.state, for robustness
      const path = window.location.pathname
      const match = path.match(/\/problem\/(\d+)/)
      if (match) {
        const idx = allIds.indexOf(match[1])
        if (idx !== -1) setCurrentIdx(idx)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [allIds])

  // ---- Update URL and history when navigating by arrows ----
  const goToIdx = useCallback(
    (newIdx: number) => {
      if (newIdx < 0 || newIdx >= allIds.length) return
      setCurrentIdx(newIdx)
      const query = searchParams.toString()
      const url = `/problem/${allIds[newIdx]}${query ? '?' + query : ''}`
      // Don't push duplicate history entry
      if (window.location.pathname + window.location.search !== url) {
        window.history.pushState({}, '', url)
      }
    },
    [allIds, searchParams]
  )

  const goPrev = () => goToIdx(currentIdx - 1)
  const goNext = () => goToIdx(currentIdx + 1)

  // ---- Render ----
  const currentId = allIds[currentIdx]
  const problem = problemsById.get(Number(currentId))

  useEffect(() => {
    const t = `${problem?.title}`
    document.title = t
  }, [problem?.title, currentId])

  
  if (!problem) return notFound()
  if (
    filteredProblems.length === 0 ||
    !filteredProblems.some(p => String(p.id) === currentId)
  ) {
    notFound();
  }

  // Header label logic
  let headerClass =
    'flex-shrink-0 text-center text-fluid-small py-3 px-4 whitespace-nowrap tracking-[0.5px] cursor-pointer'
  if (roadmapMode && currentNode) {
    headerClass +=
      ' bg-[#1e3353] border-2 border-[var(--qp1)] rounded-[8px] text-white hover:scale-105 transition-transform duration-200 ease-in-out'
  } else {
    if (filterDifficulty === 'All' && filterCategory === 'All') {
      headerClass += ' text-white'
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-[var(--bg)]">
      <div className="flex justify-center mt-[10px]" id="problem-header-container">
        <div className="inline-flex items-center font-bold py-2 px-4 bg-[#2c2d33] border-2 border-black rounded-[12px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.6)] min-w-0 ">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="bg-[#2c2d33] rounded-md mr-5 p-3 transition-transform duration-200 hover:scale-120 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="#f0f2f5"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="block mx-auto"
            >
              <line x1="8" y1="12" x2="22" y2="12" />
              <polyline points="12 6 4 12 12 18" />
            </svg>
          </button>

          {/* Box (hover on scale) */}
          <div className="flex-1 min-w-0">
            {roadmapMode && currentNode ? (
              <Link
                href={`/roadmap?open=${currentNode.id}`}
                className={
                  headerClass +
                  " flex flex-1 min-w-0 items-center justify-center transition-all duration-200 hover:scale-105"
                }
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                prefetch
              >
                <span className="truncate font-semibold">
                  {currentNode.label} ({currentIdx + 1}/{allIds.length})
                </span>
              </Link>
            ) : (
              <Link
                href="/problems"
                className={
                  headerClass +
                  " flex flex-1 min-w-0 items-center justify-center bg-[#2c2d33] hover:bg-[#23242b] hover:scale-105 transition-all duration-200 rounded-lg"
                }
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                prefetch
              >
                <div
                  className="
          flex
          flex-col sm:flex-row
          items-center
          space-y-2 sm:space-y-0 sm:space-x-2
          truncate w-full
          py-1
        "
                >
                  <span className="hidden md:inline-flex text-[1.1rem] text-white/70 font-bold mr-3 flex-shrink-0">
                    ({currentIdx + 1}/{allIds.length})
                  </span>
                  {filterDifficulty !== 'All' && (
                    <span className="ml-1 inline-flex items-center">
                      <DifficultyBadge difficulty={filterDifficulty} />
                    </span>
                  )}
                  {filterCategory !== 'All' && (
                    <span className="ml-1 inline-flex items-center">
                      <CategoryPill category={filterCategory} clickable={false} />
                    </span>
                  )}
                  <span className="ml-1 inline-flex items-center text-fluid-xs font-semibold">
                    {(filterDifficulty === 'All' && filterCategory === 'All') ? 'All Problems' : 'Problems'}
                  </span>
                </div>
              </Link>
            )}
          </div>

          <button
            onClick={goNext}
            disabled={currentIdx === allIds.length - 1}
            className="bg-[#2c2d33] rounded-md ml-5 p-3 transition-transform duration-200 hover:scale-120 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="#f0f2f5"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="block mx-auto"
            >
              <line x1="2" y1="12" x2="16" y2="12" />
              <polyline points="12 18 20 12 12 6" />
            </svg>
          </button>

        </div>
      </div>
      <ProblemDetail problemId={currentId} />
    </div>
  )
}
