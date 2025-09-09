"use client"
import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type Toast = {
  id: string
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
  dismissLabel?: string
  onDismiss?: () => void
  variant?: 'default' | 'success' | 'error'
  duration?: number
}

type ToastCtx = {
  push: (t: Omit<Toast, 'id'>) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { duration: 4500, variant: 'default', ...t, id }
    setToasts((prev) => [...prev, toast])
    if (toast.duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, toast.duration)
    }
  }, [])

  const remove = (id: string) => setToasts((p) => p.filter((t) => t.id !== id))

  return (
    <Ctx.Provider value={{ push }}>
      {children}
  <div className="pointer-events-none fixed top-4 inset-x-0 sm:top-5 sm:inset-x-auto sm:right-5 z-[60] flex flex-col items-center sm:items-end gap-3 sm:gap-4 w-full sm:w-auto px-2 sm:px-0">
        <AnimatePresence initial={false}>
          {toasts.map(t => {
            const color = t.variant === 'success' ? 'from-emerald-500 to-emerald-600' : t.variant === 'error' ? 'from-rose-500 to-rose-600' : 'from-brand to-[#5CF5E0]'
            return (
              <motion.div
                key={t.id}
                initial={{ y: -20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -16, opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26, mass: 0.8 }}
                className="pointer-events-auto relative overflow-hidden rounded-xl bg-white shadow-lg sm:shadow-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 mx-auto w-full sm:w-auto"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r animate-pulse opacity-70" style={{ backgroundImage: 'linear-gradient(to right,var(--brand-base),#5CF5E0)' }} />
                <div className="p-4 sm:p-5 pr-4 flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    {t.variant === 'success' && (
                      <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <svg className="h-5 w-5 sm:h-5 sm:w-5 anim-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                        <span className="absolute inset-0 rounded-full bg-emerald-400/30 anim-ping-slow" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      {t.title && <div className="font-semibold text-[14px] sm:text-[15px] mb-0.5 leading-tight tracking-tight">{t.title}</div>}
                      <div className="text-[12px] sm:text-[13px] text-gray-700 dark:text-gray-200 leading-snug break-words">
                        {t.message}
                      </div>
                    </div>
                  </div>
                   <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                    {t.onAction && t.actionLabel && (
                      <button
                        onClick={() => { t.onAction?.(); remove(t.id) }}
                        className="inline-flex items-center rounded-full bg-brand text-white px-3 sm:px-4 h-8 sm:h-9 text-[11px] sm:text-xs font-semibold shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand/60"
                      >{t.actionLabel}</button>
                    )}
                    {t.onDismiss && t.dismissLabel && (
                      <button
                        onClick={() => { t.onDismiss?.(); remove(t.id) }}
                        className="inline-flex items-center rounded-full border px-3 sm:px-4 h-8 sm:h-9 text-[11px] sm:text-xs font-medium bg-white/80 backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
                      >{t.dismissLabel}</button>
                    )}
                    <button
                      onClick={() => remove(t.id)}
                      aria-label="Close"
                      className="ml-auto text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >✕</button>
                  </div>
                </div>
                <div className={`absolute inset-0 -z-10 opacity-[0.07] bg-gradient-to-br ${color}`} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
