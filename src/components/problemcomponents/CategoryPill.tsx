'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const CATEGORY_PILL_BASE = `
  text-white italic font-semibold
  transition-all duration-200 cursor-pointer
`

export default function CategoryPill({
  category,
  clickable = true,
  size = "sm",
  underline = true,
}: {
  category: string
  clickable?: boolean
  size?: "sm" | "lg"
  underline?: boolean
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
      ? "text-fluid-large"
      : "text-fluid-xs leading-tight"

  const underlineClass = underline ? "underline underline-offset-4 decoration-2" : ""

  return (
    <span
      className={`
        inline-block select-none
        ${CATEGORY_PILL_BASE}
        ${sizeClass}
        ${clickable ? 'hover:scale-102': ''}
        ${underlineClass}`      
      }

      tabIndex={clickable ? 0 : -1}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
    >
      {category}
    </span>
  )
}
