'use client'
import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import Footer from '@/components/nav/Footer'
import { ChevronRight } from 'lucide-react'

function loadVantaScript(): Promise<void> {
  if (typeof window !== 'undefined' && !(window as any).VANTA) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = reject
      document.body.appendChild(script)
    })
  }
  return Promise.resolve()
}

export default function Home() {
  const vantaRef = useRef<any>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    loadVantaScript().then(() => {
      if (
        !cancelled &&
        typeof window !== 'undefined' &&
        (window as any).VANTA &&
        (window as any).VANTA.NET &&
        !vantaEffect.current
      ) {
        vantaEffect.current = (window as any).VANTA.NET({
          el: vantaRef.current,
          mouseControls: false,
          touchControls: false,
          minHeight: 500.0,
          minWidth: 500.0,
          color: 0x61a9f1,
          backgroundColor: 0x24252A,
          points: 14.0,
          maxDistance: 25.0,
          spacing: 18.0,
          showDots: false,
        })
      }
    })
    return () => {
      cancelled = true
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* VANTA BACKGROUND */}
      <div
        ref={vantaRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{ minHeight: '100vh' }}
        aria-hidden="true"
      />

      {/* GLASSY ANIMATED BOX */}
      <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
  <div
    className="
      pointer-events-auto
      max-w-xl w-[92vw] px-12 py-9
      rounded-3xl
      shadow-2xl
      bg-[#24252ab2]
      border border-[#61a9f1]/60
      flex flex-col items-center
      text-center
    "
    style={{
      boxShadow: '0 0 28px 0 #61a9f180',
      borderWidth: '2px',
      borderStyle: 'solid',
    }}
  >
    <h1 className="font-extrabold text-white text-[clamp(2.5rem,8vw,6rem)] drop-shadow-2xl tracking-tight select-none text-center">
      Quantapus
    </h1>
    <div className="mt-2 text-[1.7rem] sm:text-2xl font-semibold text-white/80 drop-shadow-xl text-center">
    The complete roadmap to
      <span className="ml-2 font-extrabold bg-gradient-to-r from-[#48e0ff] to-[#36ffc1] bg-clip-text text-transparent animate-gradient">
        quantitative finance
      </span>
      <span className="ml-2">interview prep.</span>
    </div>
    <div className="mt-8">
      <Link
  href="/roadmap"
  className="
    px-8 py-4 rounded-2xl text-2xl font-bold
    bg-[#61a9f1]
    text-white shadow-xl
    transition-all duration-200
    border-4 border-transparent
    drop-shadow-lg
    focus:outline-none focus:ring-2
    flex items-center gap-1
  "
>
  Go To Roadmap
  <ChevronRight size={28} className="ml-1" />
</Link>

    </div>
    <div className="mt-8 text-base text-white/60 font-mono text-center">
      120 Free Problems with In-Depth Video Solutions
    </div>
  </div>
</div>


      {/* FOOTER */}
      <div className="relative z-9 pt-[92vh]">
        <Footer />
      </div>
    </div>
  )
}
