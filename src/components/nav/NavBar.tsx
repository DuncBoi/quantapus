'use client'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import LoginButton from '@/components/nav/LoginButton'
import { usePathname } from 'next/navigation'
import GooglePromptModal from './GooglePromptModal'

export default function NavBar() {
  const pathname = usePathname()
  const [showGoogleModal, setShowGoogleModal] = useState(false)

  const navLinks = [
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/problems', label: 'Problems' }
  ]

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#24252A] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
    <nav className="bg-[#24252A] mx-1 rounded-[12px] shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-12">
          <Link href="/" className="block">
            <Image src="/logo.svg" alt="Quantapus Logo" width={40} height={40} className="logo" />
          </Link>
          {/* NAV LINKS */}
          {navLinks.map(link => {
  const active = pathname.startsWith(link.href)
  return (
    <Link
      key={link.href}
      href={link.href}
      className="relative font-bold px-1 py-0.5"
    >
      <span className="text-white">{link.label}</span>
      {/* White Underline - ONLY when active */}
      <span
        className={`
          pointer-events-none absolute left-0 -bottom-1 w-full h-[3px]
          rounded-full bg-white
          transition-all duration-300 origin-left
          ${active
            ? 'opacity-100 scale-x-100'
            : 'opacity-0 scale-x-0'}
        `}
      />
    </Link>
  )
})}
<GooglePromptModal
        open={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onGoogleSignIn={() => {
          window.dispatchEvent(new CustomEvent('trigger-google-login'))
        }}
      />

        </div>
      <LoginButton onShowModal={() => setShowGoogleModal(true)} />      
      </div>
    </nav>
    </div>
  )
}
