"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from './products'

export type CartItem = { product: Product; qty: number }

export type CartState = {
  items: CartItem[]
  add: (product: Product, qty?: number, opts?: { openDrawer?: boolean }) => void
  remove: (productId: string) => void
  update: (productId: string, qty: number) => void
  clear: () => void
  open: boolean
  setOpen: (open: boolean) => void
  hydrated: boolean
}

const CartCtx = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Start with an empty cart for SSR parity; hydrate after mount to avoid hydration mismatch
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Load from storage after mount (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      // Migrate legacy key
      const legacy = localStorage.getItem('storefront.cart.v1')
      if (legacy && !localStorage.getItem('trendology.cart.v1')) {
        localStorage.setItem('trendology.cart.v1', legacy)
      }
      const raw = localStorage.getItem('trendology.cart.v1')
      let parsed = raw ? (JSON.parse(raw) as CartItem[]) : []
      if (!parsed || !Array.isArray(parsed)) {
        const m = document.cookie.match(/(?:^|; )cart=([^;]*)/)
        if (m) {
          try { parsed = JSON.parse(decodeURIComponent(m[1])) } catch {}
        }
      }
      if (Array.isArray(parsed)) setItems(parsed)
    } catch {
      // ignore
    } finally {
      setHydrated(true)
    }
  }, [])


  // Persist on change, but only after initial hydration to avoid overwriting saved cart with []
  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) return
    try {
  localStorage.setItem('trendology.cart.v1', JSON.stringify(items))
      // Cookie fallback (7 days)
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `cart=${encodeURIComponent(JSON.stringify(items))}; path=/; expires=${expires}`
    } catch {
      // ignore
    }
  }, [items, hydrated])

  const api: CartState = useMemo(() => ({
    items,
    open,
    setOpen,
    hydrated,
    add: (product, qty = 1, opts) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.product.id === product.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
          return next
        }
        return [...prev, { product, qty }]
      })
      if (opts?.openDrawer !== false) setOpen(true)
    },
    remove: (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId)),
    update: (productId, qty) =>
      setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, qty: Math.max(1, qty) } : i))),
    clear: () => setItems([]),
  }), [items, open, hydrated])

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  const count = ctx.items.reduce((acc, i) => acc + i.qty, 0)
  const total = ctx.items.reduce((acc, i) => acc + i.qty * i.product.price, 0)
  return { ...ctx, count, total }
}
