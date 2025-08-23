"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from './products'
import { useAuth } from './auth'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export type WishlistItem = { product: Product; createdAt: number }

type WishlistState = {
  items: WishlistItem[]
  has: (productId: string) => boolean
  add: (product: Product) => Promise<void>
  remove: (productId: string) => Promise<void>
  toggle: (product: Product) => Promise<void>
  clearLocal: () => void
}

const Key = 'trendology.wishlist.v1'
const Ctx = createContext<WishlistState | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const useSupabase = isSupabaseConfigured()
  const supabase = useSupabase ? getSupabaseClient() : null
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) { setItems([]); return }
      if (useSupabase && supabase) {
        const { data, error } = await supabase
          .from('wishlists')
          .select('product, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (!cancelled && !error && data) {
          setItems(
            data.map((r: any) => ({ product: (r.product as Product) || null, createdAt: new Date(r.created_at).getTime() }))
              .filter((x) => x.product && x.product.id)
          )
        }
        return
      }
      try {
        // Migrate legacy key (one-time)
        try {
          const legacy = localStorage.getItem(`storefront.wishlist.v1:${user.id}`)
          if (legacy && !localStorage.getItem(`${Key}:${user.id}`)) {
            localStorage.setItem(`${Key}:${user.id}`, legacy)
          }
        } catch {}
        const raw = localStorage.getItem(`${Key}:${user.id}`)
        const parsed = raw ? (JSON.parse(raw) as WishlistItem[]) : []
        setItems(parsed)
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [user, useSupabase, supabase])

  useEffect(() => {
    if (!user) return
    try { localStorage.setItem(`${Key}:${user.id}`, JSON.stringify(items)) } catch {}
  }, [items, user])

  const api: WishlistState = useMemo(() => {
    const has = (id: string) => items.some((it) => it.product.id === id)
    const add = async (product: Product) => {
      if (!user) { throw new Error('LOGIN_REQUIRED') }
      if (useSupabase && supabase) {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: product.id, product })
        if (error && !String(error.message).includes('duplicate key')) throw error
      }
      setItems((prev) => (prev.some((i) => i.product.id === product.id) ? prev : [{ product, createdAt: Date.now() }, ...prev]))
    }
    const remove = async (productId: string) => {
      if (!user) { throw new Error('LOGIN_REQUIRED') }
      if (useSupabase && supabase) {
        await supabase.from('wishlists').delete().match({ user_id: user.id, product_id: productId })
      }
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    }
    const toggle = async (product: Product) => {
      if (!user) { throw new Error('LOGIN_REQUIRED') }
      if (has(product.id)) {
        await remove(product.id)
      } else {
        await add(product)
      }
    }
    return {
      items,
      has,
      add,
      remove,
      toggle,
      clearLocal() { setItems([]) },
    }
  }, [items, user, useSupabase, supabase])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useWishlist() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
