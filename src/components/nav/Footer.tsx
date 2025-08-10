'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="w-full bg-[#24252A] text-[#e0e0e0] border-t border-[#333] shadow-inner mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center md:justify-between gap-4">
        {/* Left: Logo and site name, copyright below */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Quantapus Logo"
              width={40}   // or whatever size you want
  height={40}
            />
            <span className="font-extrabold text-lg text-white tracking-tight select-none">
              Quantapus
            </span>
          </div>
          <div className="text-xs text-[#b5b5b5] mt-1 select-none">
            &copy; {new Date().getFullYear()} Quantapus. All rights reserved.
          </div>
        </div>

        {/* Right: Links */}
        <div className="flex gap-6 text-base font-semibold">
          <Link
            href="/privacy"
            className="hover:text-[#61a9f1] transition"
            prefetch
          >Privacy Policy</Link>
          <Link
            href="/terms"
            className="hover:text-[#61a9f1] transition"
            prefetch
          >Terms of Service</Link>
          <Link
            href="/contact"
            className="hover:text-[#61a9f1] transition"
            prefetch
          >Contact</Link>
        </div>
      </div>
    </footer>
  )
}
