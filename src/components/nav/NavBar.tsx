'use client'
import Link from 'next/link'
import Image from 'next/image'
import LoginButton from '@/components/nav/LoginButton'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/problems', label: 'Problems' }
  ]

  const searchParams = useSearchParams()
    const filterParams = searchParams?.toString()


  return (
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

        </div>
        <LoginButton />
      </div>
    </nav>
  )
}
