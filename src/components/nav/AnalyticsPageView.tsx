'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function AnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

      // GA4 page_view
      window.gtag('event', 'page_view', { page_path: path })

      // Google Ads page_path
      window.gtag('config', 'AW-17487789717', { page_path: path })
    }
  }, [pathname, searchParams])

  return null
}
