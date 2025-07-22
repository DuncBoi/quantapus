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

  // Checkmark font size scales at about ~64% of box size (18px @ 28px box)
  const checkmarkFontSize = Math.round(size * 0.64)

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 10px rgba(56, 184, 143, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(56, 184, 143, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(56, 184, 143, 0);
          }
        }
      `}</style>

      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Clickable overlay like ::before */}
        <div
          onClick={e => {
            e.stopPropagation()
            toggleCompleted(problemId)
          }}
          className="absolute cursor-pointer z-10"
          style={{
            top: -20,
            left: -20,
            width: 60,
            height: 60,
          }}
        />

        {/* Box */}
        <div
          className={`
            relative
            inline-block
            border-[3px] border-white
            rounded-[6px]
            bg-[rgba(93,211,158,0.1)]
            cursor-pointer
            transition-all duration-300 ease-in-out
            group-hover:scale-110
            group-hover:shadow-[0_2px_12px_rgba(93,211,158,0.3)]
            ${completed ? 'bg-gradient-to-br from-[#5dd39e] to-[#38b88f] border-white shadow-[0_0_10px_rgba(56,184,143,0.4)] animate-pulse-custom' : ''}
          `}
          style={{
            width: size,
            height: size,
          }}
        >
          {/* Checkmark */}
          <span
            className={`
              absolute top-1/2 left-1/2
              -translate-x-1/2 -translate-y-1/2
              text-white font-bold
              pointer-events-none
              transition-transform duration-300 ease-in-out
              ${completed ? 'scale-[1.2] text-shadow-custom' : 'scale-0'}
            `}
            style={{ fontSize: checkmarkFontSize }}
          >
            ✓
          </span>
        </div>
      </div>

      <style jsx>{`
        .animate-pulse-custom {
          animation: pulse 1s ease-out;
        }
        .text-shadow-custom {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </>
  )
}
