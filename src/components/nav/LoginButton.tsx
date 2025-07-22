'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { createClient } from '@/utils/supabase/client'
import { getInitials } from '@/lib/getInitials'
import { useEffect } from 'react'

interface LoginButtonProps {
  onShowModal: () => void
}

export default function LoginButton({ onShowModal }: LoginButtonProps) {
  const user = useUser()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Listen for custom event to trigger Google login
    const handler = async () => {
      const currUrl = window.location.origin + window.location.pathname + window.location.search
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currUrl
        }
      })
      if (error) {
        console.error('OAuth error:', error)
      } else if (data?.url) {
        window.location.href = data.url
      }
    }
    window.addEventListener('trigger-google-login', handler)
    return () => window.removeEventListener('trigger-google-login', handler)
  }, [supabase])

  const handleLogin = async () => {
    if (user) {
      await supabase.auth.signOut()
    } else {
      onShowModal()
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="
        bg-[linear-gradient(90deg,_#4848b5,_#48b5b5)]
        bg-[length:130%_auto]
        bg-[position:0%_center]
        p-3 min-w-[45px] min-h-[45px]
        rounded-lg cursor-pointer
        transition-[background-position] duration-300 ease-in-out
        hover:bg-[position:100%_center]
      "
    >
      {user ? getInitials(user) : 'Sign in'}
    </button>
  )
}
