'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProblemsList from '@/components/ProblemsList'
import FilterDropdown from '@/components/FilterDropdown'
import { useCategories } from '@/context/DataContext'

const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'] as const
type Difficulty = typeof DIFFICULTY_OPTIONS[number]

// Explicit state shape for clarity
type FilterState = {
  difficulty: Difficulty
  category: string
}

export default function ProblemsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categories = useCategories()
  const categoryOptions = ['All', ...categories.map(cat => cat.id)]

  // Helper: get state from URL or last-used localStorage
  function getFilterStateFromUrlOrStorage(): FilterState {
    let urlDifficulty = searchParams?.get('difficulty')
    let urlCategory = searchParams?.get('category')
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

  // Use explicit typing for state
  const [filterState, setFilterState] = useState<FilterState>(getFilterStateFromUrlOrStorage)
  const { difficulty, category } = filterState

  // Update URL and localStorage when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (difficulty && difficulty !== 'All') {
      params.set('difficulty', difficulty)
    } else {
      params.delete('difficulty')
    }
    if (category && category !== 'All') {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.replace(`?${params.toString()}`, { scroll: false })
    if (typeof window !== 'undefined') {
      localStorage.setItem('problemsFilter', JSON.stringify({ difficulty, category }))
    }
    // eslint-disable-next-line
  }, [difficulty, category])

  // Sync with URL params if they change externally (back/forward, manual edit)
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

  // Handler for dropdown changes
  const handleFilterChange = (which: 'difficulty' | 'category', value: string) => {
    setFilterState(prev => ({
      ...prev,
      [which]: value
    }))
  }

  return (
    <main className="min-h-screen bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-white px-6 py-4">All Problems</h1>
      <div className="flex justify-center gap-6 mb-8">
        <FilterDropdown
          value={difficulty}
          onSelect={val => handleFilterChange('difficulty', val)}
          options={[...DIFFICULTY_OPTIONS]}
        />
        <FilterDropdown
          value={category}
          onSelect={val => handleFilterChange('category', val)}
          options={categoryOptions}
        />
      </div>
      <ProblemsList filterDifficulty={difficulty} filterCategory={category} />
    </main>
  )
}
