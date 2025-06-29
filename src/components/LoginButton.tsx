'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

interface LoginButtonProps { initialLabel?: string }
export default function LoginButton({ initialLabel }: LoginButtonProps) {
  const [label, setLabel] = useState(initialLabel)
  const [user,  setUser ] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) {
        setLabel('')
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u){
        setLabel('')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])
  
  const handleLogin = async () => {
    if (user) {
      await supabase.auth.signOut()
    } else {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (data?.url) window.location.href = data.url
      if (error) console.error(error)
    }
  }

    return <button className="bg-[linear-gradient(90deg,_#4848b5,_#48b5b5)] bg-[length:130%_auto] bg-[position:0%_center] p-3 min-w-[45px] min-h-[45px] rounded-lg cursor-pointer transition-[background-position] duration-300 ease-in-out hover:bg-[position:100%_center]" 
      onClick={handleLogin}>
        {label || "Sign in"}
      </button>
      
}

