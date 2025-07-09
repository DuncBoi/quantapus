'use client'

import React from 'react'
import { useData } from '@/context/DataContext'
import ProblemCard from './ProblemCard'
import type { Problem } from '@/types/data'

export default function ProblemsList() {
  const { problemsById } = useData()
  // Convert Map to array and sort by id
  const problems = Array.from(problemsById.values()).sort((a, b) => a.id - b.id)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {problems.map((problem: Problem) => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
    </div>
  )
}