'use client'
import ProblemsList from '@/components/ProblemsList'

export default function ProblemsPage() {
  return (
    <main className="min-h-screen bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-white px-6 py-4">All Problems</h1>
      <ProblemsList />
    </main>
  )
}