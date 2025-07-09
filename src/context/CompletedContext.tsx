'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/context/UserContext'

interface CompletedContextType {
    completedIds: Set<number>
    toggleCompleted: (id: number) => void
}

const CompletedContext = createContext<CompletedContextType | undefined>(undefined)

export function CompletedProvider({ children }: { children: ReactNode }) {
    const user = useUser()
    const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
    const pendingOpsRef = useRef<Map<number, boolean>>(new Map())
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const supabase = createClient()

    // Load initial completed problems for signed-in user
    useEffect(() => {
        if (!user) {
            setCompletedIds(new Set())
            return
        }
        supabase
            .from('completed_problems')
            .select('problem_id')
            .eq('user_id', user.id)
            .then(({ data, error }) => {
                if (error) {
                    console.error(error)
                    return
                }
                const ids = new Set<number>(data?.map((r) => r.problem_id) ?? [])
                setCompletedIds(ids)
            })
    }, [user])

    // Flush pending operations to Supabase
    const flush = () => {
        const ops = pendingOpsRef.current
        pendingOpsRef.current = new Map()
        ops.forEach((shouldComplete, id) => {
            if (!user) return
            if (shouldComplete) {
                supabase
                    .from('completed_problems')
                    .insert({ user_id: user.id, problem_id: id })
                    .then(({ error }) => error && console.error(error))
            } else {
                supabase
                    .from('completed_problems')
                    .delete()
                    .match({ user_id: user.id, problem_id: id })
                    .then(({ error }) => error && console.error(error))
            }
        })
        timeoutRef.current = null
    }

    // Schedule a debounced flush
    const scheduleFlush = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(flush, 800)
    }

    const toggleCompleted = (id: number) => {
        setCompletedIds((prev) => {
            const next = new Set(prev)
            const newState = !next.has(id)
            if (newState) next.add(id)
            else next.delete(id)

            // queue the operation
            pendingOpsRef.current.set(id, newState)
            scheduleFlush()
            return next
        })
    }

    return (
        <CompletedContext.Provider
            value={{ completedIds, toggleCompleted }}
        >
            {children}
        </CompletedContext.Provider>
    )
}

export function useCompleted() {
    const ctx = useContext(CompletedContext)
    if (!ctx) throw new Error('useCompleted must be used within CompletedProvider')
    return ctx
}
