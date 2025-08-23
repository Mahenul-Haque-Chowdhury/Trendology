"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || 'static'
  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1 mx-auto w-full max-w-[1600px] px-2 sm:px-3 md:px-4 pt-[calc(var(--site-header-height,4rem)+1rem)] pb-6 sm:pb-8"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  )
}
