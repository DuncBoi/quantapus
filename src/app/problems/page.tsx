'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProblemsList from '@/components/problems/ProblemsList'
import { useCategories } from '@/context/DataContext'
import { ChevronDown } from 'lucide-react'

// Dropdown color logic
const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'] as const
type Difficulty = typeof DIFFICULTY_OPTIONS[number]
const difficultyColors: Record<Difficulty, string> = {
  All: '#4f8cff',
  Easy: '#22c55e',
  Medium: '#eab308',
  Hard: '#ef4444'
}

type FilterState = { difficulty: Difficulty; category: string }

export default function ProblemsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categories = useCategories()
  const categoryOptions = ['All', ...categories.map(cat => cat.id)]

  // "Types Of" label for categories
  // const typesOf = categoryOptions.length > 1 ? categoryOptions[1] : 'All'

  function getFilterStateFromUrlOrStorage(): FilterState {
    const urlDifficulty = searchParams?.get('difficulty')
    const urlCategory = searchParams?.get('category')
    let local = { difficulty: 'All', category: 'All' }
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
          : local.category || 'All',
    }
  }

  const [filterState, setFilterState] = useState<FilterState>(getFilterStateFromUrlOrStorage)
  const { difficulty, category } = filterState

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty)
    else params.delete('difficulty')
    if (category && category !== 'All') params.set('category', category)
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

  // Dynamic color for difficulty dropdown
  const difficultyColor = difficultyColors[difficulty]

  return (
    <main className="min-h-screen bg-[#181a1f] pb-10 pt-20">
      <div className="w-full flex flex-col items-center justify-center">
        {/* Filter Bar */}
        <div
          className="
            flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center
            w-full max-w-3xl px-3 py-8 mt-4 mb-4
            rounded-2xl bg-[#24252A]
            shadow-[0_2px_18px_rgba(24,44,74,0.16)] border border-[#3c4250]/60
            "
        >
          {/* Difficulty */}
          <div className="w-full sm:w-1/2 relative group">
            <label className="block text-lg font-extrabold text-[#b7e5ff] mb-2 ml-1">
              <span
                style={{
                  color: difficulty !== 'All' ? difficultyColor : '#b7e5ff',
                  transition: 'color 0.18s'
                }}
              >
                {difficulty}
              </span>
            </label>
            <select
              value={difficulty}
              onChange={e => handleFilterChange('difficulty', e.target.value)}
              className={`
                w-full text-xl font-extrabold py-5 px-6 rounded-xl bg-[#1c1d22]
                border border-[#3e465a] shadow-lg
                appearance-none focus:outline-none
                focus:ring-2 focus:ring-[#4f8cff]
                text-white
                transition-all
                cursor-pointer
                ${difficulty !== 'All' ? '' : ''}
              `}
              style={{
                color: difficulty !== 'All' ? difficultyColor : '#fff'
              }}
            >
              {DIFFICULTY_OPTIONS.map(opt => (
                <option
                  key={opt}
                  value={opt}
                  style={{
                    color: difficultyColors[opt],
                    fontWeight: opt === difficulty ? 700 : 500,
                  }}
                >{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-12 pointer-events-none text-[#4f8cff] w-7 h-7" />
          </div>

          {/* Category */}
          <div className="w-full sm:w-1/2 relative group">
            <label className="block text-lg font-extrabold text-[#b7e5ff] mb-2 ml-1">
              <span style={{ color: '#fff', letterSpacing: 1 }}>
                Types Of
              </span>
            </label>
            <select
              value={category}
              onChange={e => handleFilterChange('category', e.target.value)}
              className="
                w-full text-xl font-extrabold py-5 px-6 rounded-xl bg-[#1c1d22]
                border border-[#3e465a] shadow-lg
                appearance-none focus:outline-none
                focus:ring-2 focus:ring-[#4f8cff]
                text-white
                transition-all
                cursor-pointer
              "
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-12 pointer-events-none text-[#4f8cff] w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="flex flex-col gap-2 items-center w-full">
        <ProblemsList
          filterDifficulty={difficulty}
          filterCategory={category}
        />
      </div>
    </main>
  )
}
