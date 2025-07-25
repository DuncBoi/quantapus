'use client'

import React, { useState, useEffect, useMemo } from 'react'
import ProblemsList from '@/components/problems/ProblemsList'
import { useCategories } from '@/context/DataContext'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'] as const
type Difficulty = typeof DIFFICULTY_OPTIONS[number]

const difficultyColors: Record<Difficulty, string> = {
  All: '#fff',
  Easy: '#22c55e',
  Medium: '#eab308',
  Hard: '#ef4444',
}

const CAT_DEFAULT = 'Types Of'
const STORAGE_KEY = 'problemsFilter'

export default function ProblemsPage() {
  const categories = useCategories()
  const categoryOptions = useMemo(
    () => [CAT_DEFAULT, ...categories.map(cat => cat.id)],
    [categories]
  )

  // Lazy initial state from localStorage
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        if (DIFFICULTY_OPTIONS.includes(stored.difficulty)) {
          return stored.difficulty
        }
      } catch {}
    }
    return 'All'
  })

  const [filterCategory, setFilterCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        if (categoryOptions.includes(stored.category)) {
          return stored.category
        }
      } catch {}
    }
    return CAT_DEFAULT
  })

  // Persist on changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ difficulty: filterDifficulty, category: filterCategory })
    )
  }, [filterDifficulty, filterCategory])

  function updateFilter(
    which: 'difficulty' | 'category',
    value: string
  ) {
    if (which === 'difficulty') {
      setFilterDifficulty(value as Difficulty)
    } else {
      setFilterCategory(value)
    }
  }

  // Carry filters into problem links
  const linkQuery =
    `?difficulty=${filterDifficulty}` +
    `&category=${
      filterCategory === CAT_DEFAULT ? 'All' : filterCategory
    }`

  return (
    <main className="min-h-screen bg-[#181a1f] pb-10 pt-20">
      <div className="w-full flex flex-col items-center justify-center">
        {/* Glassy Filter Bar */}
        <div
          className="
            flex flex-row flex-wrap gap-1 justify-center items-center
            w-full max-w-[95%] py-6 mb-8 mt-4
            rounded-2xl
            bg-gradient-to-r from-[rgba(40,44,52,0.7)] to-[rgba(72,126,181,0.18)]
            shadow-[0_4px_20px_rgba(0,0,0,0.6)] border border-[#3c4250]/60
          "
        >
          {/* Difficulty Dropdown */}
          <div className="dropdown-container flex flex-col items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`
                    dropdown2 text-5xl font-extrabold py-3 rounded-xl cursor-pointer
                    flex items-center px-2
                    border-2 border-transparent
                    transition-all duration-200
                    focus:outline-none
                    hover:scale-105 hover:bg-[rgba(255,255,255,0.06)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.24)]
                  `}
                  style={{
                    color:
                      filterDifficulty !== 'All'
                        ? difficultyColors[filterDifficulty]
                        : '#fff',
                    textDecoration: 'underline',
                    background: 'transparent',
                  }}
                  aria-label="Filter by difficulty"
                >
                  {filterDifficulty}
                  <ChevronDown className="ml-1 w-5 h-5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[160px] mt-2 rounded-xl border-none bg-[#1e1f26] shadow-[0_4px_16px_rgba(0,0,0,1)] text-lg font-semibold p-1"
              >
                {DIFFICULTY_OPTIONS.map(opt => (
                  <DropdownMenuItem
                    key={opt}
                    onSelect={() => updateFilter('difficulty', opt)}
                    className="dropdown-item px-4 py-2 cursor-pointer transition bg-transparent hover:bg-[#3d3d3d] rounded-lg"
                    style={{
                      color: difficultyColors[opt],
                      fontWeight: opt === filterDifficulty ? 700 : 500,
                    }}
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Dropdown */}
          <div className="dropdown-container flex flex-col items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="
                    dropdown2 text-5xl font-extrabold py-3 rounded-xl cursor-pointer
                    flex items-center px-2
                    border-2 border-transparent
                    transition-all duration-200
                    focus:outline-none
                    text-white
                    hover:scale-105 hover:bg-[rgba(255,255,255,0.06)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.24)]
                  "
                  aria-label="Filter by category"
                  style={{
                    textDecoration: 'underline',
                    background: 'transparent',
                  }}
                >
                  {filterCategory}
                  <ChevronDown className="ml-1 w-5 h-5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[160px] mt-2 rounded-xl border-none bg-[#1e1f26] shadow-[0_4px_16px_rgba(0,0,0,1)] text-lg font-semibold p-1"
              >
                {categoryOptions.map(opt => (
                  <DropdownMenuItem
                    key={opt}
                    onSelect={() => updateFilter('category', opt)}
                    className="dropdown-item px-4 py-2 cursor-pointer transition bg-transparent hover:bg-[#3d3d3d] rounded-lg"
                    style={{
                      color: opt === CAT_DEFAULT ? '#fff' : '#61a9f1',
                      fontWeight: opt === filterCategory ? 700 : 500,
                    }}
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Static "Problems" label */}
          <span className="text-white text-5xl font-extrabold select-none">
            Problems
          </span>
        </div>
      </div>

      {/* Problems List with linkQuery */}
      <div className="flex flex-col gap-2 items-center w-full mx-auto max-w-[95%]">
        <ProblemsList
          filterDifficulty={filterDifficulty}
          filterCategory={
            filterCategory === CAT_DEFAULT ? 'All' : filterCategory
          }
          linkQuery={linkQuery}
        />
      </div>
    </main>

  )
}
