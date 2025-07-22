'use client'
import React, { useEffect, ReactNode } from 'react'
import Link from 'next/link'

interface GooglePromptModalProps {
  open: boolean
  onClose: () => void
  onGoogleSignIn: () => void
  children?: ReactNode
}

export default function GooglePromptModal({
  open,
  onClose,
  onGoogleSignIn,
  children
}: GooglePromptModalProps) {
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="
          relative bg-[#24252A] text-[#e0e0e0]
          px-10 py-10 max-w-[98vw] 
          rounded-2xl shadow-2xl flex flex-col items-center
        "
        style={{ minWidth: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src="/logo.svg"
          alt="Quantapus Logo"
          className="w-[90px] h-[90px] mb-6"
          draggable={false}
        />

        <h2 className="text-3xl font-semibold mb-3 text-white text-center">
          Before you sign in...
        </h2>
        <p className="mb-5 text-base text-center leading-relaxed text-white/90">
          Please review our{' '}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#61a9f1] underline hover:text-[#90c7ff] transition"
          >
            Terms of Service
          </Link>
          {' '} &amp; {' '}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#61a9f1] underline hover:text-[#90c7ff] transition"
          >
            Privacy Policy
          </Link>.
        </p>

        <button
          className="
            flex items-center justify-center gap-3 mt-1 mb-0
            bg-[linear-gradient(90deg,_#4848b5,_#48b5b5)]
            bg-[length:130%_auto]
            bg-[position:0%_center]
            hover:bg-[position:100%_center]
            transition-[background-position] duration-300 ease-in-out
            text-white font-extrabold
            px-7 py-4 rounded-xl text-xl shadow-lg transition
            w-full
            select-none cursor-pointer
          "
          onClick={onGoogleSignIn}
        >
          {/* Google G, all white */}
          <svg className="w-8 h-8" viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M44.5 20H24v8.5h11.7C34.8 33.8 29.9 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.8 0 5.3.9 7.4 2.4l6.4-6.4C34.2 5.4 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c9.8 0 17.8-6.9 19.5-15.9.1-.5.1-1 .1-1.6V20z"
              fill="#fff"
            />
          </svg>
          <span className="text-white font-semibold text-xl">
            Sign in with Google
          </span>
        </button>

        {children}
      </div>
    </div>
  )
}
