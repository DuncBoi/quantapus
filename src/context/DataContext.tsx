'use client'
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from 'react'
import type { Problem, RoadmapNode } from '@/types/data'
import { createClient } from '@/utils/supabase/client'
import { badToast } from '@/components/ui/toasts'

type DataContextType = {
  problemsById: Map<number, Problem>
  roadmap: RoadmapNode[]
  categories: { id: string }[]
  problemCategories: { problem_id: number, category_id: string }[]
  refreshProblems: () => Promise<void>
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
  // Store state for problems only (other data is static, change if needed)
  const [problemsById, setProblemsById] = useState(initialProblems)

  // These are just fixed at load (unless you want to make those refreshable too)
  const roadmap = initialRoadmap
  const categories = initialCategories
  const problemCategories = initialProblemCategories

  const supabase = useRef(createClient()).current

  // Refetch problems from DB
  const refreshProblems = useCallback(async () => {
    const { data, error } = await supabase.from('problems').select('*')
    if (!error && data) {
      const updated = new Map<number, Problem>()
      data.forEach((p: Problem) => updated.set(p.id, p))
      setProblemsById(updated)
    }
   else {
      badToast('Failed to refresh problems from database.')
    }   
  }, [supabase])

  return (
    <DataContext.Provider
      value={{
        problemsById,
        roadmap,
        categories,
        problemCategories,
        refreshProblems,
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
