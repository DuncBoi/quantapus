'use client'

import React from 'react'
import { useData } from '@/context/DataContext'
import { useCompleted } from '@/context/CompletedContext'
import ProgressBar from '@/components/problemcomponents/ProgressBar'

// SVG fire icon for super-sleek look
const FireIcon = () => (
  <svg viewBox="0 0 24 24" width={28} height={28} fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="fireG" cx="50%" cy="50%" r="80%">
        <stop offset="0%" stopColor="#ffe27a" />
        <stop offset="70%" stopColor="#ff983a" />
        <stop offset="100%" stopColor="#ff345a" />
      </radialGradient>
    </defs>
    <path
      d="M12.4 3.1c.1-.2.5-.2.6 0C17 8 19.2 12.2 19.2 15.2c0 4-3.2 5.9-5.8 5.9-2.5 0-5.6-1.8-5.6-5.9 0-3 2.3-7.2 4.6-12.1z"
      fill="url(#fireG)"
      stroke="#fd3c65"
      strokeWidth="0.5"
      style={{ filter: 'drop-shadow(0 1px 2px #fd3c6560)' }}
    />
  </svg>
);

export default function RoadmapProgressDashboard() {
  const { roadmap } = useData()
  const { completedIds } = useCompleted()

  // Unique problem IDs
  const allProblemIds = React.useMemo(() => {
    const ids = new Set<number>()
    roadmap.forEach(node => {
      node.subcategories?.forEach(sub => {
        sub.problemIds?.forEach(pid => ids.add(pid))
      })
    })
    return Array.from(ids)
  }, [roadmap])

  const total = allProblemIds.length
  const completed = allProblemIds.filter(id => completedIds.has(id)).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  // If you want streak logic, swap this in
  const fireCount = completed

  return (
    <div className="
      w-full max-w-[480px]
      rounded-2xl
      px-5 py-6
      bg-[#12131a] border border-[#232841]
      shadow-[0_2px_16px_0_rgba(30,40,50,0.55)]
      flex flex-col items-center
    ">
      {/* Title row with percentage tight */}
      <div className="w-full flex items-baseline mb-3 select-none">
        <h2 className="text-[1.18rem] sm:text-xl font-extrabold text-white tracking-wide leading-tight">
          Roadmap Progress
        </h2>
        <span className="ml-2 text-[#36ffc1] text-base font-bold">
          ({percent}%)
        </span>
      </div>

      {/* Main content: progress bar full width, fire chip right */}
      <div className="w-full flex flex-row items-center gap-2">
        {/* Progress bar big and tight */}
        <div className="flex-1 min-w-0">
          <ProgressBar
            nodeId="__roadmap_total__"
            slim={false}
            showFraction={true}
            totalOverride={total}
            completedOverride={completed}
          />
        </div>
        {/* Sleek fire "chip" */}
        <div className="flex flex-col items-center justify-center ml-1 mr-1">
          <span className="block">
            <FireIcon />
          </span>
          <span className="text-white/90 font-bold text-[1.02rem] mt-1 tabular-nums leading-none">
            {fireCount}
          </span>
        </div>
      </div>
    </div>
  )
}
