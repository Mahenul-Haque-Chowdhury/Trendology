"use client"
import { useEffect, useMemo, useState } from 'react'
import { products as seed, type Product } from './products'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

const Key = 'storefront.products.v1'

export function useCatalog() {
  const [items, setItems] = useState<Product[]>(seed)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
        console.debug('[catalog] Supabase configured; fetching products…')
        let tableTried: 'products' | 'inventory' = 'products'
        let data: any[] | null = null
        let error: any = null
        try {
          const res = await supabase.from('products').select('*')
          data = res.data
          error = res.error
          if (error) throw error
          if (!data || data.length === 0) {
            // Back-compat fallback to "inventory" table if "products" is empty
            tableTried = 'inventory'
            const res2 = await supabase.from('inventory').select('*')
            data = res2.data
            error = res2.error
          }
        } catch (e) {
          console.debug('[catalog] products query failed; trying inventory…')
          tableTried = 'inventory'
          const res2 = await supabase.from('inventory').select('*')
          data = res2.data
          error = res2.error
        }
        if (error) {
          console.error(`[catalog] Supabase ${tableTried} error:`, error)
        } else {
          console.debug(`[catalog] Supabase ${tableTried} rows:`, data?.length ?? 0)
        }
        if (!cancelled && data && !error && data.length > 0) {
          setItems(
            data.map((d: any) => ({
              id: d.id,
              name: d.name,
              description: d.description ?? '',
              price: Number(d.price ?? 0),
              image: d.image ?? '',
              images: Array.isArray(d.images) ? d.images : [],
              category: d.category ?? 'misc',
              tags: Array.isArray(d.tags) ? d.tags : [],
            }))
          )
          return
        }
      }
      // Fallback to seed + local overrides
  console.debug('[catalog] Using fallback seed/local products')
      if (typeof window === 'undefined') return
      try {
        const raw = localStorage.getItem(Key)
        const extra = raw ? (JSON.parse(raw) as Product[]) : []
        const byId = new Map<string, Product>()
        for (const p of seed) byId.set(p.id, p)
        for (const p of extra) byId.set(p.id, p)
        if (!cancelled) setItems(Array.from(byId.values()))
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [])

  function save(next: Product[]) {
    setItems(next)
    try { localStorage.setItem(Key, JSON.stringify(next.filter((p) => !seed.find((s) => s.id === p.id) || p !== seed.find((s) => s.id === p.id)))) } catch {}
  }

  return {
    products: items,
    categories: useMemo(() => Array.from(new Set(items.map((p) => p.category))).sort(), [items]),
    async add(p: Omit<Product, 'id'>) {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
        const { data, error } = await supabase
          .from('products')
          .insert({ ...p, active: true })
          .select('*')
          .single()
        if (error) {
          console.error('[catalog] add(product) failed:', error?.message)
        }
        if (!error && data) {
          await loadProductsFromSupabase(setItems)
          return data.id as string
        }
      }
      const id = 'P-' + Date.now().toString(36)
      const next = [...items, { ...p, id }]
      save(next)
      return id
    },
  async update(p: Product) {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
    const { error } = await supabase.from('products').update({
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          images: p.images,
          category: p.category,
          tags: p.tags,
          active: true,
    }).eq('id', p.id)
    if (error) console.error('[catalog] update(product) failed:', error?.message)
        await loadProductsFromSupabase(setItems)
        return
      }
      const next = items.map((it) => (it.id === p.id ? p : it))
      save(next)
    },
  async remove(id: string) {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) console.error('[catalog] remove(product) failed:', error?.message)
        await loadProductsFromSupabase(setItems)
        return
      }
      const next = items.filter((it) => it.id !== id)
      save(next)
    },
  }
}

async function loadProductsFromSupabase(setItems: (p: Product[]) => void) {
  const supabase = getSupabaseClient()!
  let data: any[] | null = null
  let res = await supabase.from('products').select('*')
  data = res.data
  if (!data || data.length === 0 || res.error) {
    res = await supabase.from('inventory').select('*')
    data = res.data
  }
  if (data) {
    setItems(
      data.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description ?? '',
        price: Number(d.price ?? 0),
        image: d.image ?? '',
        images: Array.isArray(d.images) ? d.images : [],
        category: d.category ?? 'misc',
        tags: Array.isArray(d.tags) ? d.tags : [],
      }))
    )
  }
}
