'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function CategoryPill({
  category,
  clickable = true,
}: {
  category: string
  clickable?: boolean
}) {
  const router = useRouter()
  const handleClick = () => {
    if (!clickable) return
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'problemsFilter',
        JSON.stringify({ difficulty: 'All', category })
      )
    }
    router.push('/problems')
  }
  return (
    <span
      className={`
        bg-[#243858] text-[#b7e5ff] px-3 py-1 rounded-md font-semibold text-base shadow-sm
        border border-[#375784] transition
        ${clickable ? 'hover:bg-[#355a7b]/80 cursor-pointer' : ''}
      `}
      onClick={clickable ? handleClick : undefined}
      tabIndex={clickable ? 0 : -1}
      style={clickable ? {} : { pointerEvents: 'none', opacity: 1 }}
    >
      {category}
    </span>
  )
}
