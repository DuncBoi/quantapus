"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
    const { user, loading, login, logout } = useAuth();

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
            <button id="signInButton" onClick={() => login()} className="bg-[linear-gradient(90deg,_#4848b5,_#48b5b5)] bg-[length:130%_auto] bg-[position:0%_center] p-3 min-w-[45px] min-h-[45px] rounded-lg cursor-pointer transition-[background-position] duration-300 ease-in-out hover:bg-[position:100%_center]">Sign In</button>
        </div>
    </nav>
  );
}
