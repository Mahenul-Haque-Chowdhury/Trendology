"use client"
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { useEffect, useState } from 'react'

// Simple gate to avoid white flash: waits for auth + cart hydration at minimum.
export default function AppReady({ children }: { children: React.ReactNode }) {
  const { authReady } = useAuth()
  const { hydrated } = useCart()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (authReady && hydrated) {
      // brief RAF to allow layout metrics
      const id = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(id)
    }
  }, [authReady, hydrated])

  if (!shown) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-4 border-brand/20 border-t-brand animate-spin" aria-label="Loading" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
