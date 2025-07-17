'use client'
import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function FilterDropdown({
  value,
  onSelect,
  options = ["All", "Easy", "Medium", "Hard"]
}: {
  value: string
  onSelect: (val: string) => void
  options?: string[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="dropdown2 text-lg px-4 py-2 font-semibold"
          type="button"
        >
          {value}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dropdown-menu">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onSelect(opt)}
            className="dropdown-item"
            data-value={opt}
          >
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
