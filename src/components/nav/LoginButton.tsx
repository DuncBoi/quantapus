'use client'

import React, { useEffect, useState } from 'react'
import { useUser, useAuthUI } from '@/context/UserContext'
import { createClient } from '@/utils/supabase/client'
import { getInitials } from '@/lib/getInitials'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export default function LoginButton() {
  const user = useUser()
  const { openGooglePrompt } = useAuthUI()
  const supabase = createClient()
  const router = useRouter()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = async () => {
      const currUrl =
        window.location.origin +
        window.location.pathname +
        window.location.search
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: currUrl },
      })
      if (error) console.error('OAuth error:', error)
      else if (data?.url) window.location.href = data.url
    }
    window.addEventListener('trigger-google-login', handler)
    return () => window.removeEventListener('trigger-google-login', handler)
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    setOpen(false)
  }

  const handleSignIn = () => {
    openGooglePrompt()
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="bg-[linear-gradient(90deg,_#4848b5,_#48b5b5)] bg-[length:130%_auto]
                   bg-[position:0%_center] p-3 min-w-[45px] min-h-[45px]
                   rounded-lg text-white font-semibold transition-[background-position]
                   duration-600 ease-in-out hover:bg-[position:100%_center]
                   cursor-pointer focus:outline-none"
      >
        Sign in
      </button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="bg-[linear-gradient(90deg,_#4848b5,_#48b5b5)] bg-[length:130%_auto]
                     bg-[position:0%_center] p-3 min-w-[45px] min-h-[45px]
                     rounded-lg text-white font-semibold transition-[background-position]
                     duration-600 ease-in-out hover:bg-[position:100%_center]
                     cursor-pointer focus:outline-none"
        >
          {getInitials(user)}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className="bg-[#24252A] text-white border border-gray-700 shadow-lg"
      >
        <DropdownMenuItem asChild className="cursor-pointer focus:outline-none">
          <Link href="/account" prefetch>Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500 cursor-pointer focus:outline-none"
          onSelect={handleSignOut}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
