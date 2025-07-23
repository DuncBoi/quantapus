'use client'

import React from 'react'
import { useData, useProblemCategories } from '@/context/DataContext'
import ProblemCard from '../problemcomponents/ProblemCard'
import type { Problem } from '@/types/data'
import { useSearchParams } from 'next/navigation'

export default function ProblemsList({
    filterDifficulty = 'All',
    filterCategory = 'All',
}: {
    filterDifficulty?: string
    filterCategory?: string
}) {
    const { problemsById } = useData()
    const problemCategories = useProblemCategories?.() || []
    const searchParams = useSearchParams()

    // Convert Map to array and sort by id
    let problems = Array.from(problemsById.values()).sort((a, b) => a.id - b.id)

    // Filter by difficulty
    if (filterDifficulty && filterDifficulty !== 'All') {
        problems = problems.filter(
            (p) => p.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
        )
    }

    // Filter by category (if not "All")
    if (filterCategory && filterCategory !== 'All') {
        // Find all problem IDs that belong to this category
        const filteredIds = new Set(
            problemCategories
                .filter(pc => pc.category_id === filterCategory)
                .map(pc => pc.problem_id)
        )
        problems = problems.filter(p => filteredIds.has(p.id))
    }

    // Get current query string (for forwarding filters to ProblemCard)
    const params = new URLSearchParams(searchParams?.toString());
    const query = `?${params.toString()}`;

    return (
        <div className="flex flex-col w-full mx-auto px-2">
            {problems.map((problem: Problem) => (
                <ProblemCard key={problem.id} problem={problem} query={query} />
            ))}
            {problems.length === 0 && (
                <div className="col-span-full text-center text-gray-400 text-xl py-12">
                    No problems found for this filter.
                </div>
            )}
        </div>
    )
}
