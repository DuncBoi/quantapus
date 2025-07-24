'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

type FilterState = { difficulty: Difficulty; category: string }

export default function ProblemsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categories = useCategories()
  const categoryOptions = ['Types Of', ...categories.map(cat => cat.id)]

  function getFilterStateFromUrlOrStorage(): FilterState {
    const urlDifficulty = searchParams?.get('difficulty')
    const urlCategory = searchParams?.get('category')
    let local = { difficulty: 'All', category: 'Types Of' }
    if (typeof window !== 'undefined') {
      try {
        local = JSON.parse(localStorage.getItem('problemsFilter') || '{}')
      } catch {}
    }
    return {
      difficulty:
        urlDifficulty && DIFFICULTY_OPTIONS.includes(urlDifficulty as Difficulty)
          ? (urlDifficulty as Difficulty)
          : (local.difficulty as Difficulty) || 'All',
      category:
        urlCategory && categoryOptions.includes(urlCategory)
          ? urlCategory
          : local.category || 'Types Of',
    }
  }

  const [filterState, setFilterState] = useState<FilterState>(getFilterStateFromUrlOrStorage)
  const { difficulty, category } = filterState

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty)
    else params.delete('difficulty')

    // Don't write 'category' if it's "Types Of"
    if (category && category !== 'Types Of') params.set('category', category)
    else params.delete('category')

    router.replace(`?${params.toString()}`, { scroll: false })
    if (typeof window !== 'undefined') {
      localStorage.setItem('problemsFilter', JSON.stringify({ difficulty, category }))
    }
  }, [difficulty, category, router])

  useEffect(() => {
    const urlDifficulty = searchParams?.get('difficulty')
    const urlCategory = searchParams?.get('category')
    setFilterState(prev => ({
      difficulty:
        urlDifficulty && DIFFICULTY_OPTIONS.includes(urlDifficulty as Difficulty)
          ? (urlDifficulty as Difficulty)
          : prev.difficulty,
      category:
        urlCategory && categoryOptions.includes(urlCategory)
          ? urlCategory
          : prev.category,
    }))
    // eslint-disable-next-line
  }, [searchParams])

  const handleFilterChange = (which: 'difficulty' | 'category', value: string) => {
    setFilterState(prev => ({
      ...prev,
      [which]: value
    }))
  }

  const difficultyColor = difficultyColors[difficulty]

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
                    color: difficulty !== 'All' ? difficultyColor : '#fff',
                    textDecoration: 'underline',
                    background: 'transparent',
                  }}
                  aria-label="Filter by difficulty"
                >
                  {difficulty}
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
                    onSelect={() => handleFilterChange('difficulty', opt)}
                    className={`dropdown-item px-4 py-2 cursor-pointer transition bg-transparent hover:bg-[#3d3d3d] rounded-lg
                      ${opt !== 'All' ? '' : ''}
                    `}
                    data-value={opt}
                    style={{
                      color: difficultyColors[opt],
                      fontWeight: opt === difficulty ? 700 : 500,
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
                  {category === 'Types Of' ? 'Types Of' : category}
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
                    onSelect={() => handleFilterChange('category', opt)}
                    className="dropdown-item px-4 py-2 cursor-pointer transition bg-transparent hover:bg-[#3d3d3d] rounded-lg"
                    data-value={opt}
                    style={{
                      color: opt === 'Types Of' ? '#fff' : '#61a9f1',
                      fontWeight: opt === category ? 700 : 500,
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

      {/* Problems List */}
      <div className="flex flex-col gap-2 items-center w-full mx-auto max-w-[95%]">
        <ProblemsList
          filterDifficulty={difficulty}
          filterCategory={category === 'Types Of' ? 'All' : category}
        />
      </div>
    </main>
  )
}
