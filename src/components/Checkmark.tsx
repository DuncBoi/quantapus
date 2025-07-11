'use client'
import React from 'react'
import { useCompleted } from '@/context/CompletedContext'

export default function Checkmark({
  problemId,
  size = 28,
}: {
  problemId: number
  size?: number
}) {
  const { completedIds, toggleCompleted } = useCompleted()
  const completed = completedIds.has(problemId)

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center group"
    >
      {/* Overlay for click */}
      <div
        onClick={e => {
          e.stopPropagation()
          toggleCompleted(problemId)
        }}
        className="absolute -top-[20px] -left-[20px] w-[60px] h-[60px] cursor-pointer z-10"
      />
      {/* Box */}
      <div
        className={
          `relative w-full h-full border-[3px] border-white rounded-[6px]
           bg-[rgba(93,211,158,0.1)] transition-all duration-300 ease-in-out
           group-hover:scale-110 group-hover:shadow-[0_2px_12px_rgba(93,211,158,0.3)] ` +
          (completed
            ? 'bg-gradient-to-br from-[#5dd39e] to-[#38b88f] border-white shadow-[0_0_10px_rgba(56,184,143,0.4)]'
            : '')
        }
      >
        {/* Smooth pop-in checkmark */}
        <span
          className={`
            absolute
            left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            text-white
            font-extrabold
            pointer-events-none
            transition-transform duration-300 ease-in-out
            ${completed
              ? 'scale-100 opacity-100'
              : 'scale-0 opacity-0'}
          `}
          style={{
            fontSize: size * 2.0,
            marginLeft: size * 0.18,
            marginTop: size * -0.15,
          }}
        >
          ✓
        </span>
      </div>
    </div>
  )
}
