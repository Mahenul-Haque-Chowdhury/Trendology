"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from './products'
import { useAuth } from './auth'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export type FavoriteItem = { product: Product; createdAt: number }

type FavoritesState = {
  items: FavoriteItem[]
  has: (productId: string) => boolean
  add: (product: Product) => Promise<void>
  remove: (productId: string) => Promise<void>
  toggle: (product: Product) => Promise<void>
  clearLocal: () => void
}

const Key = 'trendology.favorites.v1'
const Ctx = createContext<FavoritesState | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const useSupabase = isSupabaseConfigured()
  const supabase = useSupabase ? getSupabaseClient() : null
  const [items, setItems] = useState<FavoriteItem[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) { setItems([]); return }
      if (useSupabase && supabase) {
        const { data, error } = await supabase
          .from('favorites')
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
        const raw = localStorage.getItem(`${Key}:${user.id}`)
        const parsed = raw ? (JSON.parse(raw) as FavoriteItem[]) : []
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

  const api: FavoritesState = useMemo(() => {
    const has = (id: string) => items.some((it) => it.product.id === id)
    const add = async (product: Product) => {
      if (!user) { throw new Error('LOGIN_REQUIRED') }
      // Only save in-stock (active !== false) items to favorites (later checkout list)
      if (product.active === false) return
      let supabaseFailed = false
      if (useSupabase && supabase) {
        try {
          const { error } = await supabase
            .from('favorites')
            .insert({ user_id: user.id, product_id: product.id, product })
          if (error && !String(error.message).includes('duplicate key')) {
            supabaseFailed = true
            console.warn('[favorites] insert failed, falling back to local storage:', error.message)
          }
        } catch (e:any) {
          supabaseFailed = true
          console.warn('[favorites] unexpected insert error, falling back:', e?.message || e)
        }
      }
      // Always maintain local state so UI reflects action even if remote failed
      setItems((prev) => (prev.some((i) => i.product.id === product.id) ? prev : [{ product, createdAt: Date.now() }, ...prev]))
      if (supabaseFailed) {
        // Optionally could surface a toast later; silent fallback for now.
      }
    }
    const remove = async (productId: string) => {
      if (!user) { throw new Error('LOGIN_REQUIRED') }
      let supabaseFailed = false
      if (useSupabase && supabase) {
        try {
          const { error } = await supabase.from('favorites').delete().match({ user_id: user.id, product_id: productId })
          if (error) {
            supabaseFailed = true
            console.warn('[favorites] delete failed, falling back local only:', error.message)
          }
        } catch (e:any) {
          supabaseFailed = true
          console.warn('[favorites] unexpected delete error:', e?.message || e)
        }
      }
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
      if (supabaseFailed) {
        // Could re-queue a sync attempt later.
      }
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

export function useFavorites() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
