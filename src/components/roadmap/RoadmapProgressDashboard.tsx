'use client'
import React from 'react'
import { useData } from '@/context/DataContext'
import { useCompleted } from '@/context/CompletedContext'
import { useUser } from '@/context/UserContext'
import ProgressBar from '@/components/problemcomponents/ProgressBar'
import DifficultyBadge from '@/components/problemcomponents/DifficultyBadge'

export default function RoadmapProgressDashboard() {
  const { roadmap, problemsById } = useData()
  const { completedIds } = useCompleted()
  const user = useUser()
  const isLoggedIn = !!user

  // All unique problem IDs
  const allProblemIds = React.useMemo(() => {
    const ids = new Set<number>()
    roadmap.forEach(node => {
      node.subcategories?.forEach(sub => {
        sub.problemIds?.forEach(pid => ids.add(pid))
      })
    })
    return Array.from(ids)
  }, [roadmap])

  // Real working stat calculation
  const stats = { easy: { total: 0, completed: 0 }, medium: { total: 0, completed: 0 }, hard: { total: 0, completed: 0 } }

allProblemIds.forEach(pid => {
  const problem = problemsById?.get?.(pid)
  if (!problem) return
  const diff = (problem.difficulty ?? 'medium').toString().toLowerCase() as 'easy' | 'medium' | 'hard'
  if (stats[diff]) {
    stats[diff].total += 1
    if (completedIds.has(pid)) stats[diff].completed += 1
  }
})

  const total = allProblemIds.length
  const completed = allProblemIds.filter(id => completedIds.has(id)).length
  const percent = total === 0 ? 0 : Math.round(100 * completed / total)
  // TODO: real streak
  const streak = 0

  return (
    <div className="bg-gradient-to-br from-[#1e2638] to-[#19213a] shadow-2xl rounded-2xl px-8 py-6 w-[420px] flex flex-col items-center border border-[#25304c]/50 relative overflow-hidden cursor-text select-text">
      {/* Title */}
      <h2 className="relative z-10 text-[2rem] font-extrabold mb-3 tracking-wide text-white drop-shadow-lg">
        Roadmap Progress
      </h2>
      {/* ProgressBar */}
      <div className="relative z-10 w-full my-2">
        <ProgressBar
          nodeId="__roadmap_total__"
          slim={false}
          showFraction={true}
          totalOverride={total}
          completedOverride={completed}
        />
      </div>
      {/* Main Progress */}
      <div className="flex flex-row items-center justify-center gap-6 mt-4 mb-3 w-full">
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold text-[#5cf2cd]">{completed}</span>
          <span className="text-sm font-medium text-gray-300">Completed</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold text-white">{total}</span>
          <span className="text-sm font-medium text-gray-300">Total</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl font-bold text-[#ffe67b]">{percent}%</span>
          <span className="text-sm font-medium text-gray-300">Complete</span>
        </div>
      </div>
      {/* Horizontal Difficulty breakdown */}
      
<div className="w-full flex flex-row items-center justify-between mt-2">
  <div className="flex flex-col items-center flex-1">
    <DifficultyBadge difficulty="Easy" />
    <span className="font-mono mt-1">{stats.easy.completed}/{stats.easy.total}</span>
  </div>
  <div className="flex flex-col items-center flex-1">
    <DifficultyBadge difficulty="Medium" />
    <span className="font-mono mt-1">{stats.medium.completed}/{stats.medium.total}</span>
  </div>
  <div className="flex flex-col items-center flex-1">
    <DifficultyBadge difficulty="Hard" />
    <span className="font-mono mt-1">{stats.hard.completed}/{stats.hard.total}</span>
  </div>
</div>
      {/* Streak (optional) */}
      <div className="mt-4 w-full flex flex-row items-center justify-center">
        <span className="uppercase text-xs font-bold tracking-wider text-[#93b3ff]/90 mr-2">
          Daily Streak
        </span>
        <span className="text-xl font-black text-[#fbeea0] drop-shadow-md">
          {streak}
        </span>
      </div>
      {/* Login Prompt */}
      {!isLoggedIn && (
        <div className="relative z-10 mt-5 text-center w-full">
          <button className="bg-gradient-to-r from-[#5dd39e] to-[#38b88f] hover:from-[#59cbf2] hover:to-[#5396e6] px-5 py-2 rounded-lg font-bold text-[#181e28] shadow-md w-full text-lg transition">
            Log in to track progress
          </button>
        </div>
      )}
    </div>
  )
}
