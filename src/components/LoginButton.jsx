'use client'

import { supabase } from '@/utils/supabaseClient'

export default function LoginButton() {
  const login = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return <button className="bg-[linear-gradient(90deg,_#4848b5,_#48b5b5)] bg-[length:130%_auto] bg-[position:0%_center] p-3 min-w-[45px] min-h-[45px] rounded-lg cursor-pointer transition-[background-position] duration-300 ease-in-out hover:bg-[position:100%_center]" onClick={login}>Sign in</button>
}