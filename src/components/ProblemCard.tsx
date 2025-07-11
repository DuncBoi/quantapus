'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import type { Problem } from '@/types/data'
import Checkmark from './Checkmark'

export default function ProblemCard({
  problem,
  variant = 'filter',
}: {
  problem: Problem
  variant?: 'roadmap' | 'filter'
}) {
  const router = useRouter()

  const handleClick = () => {
    if (variant === 'roadmap') {
      router.push(`/problem/${problem.id}?list=roadmap`)
    } else {
      router.push(`/problem/${problem.id}?list=filter`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="
        flex justify-between items-center p-[15px] my-2.5 mx-auto w-full
        bg-[#2c2d33] border-2 border-black rounded-lg
        transition-all duration-300 ease-in-out cursor-pointer
        hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]
      "
    >
      <div className="flex items-center gap-[15px]">
        <Checkmark problemId={problem.id} />
        <span
          className="
            inline-flex items-center justify-center
            text-white text-[1.5rem] font-medium
            pt-[6px] pr-[4px] pb-[4px] pl-[6px]
            border-[5px] border-[rgba(72,126,181,0.5)]
            rounded-[10px]
            transition duration-200 ease-in-out
            hover:bg-[rgba(72,126,181,0.25)]
            hover:border-[rgba(72,126,181,1)]
            hover:shadow-[0_0_12px_rgba(72,126,181,0.6)_inset,0_0_20px_rgba(72,126,181,0.4)_inset]
            hover:scale-105
          "
        >
          #{problem.id}
        </span>
        <span className="text-white text-[1.5rem] font-extrabold">
          {problem.title}
        </span>
      </div>
      <span className="text-white text-[1.2rem] font-semibold px-[10px] py-[5px] rounded-[12px]">
        {problem.difficulty ?? 'Unknown'}
      </span>
    </div>
  )
}
