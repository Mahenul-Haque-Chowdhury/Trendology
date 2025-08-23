"use client"
import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export type Address = {
  id?: string
  user_id?: string
  label?: string
  recipient?: string
  phone?: string
  address_line?: string
  city?: string
  country?: string
  is_default?: boolean
  created_at?: string
}

const Key = 'trendology.addresses.v1'

// Module-level cache to dedupe fetches across Strict Mode double-invocation and multiple consumers.
const addressCache = new Map<string, Address[]>()
const inFlight = new Map<string, Promise<Address[]>>()
const loadedOnce = new Set<string>()

export function useAddresses(userId?: string) {
  const [items, setItems] = useState<Address[]>([])
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null

  useEffect(() => {
    let cancelled = false
    async function loadOnce() {
      if (!userId) { setItems([]); return }
      // Serve from cache if available
      const cached = addressCache.get(userId)
      if (cached) { setItems(cached); return }
      // Try sessionStorage cache to avoid a fresh network call on navigation/refresh
      try {
        const sess = typeof window !== 'undefined' ? sessionStorage.getItem(`${Key}:ss:${userId}`) : null
        if (sess) {
          const parsed = JSON.parse(sess) as Address[]
          addressCache.set(userId, parsed)
          setItems(parsed)
          // If we've already loaded once this session, don't refetch now
          if (loadedOnce.has(userId)) return
        }
      } catch {}
      // Deduplicate concurrent loads
      if (inFlight.has(userId)) {
        try {
          const data = await inFlight.get(userId)!
          if (!cancelled) setItems(data)
        } catch {}
        return
      }
      const p = (async () => {
        if (isSupabaseConfigured()) {
          const client = getSupabaseClient()!
          const { data, error } = await client
            .from('user_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })
          if (error) return [] as Address[]
          return (data as Address[]) || []
        }
        try {
          // Legacy migration
          try {
            const legacy = localStorage.getItem(`storefront.addresses.v1:${userId}`)
            if (legacy && !localStorage.getItem(`${Key}:${userId}`)) {
              localStorage.setItem(`${Key}:${userId}`, legacy)
            }
          } catch {}
          const raw = localStorage.getItem(`${Key}:${userId}`)
          return raw ? (JSON.parse(raw) as Address[]) : []
        } catch { return [] as Address[] }
      })()
      inFlight.set(userId, p)
      const data = await p
      inFlight.delete(userId)
      addressCache.set(userId, data)
      // Save to sessionStorage for this session and mark as loaded
      try { if (typeof window !== 'undefined') sessionStorage.setItem(`${Key}:ss:${userId}`, JSON.stringify(data)) } catch {}
      loadedOnce.add(userId)
      if (!cancelled) setItems(data)
    }
    loadOnce()
    return () => { cancelled = true }
  }, [userId])

  function saveLocal(next: Address[]) {
    setItems(next)
    if (!userId) return
    addressCache.set(userId, next)
    try { localStorage.setItem(`${Key}:${userId}`, JSON.stringify(next)) } catch {}
  }

  return {
    addresses: items,
    hasAny: items.length > 0,
    defaultAddress: useMemo(() => items.find(a => a.is_default) || items[0], [items]),
    async update(id: string, patch: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>) {
      if (!userId) throw new Error('LOGIN_REQUIRED')
      if (supabase) {
        const { error } = await supabase
          .from('user_addresses')
          .update(patch)
          .eq('user_id', userId)
          .eq('id', id)
        if (error) throw error
        // If turning this one default, unset others
        if (patch.is_default) {
          await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId).neq('id', id)
        }
        const res = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
        if (res.data) {
          const list = res.data as Address[]
          setItems(list)
          addressCache.set(userId, list)
          try { if (typeof window !== 'undefined') sessionStorage.setItem(`${Key}:ss:${userId}`, JSON.stringify(list)) } catch {}
          loadedOnce.add(userId)
        }
        return
      }
      const next = items.map((a) => (a.id === id ? { ...a, ...patch } : a))
      if (patch.is_default) next.forEach((a) => { if (a.id !== id) a.is_default = false })
      saveLocal(next)
    },
    async add(addr: Omit<Address, 'id' | 'user_id' | 'created_at'>) {
      if (!userId) throw new Error('LOGIN_REQUIRED')
      if (supabase) {
        const { data, error } = await supabase
          .from('user_addresses')
          .insert({ ...addr, user_id: userId })
          .select('*')
          .single()
        if (error) throw error
        // If set default, unset others
        if (data?.is_default) {
          await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId).neq('id', data.id)
        }
        // reload
        const res = await supabase.from('user_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false })
        if (res.data) {
          const list = res.data as Address[]
          setItems(list)
          addressCache.set(userId, list)
          try { if (typeof window !== 'undefined') sessionStorage.setItem(`${Key}:ss:${userId}`, JSON.stringify(list)) } catch {}
          loadedOnce.add(userId)
        }
        // Persist a checkout prefill hint
        try {
          const preferred = res.data?.find((a: any) => a.is_default) || data
          if (preferred) localStorage.setItem(`storefront.checkout.prefill.${userId}`, JSON.stringify(preferred))
        } catch {}
        return data?.id as string
      }
      const id = 'ADDR-' + Date.now().toString(36)
      const next = [...items]
      const newAddr: Address = { ...addr, id, user_id: userId, created_at: new Date().toISOString() }
      if (addr.is_default) next.forEach(a => a.is_default = false)
      next.unshift(newAddr)
      saveLocal(next)
      // Persist a checkout prefill hint
      try { localStorage.setItem(`storefront.checkout.prefill.${userId}`, JSON.stringify(newAddr)) } catch {}
      return id
    },
    async remove(id: string) {
      if (!userId) throw new Error('LOGIN_REQUIRED')
      if (supabase) {
        await supabase.from('user_addresses').delete().eq('user_id', userId).eq('id', id)
        const res = await supabase.from('user_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false })
        if (res.data) {
          const list = res.data as Address[]
          setItems(list)
          addressCache.set(userId, list)
          try { if (typeof window !== 'undefined') sessionStorage.setItem(`${Key}:ss:${userId}`, JSON.stringify(list)) } catch {}
          loadedOnce.add(userId)
        }
        return
      }
      saveLocal(items.filter(a => a.id !== id))
    },
    async setDefault(id: string) {
      if (!userId) throw new Error('LOGIN_REQUIRED')
      if (supabase) {
        await supabase.from('user_addresses').update({ is_default: true }).eq('user_id', userId).eq('id', id)
        await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId).neq('id', id)
        const res = await supabase.from('user_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false })
        if (res.data) {
          setItems(res.data as Address[])
          addressCache.set(userId, res.data as Address[])
        }
        return
      }
      saveLocal(items.map(a => ({ ...a, is_default: a.id === id })))
    }
  }
}
