'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const CATEGORY_PILL_BASE = `
  inline-block select-none font-semibold cursor-pointer transition-all duration-200
  bg-gray-600 text-white truncate
`

export default function CategoryPill({
  category,
  clickable = true,
  size = 'sm',
}: {
  category: string
  clickable?: boolean
  size?: 'sm' | 'lg'
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!clickable) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const sizeClass =
    size === "lg"
      ? "text-fluid-large px-[20px] py-[10px] rounded-[18px]"
      : "text-fluid-xs px-[10px] py-[5px] rounded-[12px]"

  return (
    <span
      className={`${CATEGORY_PILL_BASE} ${sizeClass}
        ${clickable ? 'hover:scale-102' : 'cursor-default'}
      `}
      tabIndex={clickable ? 0 : -1}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
    >
      {category}
    </span>
  )
}