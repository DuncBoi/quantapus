'use client'
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/context/UserContext'
import { badToast } from '@/components/ui/toasts'

type CompletedContextType = {
  completedIds: Set<number>
  toggleCompleted: (id: number) => void
  clearCompleted: () => void
}

const CompletedContext = createContext<CompletedContextType>({
  completedIds: new Set(),
  toggleCompleted: () => { },
  clearCompleted: () => { },
})

export function CompletedProvider({
  initialCompleted = new Set(),
  children,
}: {
  initialCompleted?: Set<number>
  children: ReactNode
}) {
  const user = useUser()
  const [completedIds, setCompletedIds] = useState<Set<number>>(initialCompleted)
  const pendingOpsRef = useRef<Map<number, boolean>>(new Map())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setCompletedIds(new Set())
      return
    }
    // Fetch for new user (after sign-in)
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
  }, [user, supabase])

  // Debounced save to db
  const flush = () => {
    const ops = pendingOpsRef.current
    pendingOpsRef.current = new Map()
    ops.forEach((shouldComplete, id) => {
      if (!user) return
      const q = supabase.from('completed_problems')
      if (shouldComplete) {
        q.insert({ user_id: user.id, problem_id: id }).then(({ error }) => {
          if (error) {
            console.error(error)
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
    setCompletedIds((prev) => {
      const next = new Set(prev)
      const newState = !next.has(id)
      if (newState) {
        next.add(id)
      } else {
        next.delete(id)
      }
      pendingOpsRef.current.set(id, newState)
      scheduleFlush()
      return next
    })
  }

  // <--- ADDED: clearCompleted
  const clearCompleted = () => {
    setCompletedIds(new Set())
    pendingOpsRef.current = new Map()
    // optionally, flush() if you want to push deletes to db immediately
  }

  return (
    <CompletedContext.Provider value={{ completedIds, toggleCompleted, clearCompleted }}>
      {children}
    </CompletedContext.Provider>
  )
}

export function useCompleted() {
  return useContext(CompletedContext)
}
