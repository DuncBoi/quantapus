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
  // Keyboard accessibility: Enter triggers click if focused and clickable
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!clickable) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <span
      className={`
        inline-block font-semibold italic underline underline-offset-4 decoration-2
        text-white transition-all duration-200 text-fluid-xs
        ${clickable
          ? 'cursor-pointer hover:scale-110 hover:decoration-[3px] hover:underline opacity-100'
          : 'opacity-100 cursor-default'}
      `}
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
      }}
      tabIndex={clickable ? 0 : -1}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
    >
      {category}
    </span>
  )
}
