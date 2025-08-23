"use client"
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ScrollRestoration() {
  const pathname = usePathname()
  useEffect(() => {
    // Always scroll to top on route change; guard against hash navigation.
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [pathname])
  return null
}
