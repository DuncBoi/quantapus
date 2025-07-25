'use client'

import React from 'react'
import { useData, useProblemCategories } from '@/context/DataContext'
import ProblemCard from '../problemcomponents/ProblemCard'
import type { Problem } from '@/types/data'

export default function ProblemsList({
  filterDifficulty = 'All',
  filterCategory = 'All',
  linkQuery = '',
}: {
  filterDifficulty?: string
  filterCategory?: string
  linkQuery?: string
}) {
  const { problemsById } = useData()
  const problemCategories = useProblemCategories?.() || []

  // Convert Map to array and sort by id
  let problems = Array.from(problemsById.values()).sort((a, b) => a.id - b.id)

  // Filter by difficulty
  if (filterDifficulty !== 'All') {
    problems = problems.filter(
      p => p.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
    )
  }

  // Filter by category
  if (filterCategory !== 'All') {
    const filteredIds = new Set(
      problemCategories
        .filter(pc => pc.category_id === filterCategory)
        .map(pc => pc.problem_id)
    )
    problems = problems.filter(p => filteredIds.has(p.id))
  }

  // linkQuery already contains your `?difficulty=…&category=…`
  // (parent will pass it in)
  const query = linkQuery

  return (
    <div className="flex flex-col w-full mx-auto px-2">
      {problems.map((problem: Problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          query={query}
        />
      ))}

      {problems.length === 0 && (
        <div className="col-span-full text-center text-gray-400 text-xl py-12">
          No problems found for this filter.
        </div>
      )}
    </div>
  )
}
