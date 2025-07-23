'use client'

import React from 'react'
import { toast } from 'sonner'
import { useCompleted } from '@/context/CompletedContext'
import { useUser, useAuthUI } from '@/context/UserContext'

export default function Checkmark({
  problemId,
  size = 28,
}: { problemId: number; size?: number }) {
  const { completedIds, toggleCompleted } = useCompleted()
  const user = useUser()
  const { openGooglePrompt } = useAuthUI()
  const completed = completedIds.has(problemId)
  const checkmarkFontSize = Math.round(size * 0.8)

  const showSignInToast = () => {
    toast.custom((tId) => (
      <div
        className="
          w-full max-w-sm bg-[#1a1b22f0] text-white/90
          border-2 border-red-500/90 rounded-xl
          shadow-[0_0_18px_rgba(255,0,0,0.35)]
          px-3 py-3 flex items-center justify-between gap-2
        "
      >
        
        <button
          onClick={() => {
            toast.dismiss(tId)
            openGooglePrompt()
          }}
          className="px-3 py-1 rounded-md text-sm font-semibold bg-[#61a9f1] hover:bg-[#4d96df] transition cursor-pointer"
        >
          Sign in
        </button>
        <span className="text-sm">to complete problems</span>
        
      </div>
    ), {
      position: 'top-center',
      duration: 5000,
    })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      showSignInToast()
      return
    }
    toggleCompleted(problemId)
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 10px rgba(56,184,143,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(56,184,143,0); }
          100% { box-shadow: 0 0 0 0 rgba(56,184,143,0); }
        }
      `}</style>

      <div
  className="relative flex items-center justify-center group"   // <- add group
  style={{ width: size, height: size }}
>
  <div
    onClick={handleClick}
    className="absolute cursor-pointer z-10"
    style={{ top: -20, left: -20, width: 60, height: 60 }}
  />

  <div
    className={`
      relative inline-block border-[3px] border-white rounded-[6px]
      ${completed ? 'bg-gradient-to-br from-[#5dd39e] to-[#38b88f] border-white shadow-[0_0_10px_rgba(56,184,143,0.4)] animate-pulse-custom' : 'bg-[rgba(93,211,158,0.1)]'}
      transition-all duration-300 ease-in-out cursor-pointer
      group-hover:scale-110                               // <- one-line effect
    `}
    style={{ width: size, height: size }}
  >
          <span
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              text-white font-bold pointer-events-none
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
        .animate-pulse-custom { animation: pulse 1s ease-out; }
        .text-shadow-custom { text-shadow: 0 0 8px rgba(255,255,255,0.9); }
      `}</style>
    </>
  )
}
