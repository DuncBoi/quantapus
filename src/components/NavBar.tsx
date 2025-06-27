"use client"
import Link from 'next/link';
import Image from 'next/image';
import LoginButton from '@/components/LoginButton'

export default function NavBar() {
  return (
    <nav className="bg-[#24252A] mx-1 rounded-[12px] shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
        <div className="flex flex-wrap items-center justify-between mx-auto p-4">
            {/* Left Group */}
            <div className="flex items-center space-x-12">
                {/* Logo */}
                <Link href="/" className="block">
                    <Image
                        src="/logo.svg"
                        alt="Quantapus Logo"
                        width={40}
                        height={40}
                        className="logo"
                    />
                </Link>

                {/* Main links */}
                <Link href="/roadmap" className="block font-bold active:underline">Roadmap</Link>
                <Link href="/problems" className="block font-bold ">Problems</Link>
            </div>

            {/* Auth */}
            <LoginButton></LoginButton>
        </div>
    </nav>
  );
}
