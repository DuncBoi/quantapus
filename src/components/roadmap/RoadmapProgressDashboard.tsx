'use client'

import React from 'react'
import { useData } from '@/context/DataContext'
import { useCompleted } from '@/context/CompletedContext'
import { useUser } from '@/context/UserContext'
import ProgressBar from '@/components/problemcomponents/ProgressBar'

const difficultyColors: Record<'easy' | 'medium' | 'hard', string> = {
  easy: '#22c55e',     // green-500
  medium: '#eab308',   // yellow-500
  hard: '#ef4444',     // red-500
}

export default function RoadmapProgressDashboard() {
  const { roadmap, problemsById } = useData()
  const { completedIds } = useCompleted()
  const user = useUser()
  const isLoggedIn = !!user

  // Collect all unique problem IDs
  const allProblemIds = React.useMemo(() => {
    const ids = new Set<number>()
    roadmap.forEach(node => {
      node.subcategories?.forEach(sub => {
        sub.problemIds?.forEach(pid => ids.add(pid))
      })
    })
    return Array.from(ids)
  }, [roadmap])

  // Stats container
  const stats = React.useMemo(() => {
    const s = { easy: { total: 0, completed: 0 }, medium: { total: 0, completed: 0 }, hard: { total: 0, completed: 0 } }
    allProblemIds.forEach(pid => {
      const problem = problemsById?.get(pid)
      if (!problem) return
      const diffRaw = (problem.difficulty ?? 'medium').toString().toLowerCase()
      const diff = (['easy', 'medium', 'hard'] as const).includes(diffRaw as any) ? diffRaw as 'easy' | 'medium' | 'hard' : 'medium'
      s[diff].total += 1
      if (completedIds.has(pid)) s[diff].completed += 1
    })
    return s
  }, [allProblemIds, problemsById, completedIds])

  const total = allProblemIds.length
  const completed = allProblemIds.filter(id => completedIds.has(id)).length
  const percent = total === 0 ? 0 : Math.round(100 * completed / total)
  const streak = 0 // TODO: implement real streak logic

  return (
    <div className="bg-[#1e2638] rounded-2xl px-6 py-6 w-[420px] flex flex-col items-center border border-[#25304c]/50">
      <h2 className="text-2xl font-extrabold mb-3 text-white tracking-wide">Roadmap Progress</h2>
      <div className="w-full my-2">
        <ProgressBar
          nodeId="__roadmap_total__"
          slim={false}
          showFraction={true}
          totalOverride={total}
          completedOverride={completed}
        />
      </div>
      <div className="flex justify-center gap-6 mt-4 mb-3 w-full text-white text-center">
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold text-[#5cf2cd]">{completed}</span>
          <span className="text-sm font-medium text-gray-300">Completed</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold">{total}</span>
          <span className="text-sm font-medium text-gray-300">Total</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold text-[#ffe67b]">{percent}%</span>
          <span className="text-sm font-medium text-gray-300">Complete</span>
        </div>
      </div>
      <div className="w-full flex justify-between mt-2 text-white">
        {(Object.keys(stats) as Array<'easy' | 'medium' | 'hard'>).map(diff => (
          <div key={diff} className="flex flex-col items-center flex-1">
            <div
              style={{
                backgroundColor: difficultyColors[diff],
                borderRadius: 12,
                padding: '6px 12px',
                fontWeight: 600,
                fontSize: '1rem',
                userSelect: 'none',
              }}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </div>
            <div style={{ fontFamily: 'monospace', marginTop: 6, color: '#ccc' }}>
              {stats[diff].completed}/{stats[diff].total}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 w-full flex justify-center items-center text-xs font-bold tracking-wider uppercase text-[#93b3ff]/90">
        <span className="mr-2">Daily Streak</span>
        <span className="text-xl font-black text-[#fbeea0] drop-shadow-md">{streak}</span>
      </div>
      {!isLoggedIn && (
        <div className="mt-5 w-full">
          <button className="w-full bg-gradient-to-r from-[#5dd39e] to-[#38b88f] hover:from-[#59cbf2] hover:to-[#5396e6] px-5 py-2 rounded-lg font-bold text-[#181e28] shadow-md text-lg transition">
            Log in to track progress
          </button>
        </div>
      )}
    </div>
  )
}
