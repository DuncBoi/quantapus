'use client'

import React, { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useCompleted } from '@/context/CompletedContext'

export default function RoadmapProgressDashboard() {
  const { roadmap } = useData()
  const { completedIds } = useCompleted()

  const { total, completed, percent } = useMemo(() => {
    const ids = new Set<number>()
    roadmap.forEach(node => {
      node.subcategories?.forEach(sub =>
        sub.problemIds?.forEach(pid => ids.add(pid))
      )
    })
    const all = Array.from(ids)
    const done = all.filter(id => completedIds.has(id)).length
    return {
      total: all.length,
      completed: done,
      percent: all.length ? Math.round((done / all.length) * 100) : 0,
    }
  }, [roadmap, completedIds])

  return (
    <div
      className="
        w-full max-w-[900px] mx-auto
        rounded-3xl
        px-7 py-7
        bg-[#15161dbf] backdrop-blur-sm
        border-2 border-[#61a9f1]/60
        shadow-[0_0_28px_0_#61a9f180]
        flex flex-col gap-4
      "
      style={{ boxShadow: '0 0 28px 0 #61a9f180' }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between select-none">
        <h2 className="text-[1.35rem] sm:text-xl font-extrabold text-white tracking-wide leading-tight">
          Roadmap Progress
        </h2>
        <div className="flex items-center gap-2">
          <Flame size={26} className="text-[#ff6b6b] drop-shadow-[0_0_4px_#ff6b6b80]" />
          <span className="text-white/90 font-bold text-[1.05rem] tabular-nums">
            {completed}
          </span>
        </div>
      </div>

      {/* Fraction */}
      <span className="italic font-medium text-[1.05rem] text-[#ccc] text-center -mb-1 select-none">
        ({completed} / {total})
      </span>

      {/* Progress Bar */}
      <div className="relative w-full h-[24px] bg-[#0d1117] rounded-[12px] overflow-hidden border border-[#1f2a3d]">
        {/* fill */}
        <div
          className="
            absolute top-0 left-0 h-full
            bg-gradient-to-r from-[#5dd39e] to-[#38b88f]
            transition-[width] duration-700 ease-out
            rounded-[12px]
          "
          style={{ width: `${percent}%` }}
        />
        {/* centered % label */}
        <span
          className="
            absolute inset-0 flex items-center justify-center
            text-white/90 text-[0.9rem] font-semibold
            pointer-events-none select-none
          "
        >
          {percent}%
        </span>
      </div>
    </div>
  )
}
