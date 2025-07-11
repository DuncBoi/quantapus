'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { createClient } from '@/utils/supabase/client'
import { getInitials } from '@/lib/getInitials'

export default function LoginButton() {
  const user = useUser()
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
  if (user) {
    await supabase.auth.signOut()
  } else {
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
