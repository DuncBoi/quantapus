'use client'

import { AdminDataProvider } from '@/context/AdminDataContext'

export default function AdminClientLayout({
  children,
  initialProblems,
  initialRoadmap,
  initialCategories,
  initialProblemCategories,
}: any) {
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



