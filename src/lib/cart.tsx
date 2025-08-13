"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from './products'

export type CartItem = { product: Product; qty: number }

export type CartState = {
  items: CartItem[]
  add: (product: Product, qty?: number) => void
  remove: (productId: string) => void
  update: (productId: string, qty: number) => void
  clear: () => void
  open: boolean
  setOpen: (open: boolean) => void
}

const CartCtx = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('storefront.cart.v1')
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Persist on change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('storefront.cart.v1', JSON.stringify(items))
    } catch (e) {
      // ignore
    }
  }, [items])

  const api: CartState = useMemo(() => ({
    items,
    open,
    setOpen,
    add: (product, qty = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.product.id === product.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
          return next
        }
        return [...prev, { product, qty }]
      })
      setOpen(true)
    },
    remove: (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId)),
    update: (productId, qty) =>
      setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, qty: Math.max(1, qty) } : i))),
    clear: () => setItems([]),
  }), [items, open])

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  const count = ctx.items.reduce((acc, i) => acc + i.qty, 0)
  const total = ctx.items.reduce((acc, i) => acc + i.qty * i.product.price, 0)
  return { ...ctx, count, total }
}
