'use client'

import type { ReactNode } from 'react'
import type { Problem, RoadmapNode } from '@/types/data'
import { AdminDataProvider } from '@/context/AdminDataContext'

type Category = { id: string }
type ProblemCategory = { problem_id: number, category_id: string }

type AdminClientLayoutProps = {
  children: ReactNode
  initialProblems: Map<number, Problem>
  initialRoadmap: RoadmapNode[]
  initialCategories: Category[]
  initialProblemCategories: ProblemCategory[]
}

export default function AdminClientLayout({
  children,
  initialProblems,
  initialRoadmap,
  initialCategories,
  initialProblemCategories,
}: AdminClientLayoutProps) {
  return (
    <AdminDataProvider
      initialProblems={initialProblems}
      initialRoadmap={initialRoadmap}
      initialCategories={initialCategories}
      initialProblemCategories={initialProblemCategories}
    >
      {children}
    </AdminDataProvider>
  )
}
