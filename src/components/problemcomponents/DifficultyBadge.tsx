'use client'
import React from 'react'

const COLORS: Record<string, string> = {
  easy:    'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
  medium:  'bg-gradient-to-r from-yellow-300 to-yellow-500 text-white',
  hard:    'bg-gradient-to-r from-red-500 to-pink-600 text-white',
  insane:  'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white',
  unknown: 'bg-gray-600 text-white',
}

export default function DifficultyBadge({
  difficulty,
  size = "sm"
}: {
  difficulty?: string
  size?: "sm" | "lg"
}) {
  const d = (difficulty || 'Unknown').toLowerCase()
  const color = COLORS[d] || COLORS['unknown']
  const sizeClass =
    size === "lg"
      ? "text-fluid-large px-[20px] py-[10px] rounded-[18px]"
      : "text-fluid-xs px-[10px] py-[5px] rounded-[12px]"
  return (
    <span
      className={`font-semibold transition-colors duration-200 ${sizeClass} ${color}`}
    >
      {difficulty ?? 'Unknown'}
    </span>
  )
}