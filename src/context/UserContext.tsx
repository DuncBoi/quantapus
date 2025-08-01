// context/UserContext.tsx
'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import GooglePromptModal from '@/components/nav/GooglePromptModal'
import { goodToast, badToast } from "@/components/ui/toasts"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Ctx {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  openGooglePrompt: () => void
  closeGooglePrompt: () => void
}

const UserContext = createContext<Ctx | undefined>(undefined)

export function UserProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [showPrompt, setShowPrompt] = useState(false)
  const supabase = createClient()

    const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // prevents duplicate toasts
  const lastEventRef = useRef<string | null>(null)

  // Remove ?code=... and ?state=... from URL after sign-in
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (searchParams.get('code') || searchParams.get('state')) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('code')
      params.delete('state')
      // Only replace if something actually changed
      router.replace(
        pathname + (params.toString() ? '?' + params.toString() : ''),
        { scroll: false }
      )
    }
  }, [router, pathname, searchParams])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      // ignore init + suppress duplicates
      if (event === 'INITIAL_SESSION' || lastEventRef.current === event) return
      lastEventRef.current = event

      if (event === 'SIGNED_IN')  goodToast('Signed in')
      if (event === 'SIGNED_OUT') goodToast('Signed out')
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const openGooglePrompt  = useCallback(() => setShowPrompt(true), [])
  const closeGooglePrompt = useCallback(() => setShowPrompt(false), [])

  const onGoogleSignIn = async () => {
    const currUrl = window.location.origin + window.location.pathname + window.location.search
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: currUrl },
    })
    if (error) {
      console.error(error)
      badToast('Google sign-in failed')
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, openGooglePrompt, closeGooglePrompt }}>
      {children}
      <GooglePromptModal open={showPrompt} onClose={closeGooglePrompt} onGoogleSignIn={onGoogleSignIn} />
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx.user
}
export function useAuthUI() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useAuthUI must be used within a UserProvider')
  return { openGooglePrompt: ctx.openGooglePrompt, closeGooglePrompt: ctx.closeGooglePrompt }
}
