'use client'
import React, { createContext, useContext, ReactNode } from 'react'
import type { Problem, RoadmapNode } from '@/types/data'

// Update type
type DataContextType = {
  problemsById: Map<number, Problem>
  roadmap: RoadmapNode[]
  categories: { id: string }[]
  problemCategories: { problem_id: number, category_id: string }[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({
  children,
  initialProblems,
  initialRoadmap,
  initialCategories,
  initialProblemCategories,
}: {
  children: ReactNode
  initialProblems: Map<number, Problem>
  initialRoadmap: RoadmapNode[]
  initialCategories: { id: string }[]
  initialProblemCategories: { problem_id: number, category_id: string }[]
}) {
  return (
    <DataContext.Provider
      value={{
        problemsById: initialProblems,
        roadmap: initialRoadmap,
        categories: initialCategories,
        problemCategories: initialProblemCategories,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

export function useCategories() {
  const ctx = useData()
  return ctx.categories
}

export function useProblemCategories() {
  const ctx = useData()
  return ctx.problemCategories
}
