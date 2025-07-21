'use client'
import React, { useEffect, useState } from 'react'
import { useData } from '@/context/DataContext'
import { useCompleted } from '@/context/CompletedContext'

type ProgressBarProps = {
  nodeId: string
  slim?: boolean
  showFraction?: boolean
  totalOverride?: number
  completedOverride?: number
}

export default function ProgressBar({
  nodeId,
  slim = false,
  showFraction = false,
  totalOverride,
  completedOverride,
}: ProgressBarProps) {
  const { roadmap } = useData()
  const { completedIds } = useCompleted()

  let total: number, completed: number

  // If global override props are given, use them
  if (typeof totalOverride === 'number' && typeof completedOverride === 'number') {
    total = totalOverride
    completed = completedOverride
  } else {
    const node = roadmap.find(n => n.id === nodeId)
    if (!node) return null
    const allProblemIds = node.subcategories.flatMap(sc => sc.problemIds)
    total = allProblemIds.length
    completed = allProblemIds.filter(id => completedIds.has(id)).length
  }

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const [animatedPercent, setAnimatedPercent] = useState(0)
  useEffect(() => {
    setAnimatedPercent(percent)
  }, [percent])

  // Bar size tweaks
  const barHeight = slim ? 'h-[7px]' : 'h-[18px]'
  const barRadius = slim ? 'rounded-[4px]' : 'rounded-[9px]'
  const barWidth  = slim ? 'w-[100%]' : 'w-[75%]'
  const barBg     = slim? 'bg-[#132238]' : 'bg-[#fff]'
  const fillRadius = slim ? 'rounded-[4px]' : 'rounded-l-[9px]'
  const fillTransition = 'transition-all duration-1000'

  return (
    <div className={`flex flex-col items-center ${slim ? 'mb-0' : 'modal-progress-container mb-4'}`}>
      {showFraction && !slim && (
        <span className="progress-label italic font-medium text-[1.2rem] mb-[5px] text-[#ccc]">
          ( {completed} / {total} )
        </span>
      )}
      <div className={`relative ${barWidth} ${barHeight} ${barBg} ${barRadius} overflow-hidden`}>
        <div
          className={`absolute top-0 left-0 h-full ${fillRadius} bg-gradient-to-r from-[#5dd39e] to-[#38b88f] ${fillTransition}`}
          style={{
            width: `${animatedPercent}%`,
            maxWidth: '100%',
          }}
        />
      </div>
    </div>
  )
}
