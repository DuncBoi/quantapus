'use client'
import { createContext, useContext, ReactNode } from 'react'
import type { Problem, RoadmapNode } from '@/types/data'

type DataContextType = {
  problemsById: Map<number, Problem>
  roadmap: RoadmapNode[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({
  children,
  initialProblems,
  initialRoadmap,
}: {
  children: ReactNode
  initialProblems: Map<number, Problem>
  initialRoadmap: RoadmapNode[]
}) {
  return (
    <DataContext.Provider
      value={{ problemsById: initialProblems, roadmap: initialRoadmap }}
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
