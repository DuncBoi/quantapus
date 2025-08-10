/* eslint-disable @typescript-eslint/no-explicit-any */
/* es lint needs to stfu ima use any all i want*/
'use client'
import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import Footer from '@/components/nav/Footer'

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
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    function updateVh() {
      // 1vh = 1% of the viewport height at load time
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    }
    updateVh()
    window.addEventListener('resize', updateVh)
    return () => window.removeEventListener('resize', updateVh)
  }, [])


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
          maxDistance: 20.0,
          spacing: 10.0,
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
    <>
      <div
        className="fixed top-0 left-0 w-full z-0 pointer-events-none"
        style={{ height: 'calc(var(--vh) * 100)' }}
      >
        {/* VANTA BACKGROUND */}
        <div
          ref={vantaRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* BOX */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
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
          <h1 className="font-extrabold text-white text-fluid-xl select-none text-center">
            Quantapus
          </h1>

          <p className="mt-2 text-fluid-small font-semibold text-white/80 drop-shadow-xl text-center leading-tight">
            The complete{' '}
            <Link
              href="/roadmap"
              className="
                inline-flex items-baseline gap-1 font-bold
                underline decoration-transparent underline-offset-4
                hover:decoration-current hover:text-white transition-colors
              "
              prefetch
            >
              <span className="bg-gradient-to-r from-[#48e0ff] to-[#36ffc1] bg-clip-text text-transparent animate-gradient">
                Roadmap
              </span>
            </Link>{' '}
            to learning
            <span className="font-extrabold text-white/80"> probability theory</span>
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-9 pt-[92vh]">
        <Footer />
      </div>
    </>
  )
}
