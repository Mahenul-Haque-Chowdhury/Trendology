"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || 'static'
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Lightweight progress indicator using navigation events via history API patch
  useEffect(() => {
    let timeout: any
    const handleStart = () => { clearTimeout(timeout); timeout = setTimeout(() => setLoading(true), 120) }
    const handleDone = () => { clearTimeout(timeout); setLoading(false) }
    // We don't have Router events in app dir; hack using pushState/replaceState
    const origPush = window.history.pushState
    const origReplace = window.history.replaceState
    function wrap(fn: typeof window.history.pushState) {
      return function(this: any, ...args: any[]) { handleStart(); const r = fn.apply(this, args as any); requestAnimationFrame(handleDone); return r }
    }
    window.history.pushState = wrap(origPush)
    window.history.replaceState = wrap(origReplace)
    window.addEventListener('popstate', handleStart)
    window.addEventListener('load', handleDone)
    return () => {
      window.history.pushState = origPush
      window.history.replaceState = origReplace
      window.removeEventListener('popstate', handleStart)
      window.removeEventListener('load', handleDone)
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[70] h-1.5">
          <div className="absolute inset-0 bg-gradient-to-r from-brand via-amber-400 to-brand animate-[progress_1s_linear_infinite] rounded-b">
            <style jsx>{`
              @keyframes progress { 0% { transform:translateX(-40%) } 50% { transform:translateX(10%) } 100% { transform:translateX(100%) } }
            `}</style>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 mx-auto w-full max-w-[1600px] px-2 sm:px-3 md:px-4 pt-[calc(var(--site-header-height,4rem)+1rem)] pb-6 sm:pb-8"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </>
  )
}
