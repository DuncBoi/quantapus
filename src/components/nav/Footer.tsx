'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Github, Linkedin } from 'lucide-react' // Lucide icons
import { FaRedditAlien } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="w-full bg-[#24252A] text-[#e0e0e0] border-t border-[#333] shadow-inner mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center md:justify-between gap-4">
        
        {/* Left: Logo and site name, copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Quantapus Logo"
              width={40}
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

        {/* Right: Links + Social */}
        <div className="flex flex-col items-center md:items-end gap-3">
          {/* Main Links */}
          <div className="flex gap-6 text-base font-semibold">
            <Link
              href="/privacy"
              className="hover:text-[var(--qp1)] transition"
              prefetch
            >Privacy Policy</Link>
            <Link
              href="/terms"
              className="hover:text-[var(--qp1)] transition"
              prefetch
            >Terms of Service</Link>
            <Link
              href="/contact"
              className="hover:text-[var(--qp1)] transition"
              prefetch
            >Contact</Link>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <Link
              href="https://github.com/DuncBoi/quantapus"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--qp1)] transition"
            >
              <Github size={20} />
            </Link>
            <Link
              href="https://www.reddit.com/r/Quantapus/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--qp1)] transition"
            >
              <FaRedditAlien size={20} />
            </Link>
            <Link
              href="https://www.linkedin.com/company/quantapus"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--qp1)] transition"
            >
              <Linkedin size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
