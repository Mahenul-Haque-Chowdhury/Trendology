"use client"
import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'
import { useAuth } from './auth'

export type ProductQuestion = {
  id: number
  product_id: string
  user_id: string
  question: string
  answer: string | null
  created_at: string
  answered_at: string | null
}

export function useProductQnA(productId: string | undefined) {
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const [items, setItems] = useState<ProductQuestion[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!productId || !supabase || !isSupabaseConfigured()) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('product_qna')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (!error && Array.isArray(data)) setItems(data as any)
    } finally { setLoading(false) }
  }, [productId, supabase])

  useEffect(() => { load() }, [load])

  const ask = useCallback(async (question: string) => {
    if (!supabase || !isSupabaseConfigured()) throw new Error('SUPABASE_DISABLED')
    if (!user) throw new Error('LOGIN_REQUIRED')
    if (!productId) throw new Error('MISSING_PRODUCT')
    const { error } = await supabase.from('product_qna').insert({ product_id: productId, user_id: user.id, question })
    if (error) throw error
    await load()
  }, [supabase, user, productId, load])

  return { items, loading, ask, reload: load }
}
