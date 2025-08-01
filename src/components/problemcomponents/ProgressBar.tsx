'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useData } from '@/context/DataContext'
import { useCompleted } from '@/context/CompletedContext'

type ProgressBarProps = {
  nodeId: string
  slim?: boolean
  showFraction?: boolean
}

export default function ProgressBar({
  nodeId,
  slim = false,
  showFraction = false,
}: ProgressBarProps) {
  const { roadmap } = useData()
  const { completedIds } = useCompleted()

  const node = roadmap.find(n => n.id === nodeId)
  const allProblemIds = node?.subcategories.flatMap(sc => sc.problemIds) ?? []
  const total = allProblemIds.length
  const completed = allProblemIds.filter(id => completedIds.has(id)).length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const [animatedPercent, setAnimatedPercent] = useState(() => percent)
  const isFirst = useRef(true)

  useEffect(() => {
    if (!slim) {
      console.log("non slim shit")
      if (isFirst.current) {
        isFirst.current = false
        console.log("isfirst.currnet")
        return
      }
      console.log("da bess")
      setAnimatedPercent(percent)
    } else {
      setAnimatedPercent(0)
      const id = requestAnimationFrame(() => setAnimatedPercent(percent))
      return () => cancelAnimationFrame(id)
    }
  }, [percent, slim])

  if (!node) return null

  const barHeight = slim ? 'h-[7px]' : 'h-[24px]'
  const barRadius = slim ? 'rounded-[4px]' : 'rounded-[12px]'
  const barWidth = slim ? 'w-[100%]' : 'w-[85%]'
  const barBg = slim ? 'bg-[#132238]' : 'bg-[#fff]'
  const fillRadius = slim ? 'rounded-[4px]' : 'rounded-l-[9px]'

  return (
    <div className={`flex flex-col items-center ${slim ? 'mb-0' : 'modal-progress-container mb-4'}`}>
      {showFraction && !slim && (
        <span className="progress-label italic font-medium text-[1.2rem] mb-[5px] text-[#ccc]">
          ( {completed} / {total} )
        </span>
      )}
      <div className={`relative ${barWidth} ${barHeight} ${barBg} ${barRadius} overflow-hidden`}>
        <div
          className={`absolute top-0 left-0 h-full ${fillRadius} bg-gradient-to-r from-[#5dd39e] to-[#38b88f] transition-all duration-1000`}
          style={{ width: `${animatedPercent}%`, maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}
