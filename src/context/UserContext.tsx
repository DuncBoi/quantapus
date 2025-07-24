// context/UserContext.tsx
'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import GooglePromptModal from '@/components/nav/GooglePromptModal'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

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

  // prevents duplicate toasts
  const lastEventRef = useRef<string | null>(null)

  const greenToast = (msg: string) =>
    toast.custom(() => (
      <div className="pointer-events-auto flex items-center gap-2 w-full max-w-sm
                      bg-green-500 text-white rounded-2xl px-5 py-4 shadow-[0_0_22px_rgba(0,255,120,0.35)]">
        <Check className="w-5 h-5" strokeWidth={3} />
        <span className="text-base font-semibold">{msg}</span>
      </div>
    ), { duration: 2000, position: 'bottom-right' })

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      // ignore init + suppress duplicates
      if (event === 'INITIAL_SESSION' || lastEventRef.current === event) return
      lastEventRef.current = event

      if (event === 'SIGNED_IN')  greenToast('Signed in')
      if (event === 'SIGNED_OUT') greenToast('Signed out')
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
    if (error) console.error(error)
    // don't close; redirect will wipe anyway
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
