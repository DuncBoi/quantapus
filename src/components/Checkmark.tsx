'use client'
import React from 'react'
import { useCompleted } from '@/context/CompletedContext'

export default function Checkmark({ problemId }: { problemId: number }) {
  const { completedIds, toggleCompleted } = useCompleted()
  const completed = completedIds.has(problemId)

  return (
    <div className="relative flex items-center justify-center group">
      <div
        onClick={(e) => {
          e.stopPropagation()
          toggleCompleted(problemId)
        }}
        className="absolute -top-[20px] -left-[20px] w-[60px] h-[60px] cursor-pointer z-10"
      />
      <div
        className={
          `relative w-[28px] h-[28px] border-[3px] border-white rounded-[6px] \
            bg-[rgba(93,211,158,0.1)] transition-all duration-300 ease-in-out \
            group-hover:scale-110 group-hover:shadow-[0_2px_12px_rgba(93,211,158,0.3)] ` +
          (completed
            ? 'bg-gradient-to-br from-[#5dd39e] to-[#38b88f] border-white shadow-[0_0_10px_rgba(56,184,143,0.4)]'
            : '')
        }
      >
        <span
          className={
            `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 \
                text-white text-[20px] transition-transform duration-300 ease-in-out font-extrabold ` +
            (completed
              ? 'scale-[1.2] text-shadow-[0_0_8px_rgba(255,255,255,0.9)]'
              : 'scale-0')
          }
        >
          ✓
        </span>
      </div>
    </div>
  )
}
