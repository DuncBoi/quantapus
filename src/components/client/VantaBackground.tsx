/* eslint-disable @typescript-eslint/no-explicit-any */
/* es lint needs to stfu ima use any all i want*/
'use client'
import React, { useRef, useEffect } from 'react'

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

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<{ destroy: () => void } | null>(null)

  // --vh setup (exact same)
  useEffect(() => {
    function updateVh() {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    }
    updateVh()
    window.addEventListener('resize', updateVh)
    return () => window.removeEventListener('resize', updateVh)
  }, [])

  // VANTA init/destroy (exact same)
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
          backgroundColor: 0x1f1f24,
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
  )
}
