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

const Key = 'storefront.addresses.v1'

export function useAddresses(userId?: string) {
  const [items, setItems] = useState<Address[]>([])
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!userId) { setItems([]); return }
      if (supabase) {
        const { data, error } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
        if (!cancelled) setItems(error ? [] : (data as Address[]) || [])
        return
      }
      try {
        const raw = localStorage.getItem(`${Key}:${userId}`)
        const parsed = raw ? (JSON.parse(raw) as Address[]) : []
        if (!cancelled) setItems(parsed)
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [userId, supabase])

  function saveLocal(next: Address[]) {
    setItems(next)
    if (!userId) return
    try { localStorage.setItem(`${Key}:${userId}`, JSON.stringify(next)) } catch {}
  }

  return {
    addresses: items,
    hasAny: items.length > 0,
    defaultAddress: useMemo(() => items.find(a => a.is_default) || items[0], [items]),
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
        if (res.data) setItems(res.data as Address[])
        return data?.id as string
      }
      const id = 'ADDR-' + Date.now().toString(36)
      const next = [...items]
      const newAddr: Address = { ...addr, id, user_id: userId, created_at: new Date().toISOString() }
      if (addr.is_default) next.forEach(a => a.is_default = false)
      next.unshift(newAddr)
      saveLocal(next)
      return id
    },
    async remove(id: string) {
      if (!userId) throw new Error('LOGIN_REQUIRED')
      if (supabase) {
        await supabase.from('user_addresses').delete().eq('user_id', userId).eq('id', id)
        const res = await supabase.from('user_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false })
        if (res.data) setItems(res.data as Address[])
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
        if (res.data) setItems(res.data as Address[])
        return
      }
      saveLocal(items.map(a => ({ ...a, is_default: a.id === id })))
    }
  }
}
