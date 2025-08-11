'use client'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import LoginButton from '@/components/nav/LoginButton'
import { usePathname } from 'next/navigation'
import { Map, ListTodo } from 'lucide-react'

export default function NavBar() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/roadmap', label: 'Roadmap', icon: Map },
    { href: '/problems', label: 'Problems', icon: ListTodo }
  ]

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--bg)] mx-1 rounded-[12px] shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-6 md:space-x-12">
          <Link href="/" className="block" prefetch>
            <Image src="/logo.svg" alt="Quantapus Logo" width={40} height={40} className="logo" />
          </Link>

          {navLinks.map(link => {
            const active = pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-bold px-1 py-0.5 flex items-center"
                aria-label={link.label}
                prefetch
              >
                {/* Icon for mobile */}
                <Icon className="w-7 h-7 text-white block md:hidden" aria-hidden="true" />
                {/* Text for desktop */}
                <span className="text-white hidden md:inline">{link.label}</span>
                {/* Active underline */}
                <span
                  className={`
                    pointer-events-none absolute left-0 -bottom-1 w-full h-[3px]
                    rounded-full bg-white
                    transition-all duration-300 origin-left
                    ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                  `}
                />
              </Link>
            )
          })}
        </div>

        {/* login/logout */}
        <LoginButton />
      </div>
    </nav>
  )
}
