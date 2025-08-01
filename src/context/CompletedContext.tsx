'use client'
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/context/UserContext'
import { badToast } from '@/components/ui/toasts'

type CompletedContextType = {
  completedIds: Set<number>
  toggleCompleted: (id: number) => void
  clearCompleted: () => void
  streakInfo: { streak: number, last_completed_at: string | null } | null
  setStreakInfo: React.Dispatch<React.SetStateAction<{ streak: number, last_completed_at: string | null } | null>>
}

const CompletedContext = createContext<CompletedContextType>({
  completedIds: new Set(),
  toggleCompleted: () => { },
  clearCompleted: () => { },
  streakInfo: null,
  setStreakInfo: () => { },
})

export function CompletedProvider({
  initialCompleted = new Set(),
  initialStreakInfo = null,
  children,
}: {
  initialCompleted?: Set<number>
  initialStreakInfo?: { streak: number, last_completed_at: string | null } | null
  children: ReactNode
}) {
  const user = useUser()
  const [completedIds, setCompletedIds] = useState<Set<number>>(initialCompleted)
  const [streakInfo, setStreakInfo] = useState<{ streak: number, last_completed_at: string | null } | null>(initialStreakInfo)
  const pendingOpsRef = useRef<Map<number, boolean>>(new Map())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setCompletedIds(new Set())
      setStreakInfo(null)
      return
    }
    supabase
      .from('completed_problems')
      .select('problem_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error) {
          setCompletedIds(new Set(data?.map((r) => r.problem_id) || []))
        }
        else {
          badToast('Error Loading Completed Problems')
          console.error(error)
        }
      })

    supabase
      .from('user_info')
      .select('streak, last_completed_at')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setStreakInfo(data)
        } else {
          setStreakInfo(null)
        }
      })
  }, [user, supabase])

  // Debounced save to db
  const flush = () => {
    const ops = pendingOpsRef.current
    pendingOpsRef.current = new Map()
    ops.forEach((shouldComplete, id) => {
      if (!user) return
      const q = supabase.from('completed_problems')
      if (shouldComplete) {
        q.insert({ user_id: user.id, problem_id: id }).then(async ({ error }) => {
          if (error) {
            console.error(error)
          } else {
            const today = new Date().toISOString().slice(0, 10)
            const { data: userInfo, error: infoErr } = await supabase
              .from('user_info')
              .select('streak,last_completed_at')
              .eq('id', user.id)
              .single()
            if (infoErr || !userInfo) {
              console.error(infoErr || 'No user_info')
              return
            }
            let newStreak = 1
            if (userInfo.last_completed_at === today) {
              newStreak = userInfo.streak
            } else {
              const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
              if (userInfo.last_completed_at === yesterday) {
                newStreak = userInfo.streak + 1
              }
            }
            // 3. Update user_info
            const { error: updateErr } = await supabase
              .from('user_info')
              .update({ streak: newStreak, last_completed_at: today })
              .eq('id', user.id)
            if (updateErr) {
              console.error(updateErr)
            }
          }
        })
      } else {
        q.delete().match({ user_id: user.id, problem_id: id }).then(({ error }) => {
          if (error) {
            console.error(error)
          }
        })
      }
    })
    timeoutRef.current = null
  }

  const scheduleFlush = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(flush, 800)
  }

  const toggleCompleted = (id: number) => {
    if (!user) return

    // Determine whether we’re marking it complete or un-complete
    const newState = !completedIds.has(id)

    // 1. Update completedIds immediately
    setCompletedIds(prev => {
      const next = new Set(prev)
      if (newState) next.add(id)
      else next.delete(id)
      return next
    })

    // 2. Immediately update streakInfo if it’s a new completion
    if (newState) {
      const today = new Date().toISOString().slice(0, 10)
      let nextStreak = 1
      if (streakInfo?.last_completed_at === today) {
        nextStreak = streakInfo.streak
      } else {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10)
        if (streakInfo?.last_completed_at === yesterday) {
          nextStreak = streakInfo.streak + 1
        }
      }
      setStreakInfo({ streak: nextStreak, last_completed_at: today })
    }

    // 3. Queue the DB write
    pendingOpsRef.current.set(id, newState)
    scheduleFlush()
  }

  const clearCompleted = () => {
    setCompletedIds(new Set())
    pendingOpsRef.current = new Map()
  }

  return (
    <CompletedContext.Provider value={{ completedIds, toggleCompleted, clearCompleted, streakInfo, setStreakInfo }}>
      {children}
    </CompletedContext.Provider>
  )
}

export function useCompleted() {
  return useContext(CompletedContext)
}
