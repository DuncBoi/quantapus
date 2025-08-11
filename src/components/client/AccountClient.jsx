'use client'
import React, { useState } from 'react'
import { useUser } from '@/context/UserContext'
import { useCompleted } from '@/context/CompletedContext'
import { createClient } from '@/utils/supabase/client'
import { getInitials } from '@/lib/getInitials'
import { useRouter } from 'next/navigation'
import { goodToast, badToast } from "@/components/ui/toasts"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

export default function AccountClient() {
  const user = useUser()
  const { clearCompleted, setStreakInfo } = useCompleted()
  const supabase = createClient()
  const router = useRouter()

  // Dialog state
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="text-white text-2xl font-bold p-8 bg-[#24252A] rounded-2xl shadow-xl">
          You are not signed in.
        </div>
      </div>
    )
  }

  // Reset progress
  const handleResetProgress = async () => {
    setShowResetDialog(false)
    try {
      clearCompleted()
      setStreakInfo({ streak: 0, last_completed_at: null }) // reset locally

      const { error: delErr } = await supabase
        .from('completed_problems')
        .delete()
        .eq('user_id', user.id)

      const { error: updErr } = await supabase
        .from('user_info')
        .update({ streak: 0, last_completed_at: null })
        .eq('id', user.id)

      if (delErr || updErr) throw delErr || updErr
      goodToast('Progress reset!')
    } catch {
      badToast('Failed to reset progress')
    }
  }

  // Delete Supabase user account
  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Unknown error')
      }
      await supabase.auth.signOut()
      goodToast('Account deleted!')
      router.push('/')
    } catch {
      badToast('Account deletion failed')
    }
  }

  // Sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      badToast('Failed to sign out')
    }
  }

  const metadata = user.user_metadata
  const displayName = metadata.full_name ?? (user.email ? user.email.split('@')[0] : '')

  return (
    <div className="flex items-start pt-25 justify-center min-h-screen p-8 bg-[var(--bg)]">
      <div className="w-full max-w-[400px] py-10 px-8 bg-[#24252A] text-[#e0e0e0] rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.7)] text-center">
        <h1 className="text-[2.25rem] font-bold text-white mb-6 border-b-2 border-[#333] pb-2">
          My Account
        </h1>

        <div className="flex flex-col items-center mb-8">
          <div
            className="w-24 h-24 rounded-full bg-gradient-to-r from-[#4848b5] to-[#48b5b5]
                       bg-[length:130%_auto] shadow-[0_4px_12px_rgba(0,0,0,0.5)]
                       flex items-center justify-center text-2xl font-semibold text-white mb-4"
          >
            {getInitials(user)}
          </div>
          <p>
            <strong className="text-lg">{displayName}</strong>
          </p>
          <p className="text-base">{user.email}</p>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          {/* --- Reset Progress --- */}
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <button
                className="w-full px-5 py-3 text-base font-medium bg-[var(--qp1)] text-black
                           rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)]
                           hover:shadow-[0_6px_16px_rgba(0,0,0,0.6)]
                           active:translate-y-0 active:shadow-[0_3px_8px_rgba(0,0,0,0.4)] cursor-pointer hover:-translate-y-0.5 transition-all duration-500"
              >
                Reset Progress
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#24252A] text-white border-none">
              <DialogTitle>Reset Progress?</DialogTitle>
              <DialogDescription className="text-[#bbbbbb]">
                This will permanently remove the status of all completed problems from your Quantapus account. It cannot be undone.
              </DialogDescription>
              <DialogFooter>
                <button
                  className="px-4 py-2 rounded bg-gray-600 text-white font-semibold mr-2 cursor-pointer hover:-translate-y-0.5 transition-all duration-500"
                  onClick={() => setShowResetDialog(false)}
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded bg-[var(--qp1)] text-black font-semibold cursor-pointer hover:-translate-y-0.5 transition-all duration-500"
                  onClick={handleResetProgress}
                >Yes, Reset</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* --- Sign Out --- */}
          <button
            onClick={handleSignOut}
            className="w-full px-5 py-3 text-base font-medium bg-[#444d58] text-white
                       rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.45)]
                       hover:shadow-[0_6px_16px_rgba(0,0,0,0.65)]
                       active:translate-y-0 active:shadow-[0_3px_8px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
          >
            Sign Out
          </button>

          {/* --- Delete Account --- */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <button
                className="w-full px-5 py-3 text-base font-medium bg-[#e55353] text-white
                           rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)]
                           hover:shadow-[0_6px_16px_rgba(0,0,0,0.6)]
                           active:translate-y-0 active:shadow-[0_3px_8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
              >
                Delete Account
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#24252A] text-white border-none">
              <DialogTitle>Delete Account?</DialogTitle>
              <DialogDescription className="text-[#bbbbbb]">
                This will permanently delete all of the data associated with your Quantapus account. It cannot be undone.
              </DialogDescription>
              <DialogFooter>
                <button
                  className="px-4 py-2 rounded bg-gray-600 text-white font-semibold mr-2 cursor-pointer hover:-translate-y-0.5 transition-all duration-500 "
                  onClick={() => setShowDeleteDialog(false)}
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded bg-[#e55353] text-white font-semibold cursor-pointer hover:-translate-y-0.5 transition-all duration-500"
                  onClick={handleDeleteAccount}
                >Yes, Delete</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
